// Renders icons/icon.svg into the PNG sizes referenced by manifest.json.
//
// macOS ships no SVG rasterizer that honours transparency here: qlmanage composites
// the transparent areas onto white. So the SVG is drawn as a full-bleed square and
// the rounded corners are punched out afterwards by rewriting the alpha channel,
// which keeps the corners genuinely transparent without extra tooling.
//
// Usage:
//   node scripts/build-icons.mjs

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ICONS = path.join(ROOT, "icons");
const SOURCE = path.join(ICONS, "icon.svg");
const SIZES = [48, 96, 128];
const RADIUS_RATIO = 26 / 128; // matches the corner radius the artwork is drawn for
const SAMPLES = 4; // per-axis supersampling used to antialias the corner edge

const PNG_MAGIC = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readChunks(buffer) {
  const chunks = [];
  let offset = PNG_MAGIC.length;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    chunks.push({ data, type });
    offset += length + 12;
  }

  return chunks;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);

  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");

  const crc = Buffer.alloc(4);

  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);

  return Buffer.concat([head, data, crc]);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;

  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;

  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;

  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);

  return (c ^ 0xffffffff) >>> 0;
}

/** Undoes the per-scanline PNG filters and returns raw RGBA rows. */
function decode(buffer) {
  const chunks = readChunks(buffer);
  const ihdr = chunks.find((c) => c.type === "IHDR").data;
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const depth = ihdr[8];
  const colorType = ihdr[9];

  if (depth !== 8 || colorType !== 6) {
    throw new Error(`Unsupported PNG: depth ${depth}, color type ${colorType}`);
  }

  const raw = zlib.inflateSync(
    Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.data)),
  );
  const stride = width * 4;
  const pixels = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));

    for (let x = 0; x < stride; x += 1) {
      const a = x >= 4 ? pixels[y * stride + x - 4] : 0;
      const b = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const c = x >= 4 && y > 0 ? pixels[(y - 1) * stride + x - 4] : 0;
      let value = line[x];

      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);

        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }

      pixels[y * stride + x] = value & 0xff;
    }
  }

  return { height, pixels, width };
}

function encode({ height, pixels, width }) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);

  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    PNG_MAGIC,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Fraction of a pixel that falls inside the rounded square, by supersampling. */
function coverage(x, y, size, radius) {
  let inside = 0;

  for (let sy = 0; sy < SAMPLES; sy += 1) {
    for (let sx = 0; sx < SAMPLES; sx += 1) {
      const px = x + (sx + 0.5) / SAMPLES;
      const py = y + (sy + 0.5) / SAMPLES;
      const dx = Math.max(radius - px, px - (size - radius), 0);
      const dy = Math.max(radius - py, py - (size - radius), 0);

      if (dx * dx + dy * dy <= radius * radius) inside += 1;
    }
  }

  return inside / (SAMPLES * SAMPLES);
}

function roundCorners(image) {
  const { height: size, pixels } = image;
  const radius = size * RADIUS_RATIO;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nearCorner =
        (x < radius || x > size - radius) && (y < radius || y > size - radius);

      if (!nearCorner) continue;

      const index = (y * size + x) * 4 + 3;

      pixels[index] = Math.round(pixels[index] * coverage(x, y, size, radius));
    }
  }

  return image;
}

for (const size of SIZES) {
  const out = path.join(ICONS, `icon-${size}.png`);

  fs.rmSync(out, { force: true });
  execFileSync("qlmanage", ["-t", "-s", String(size), "-o", ICONS, SOURCE], {
    stdio: "ignore",
  });
  fs.renameSync(path.join(ICONS, "icon.svg.png"), out);
  fs.writeFileSync(out, encode(roundCorners(decode(fs.readFileSync(out)))));
  console.log(`icons/icon-${size}.png`);
}
