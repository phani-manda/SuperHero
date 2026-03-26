import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Upload winner proof to Supabase Storage
 * @param supabase - Supabase client instance
 * @param userId - User ID (for folder organization)
 * @param winnerId - Winner record ID
 * @param file - File to upload
 * @returns Public URL and error if any
 */
export async function uploadWinnerProof(
  supabase: SupabaseClient,
  userId: string,
  winnerId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'),
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        url: null,
        error: new Error('File too large. Maximum size is 5MB.'),
      };
    }

    // Create file path: userId/winnerId-timestamp.ext
    const fileExt = file.name.split('.').pop();
    const fileName = `${winnerId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    // Get public URL
    const { data } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err : new Error('Upload failed'),
    };
  }
}

/**
 * Upload charity event image to Supabase Storage
 * @param supabase - Supabase client instance
 * @param charityId - Charity ID
 * @param file - Image file to upload
 * @returns Public URL and error if any
 */
export async function uploadCharityEventImage(
  supabase: SupabaseClient,
  charityId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: new Error('Invalid file type. Only images are allowed.'),
      };
    }

    // Validate file size (max 2MB for images)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return {
        url: null,
        error: new Error('Image too large. Maximum size is 2MB.'),
      };
    }

    // Create file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${charityId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('charity-events')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    // Get public URL
    const { data } = supabase.storage
      .from('charity-events')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err : new Error('Upload failed'),
    };
  }
}

/**
 * Upload charity media to Supabase Storage
 * @param supabase - Supabase client instance
 * @param charityId - Charity ID
 * @param file - Media file to upload
 * @returns Public URL and error if any
 */
export async function uploadCharityMedia(
  supabase: SupabaseClient,
  charityId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: new Error('Invalid file type. Only images and videos are allowed.'),
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        url: null,
        error: new Error('File too large. Maximum size is 10MB.'),
      };
    }

    // Create file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${charityId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('charity-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    // Get public URL
    const { data } = supabase.storage
      .from('charity-media')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err : new Error('Upload failed'),
    };
  }
}
