import { readManifest, removeVideo, addVideo, CATEGORIES } from "@/lib/manifest";
import { NextResponse } from "next/server";

export async function GET() {
  const manifest = await readManifest();
  return NextResponse.json(manifest);
}

export async function POST(request) {
  const { url, category, label, password } = await request.json();

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  if (!url || !CATEGORIES.some((c) => c.id === category)) {
    return NextResponse.json({ error: "Missing or invalid data." }, { status: 400 });
  }

  const entry = await addVideo({ url, category, label: label || "" });
  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(request) {
  const { id, password } = await request.json();

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  await removeVideo(id);
  return NextResponse.json({ ok: true });
}
