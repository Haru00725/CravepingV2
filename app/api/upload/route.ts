// app/api/upload/route.ts
// Handles video + thumbnail uploads from the admin panel.
// Uses Supabase Storage — no R2 needed.

import { NextRequest, NextResponse } from "next/server";
import { uploadVideo, uploadThumbnail } from "../../../lib/storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const cafe_slug = formData.get("cafe_slug") as string;
    const dish_name = formData.get("dish_name") as string;
    const video = formData.get("video") as File | null;
    const thumbnail = formData.get("thumbnail") as File | null;

    if (!cafe_slug || !dish_name) {
      return NextResponse.json({ error: "cafe_slug and dish_name are required" }, { status: 400 });
    }

    // Sanitise dish name for use as a filename key
    const slug = dish_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const result: { video_url?: string; thumbnail_url?: string } = {};

    if (video) {
      const buffer = Buffer.from(await video.arrayBuffer());
      const key = `${cafe_slug}/${slug}-${Date.now()}.mp4`;
      result.video_url = await uploadVideo(key, buffer, video.type || "video/mp4");
    }

    if (thumbnail) {
      const buffer = Buffer.from(await thumbnail.arrayBuffer());
      const ext = thumbnail.name.split(".").pop() || "jpg";
      const key = `${cafe_slug}/${slug}-${Date.now()}.${ext}`;
      result.thumbnail_url = await uploadThumbnail(key, buffer, thumbnail.type || "image/jpeg");
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[upload POST]", err);
    return NextResponse.json({ error: err.message ?? "Upload failed" }, { status: 500 });
  }
}
