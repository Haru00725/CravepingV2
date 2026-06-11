// lib/r2.ts
// R2 has been replaced by Supabase Storage.
// This file re-exports from storage.ts so any old imports don't break.
export { uploadVideo as uploadToR2, deleteVideo as deleteFromR2 } from "./storage";
