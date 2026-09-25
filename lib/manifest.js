import { put, list } from "@vercel/blob";

const MANIFEST_PATH = "data/manifest.json";

export const CATEGORIES = [
  { id: "skit", label: "Short-form skits" },
  { id: "ugc", label: "UGC content" },
  { id: "product", label: "Product showcases" },
];

// Finds the current manifest blob (if it exists) and returns its list entry.
async function findManifestBlob() {
  const { blobs } = await list({ prefix: MANIFEST_PATH, limit: 1 });
  return blobs[0] || null;
}

export async function readManifest() {
  try {
    const existing = await findManifestBlob();
    if (!existing) return { videos: [] };
    const res = await fetch(existing.url, { cache: "no-store" });
    if (!res.ok) return { videos: [] };
    return res.json();
  } catch (err) {
    // Most likely cause: no Blob store connected yet (missing
    // BLOB_READ_WRITE_TOKEN). Fail soft so the page still renders.
    console.error("readManifest failed:", err.message);
    return { videos: [] };
  }
}

export async function writeManifest(manifest) {
  await put(MANIFEST_PATH, JSON.stringify(manifest, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function addVideo({ url, category, label }) {
  const manifest = await readManifest();
  const entry = {
    id: crypto.randomUUID(),
    url,
    category,
    label,
    createdAt: new Date().toISOString(),
  };
  manifest.videos.unshift(entry);
  await writeManifest(manifest);
  return entry;
}

export async function removeVideo(id) {
  const manifest = await readManifest();
  manifest.videos = manifest.videos.filter((v) => v.id !== id);
  await writeManifest(manifest);
}
