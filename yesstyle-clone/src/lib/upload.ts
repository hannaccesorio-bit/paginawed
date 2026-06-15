import { createClient } from '@/lib/supabase';

const BUCKET_NAME = 'products';

export async function uploadImage(file: File): Promise<string | null> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const results = await Promise.all(files.map(file => uploadImage(file)));
  return results.filter((url): url is string => url !== null);
}

export async function deleteImage(filePath: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);
  return !error;
}