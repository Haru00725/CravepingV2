// hooks/useUpload.ts
// React hook for uploading dish videos + thumbnails to Supabase Storage
// via the /api/upload endpoint. Use this in the admin panel.

import { useState } from "react";

interface UploadResult {
  video_url?: string;
  thumbnail_url?: string;
}

interface UseUploadReturn {
  upload: (params: {
    cafe_slug: string;
    dish_name: string;
    video?: File;
    thumbnail?: File;
  }) => Promise<UploadResult>;
  uploading: boolean;
  progress: number;   // 0–100 (estimated)
  error: string | null;
  reset: () => void;
}

export function useUpload(): UseUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setUploading(false); setProgress(0); setError(null); };

  const upload = async ({
    cafe_slug,
    dish_name,
    video,
    thumbnail,
  }: {
    cafe_slug: string;
    dish_name: string;
    video?: File;
    thumbnail?: File;
  }): Promise<UploadResult> => {
    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("cafe_slug", cafe_slug);
      formData.append("dish_name", dish_name);
      if (video) formData.append("video", video);
      if (thumbnail) formData.append("thumbnail", thumbnail);

      setProgress(30);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(90);

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? "Upload failed");
      }

      const result: UploadResult = await res.json();
      setProgress(100);
      return result;
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error, reset };
}
