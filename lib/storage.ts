// lib/storage.ts
// Supabase Storage — replaces Cloudflare R2 entirely.
// Buckets: "dish-videos" and "dish-thumbnails" (both public)

import { createServiceClient } from "./supabase";

const VIDEO_BUCKET = "dish-videos";
const THUMB_BUCKET = "dish-thumbnails";

/**
 * Upload a video file and return its public URL.
 * key example: "brew-lab/paneer-tikka.mp4"
 */
export async function uploadVideo(
  key: string,
  body: Buffer | Blob,
  contentType: string = "video/mp4"
): Promise<string> {
  const supabase = createServiceClient();

  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(key, body, { contentType, upsert: true });

  if (error) throw new Error(`Video upload failed: ${error.message}`);

  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Upload a thumbnail image and return its public URL.
 * key example: "brew-lab/paneer-tikka.jpg"
 */
export async function uploadThumbnail(
  key: string,
  body: Buffer | Blob,
  contentType: string = "image/jpeg"
): Promise<string> {
  const supabase = createServiceClient();

  const { error } = await supabase.storage
    .from(THUMB_BUCKET)
    .upload(key, body, { contentType, upsert: true });

  if (error) throw new Error(`Thumbnail upload failed: ${error.message}`);

  const { data } = supabase.storage.from(THUMB_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Delete a video by its storage key.
 */
export async function deleteVideo(key: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.storage.from(VIDEO_BUCKET).remove([key]);
}

/**
 * Delete a thumbnail by its storage key.
 */
export async function deleteThumbnail(key: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.storage.from(THUMB_BUCKET).remove([key]);
}

/**
 * Extract the storage key from a full public URL.
 * Useful when deleting — you stored the full URL in the DB.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/dish-videos/brew-lab/foo.mp4"
 *   → "brew-lab/foo.mp4"
 */
export function extractKey(publicUrl: string, bucket: string): string {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return publicUrl;
  return publicUrl.slice(idx + marker.length);
}
