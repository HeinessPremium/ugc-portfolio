// One-time script: uploads the videos in /seed-videos to Vercel Blob and
// writes the initial manifest. Run locally AFTER you've created the Blob
// store and pulled its token:
//
//   vercel env pull .env.local
//   npm run seed
//
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.join(__dirname, "..", "seed-videos");
const manifestSeed = JSON.parse(
  fs.readFileSync(path.join(seedDir, "manifest-seed.json"), "utf-8")
);

async function main() {
  const videos = [];

  for (const item of manifestSeed) {
    const filePath = path.join(seedDir, item.file);
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`Uploading ${item.file}...`);
    const blob = await put(`videos/${item.file}`, fileBuffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: "video/mp4",
    });
    videos.push({
      id: crypto.randomUUID(),
      url: blob.url,
      category: item.category,
      label: item.label,
      createdAt: new Date().toISOString(),
    });
  }

  console.log("Writing manifest.json...");
  await put("data/manifest.json", JSON.stringify({ videos }, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log(`Done. Seeded ${videos.length} videos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
