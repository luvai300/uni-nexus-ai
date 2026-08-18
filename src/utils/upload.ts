/**
 * Robust image upload utility with Base64 fallback.
 * Tries Supabase Storage first, falls back to base64 data URL on failure.
 * This guarantees image uploads always work without throwing unhandled errors.
 */

const STORAGE_BUCKET = 'campa-images';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface UploadResult {
  url: string;
  isBase64: boolean;
  file?: File;
}

/**
 * Upload a single image file. Attempts Supabase storage first,
 * falls back to base64 data URL on any failure.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  // Always get base64 as fallback first
  const base64 = await readFileAsBase64(file);

  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${file.name.split('.').pop()}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.warn('[upload] Supabase storage upload failed, using base64 fallback:', error.message);
      return { url: base64, isBase64: true, file };
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, isBase64: false, file };
  } catch (err: any) {
    console.warn('[upload] Supabase storage unavailable, using base64 fallback:', err?.message || err);
    return { url: base64, isBase64: true, file };
  }
}

/**
 * Upload multiple image files concurrently.
 */
export async function uploadImages(files: File[]): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadImage(file)));
}

/**
 * Process a file input change event and return upload results.
 * Handles single and multiple file modes.
 */
export async function handleFileInput(
  event: React.ChangeEvent<HTMLInputElement>,
  maxFiles = 5,
): Promise<UploadResult[]> {
  const files = event.target.files;
  if (!files || files.length === 0) return [];

  const selected = Array.from(files).slice(0, maxFiles);
  return uploadImages(selected);
}

/**
 * Get a preview URL for a file (memo-safe for rendering).
 */
export function getFilePreview(file: File): Promise<string> {
  return readFileAsBase64(file);
}