import { File } from 'expo-file-system';

import { log } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const SCOPE = 'api/storage';

// The private bucket created in the backend. Each user can only touch files
// under a folder named after their own id (enforced by storage RLS policies).
const BUCKET = 'receipts';

// Uploads a local image to the user's folder and returns its STORAGE PATH
// (e.g. "<userId>/169...jpg"). We store that path in transactions.receipt_url;
// because the bucket is private, displaying it needs a signed URL (below).
export async function uploadReceipt(
  userId: string,
  uri: string,
  mimeType?: string | null,
): Promise<string> {
  // expo-file-system v19: a File implements Blob, so .bytes() gives the raw
  // Uint8Array that Supabase Storage can upload directly (no base64 dance).
  const bytes = await new File(uri).bytes();

  const contentType = mimeType ?? 'image/jpeg';
  const ext = contentType.includes('png') ? 'png' : 'jpg';
  // The path MUST start with the user's id — the bucket's RLS policy checks
  // that the first folder equals auth.uid().
  const path = `${userId}/${Date.now()}.${ext}`;
  log.info(SCOPE, 'uploadReceipt', { path, bytes: bytes.length, contentType });

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType, upsert: false });
  if (error) {
    log.error(SCOPE, 'uploadReceipt failed', error.message);
    throw new Error(error.message);
  }
  log.info(SCOPE, 'uploadReceipt ok', { path });
  return path;
}

// Creates a short-lived signed URL so a private receipt can be shown in an
// <Image>. Defaults to one hour.
export async function getReceiptSignedUrl(
  path: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) {
    log.error(SCOPE, 'getReceiptSignedUrl failed', error.message);
    throw new Error(error.message);
  }
  return data.signedUrl;
}
