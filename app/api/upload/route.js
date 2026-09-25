import { handleUpload } from "@vercel/blob/client";
import { CATEGORIES } from "@/lib/manifest";
import { NextResponse } from "next/server";

// This route no longer receives the video file itself (that would hit
// Vercel's ~4.5MB request body limit for serverless functions). Instead it
// issues a short-lived token so the browser can upload directly to Blob
// storage, bypassing the function entirely for the large binary.
export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = clientPayload ? JSON.parse(clientPayload) : {};

        if (
          !process.env.ADMIN_PASSWORD ||
          payload.password !== process.env.ADMIN_PASSWORD
        ) {
          throw new Error("Incorrect password.");
        }
        if (!CATEGORIES.some((c) => c.id === payload.category)) {
          throw new Error("Invalid category.");
        }

        return {
          allowedContentTypes: ["video/mp4", "video/quicktime", "video/webm"],
          addRandomSuffix: true,
        };
      },
      // Metadata (category/label) is saved separately by the admin page
      // right after the direct upload finishes — see app/admin/page.js.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
