import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public", "logo.png");

const BACKGROUND = "#ffffff";
const MASKABLE_SAFE_RATIO = 0.8;

async function plain(size, out) {
  await sharp(source)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(path.join(root, out));
  console.log(`generado ${out} (${size}x${size})`);
}

async function maskable(size, out) {
  const inner = Math.round(size * MASKABLE_SAFE_RATIO);
  const logo = await sharp(source)
    .resize(inner, inner, { fit: "contain" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(root, out));
  console.log(`generado ${out} (${size}x${size}, maskable)`);
}

await Promise.all([
  plain(192, "public/icon-192x192.png"),
  plain(512, "public/icon-512x512.png"),
  maskable(512, "public/icon-maskable-512x512.png"),
  plain(512, "app/icon.png"),
  plain(180, "app/apple-icon.png"),
]);
