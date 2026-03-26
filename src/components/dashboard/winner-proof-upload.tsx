'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadWinnerProof } from '@/lib/supabase/storage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WinnerProofUploadProps {
  winner: {
    id: string;
    user_id: string;
    prize_amount: number;
    match_type: string;
  };
}

export function WinnerProofUpload({ winner }: WinnerProofUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  }

  async function handleUpload() {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();

      // Upload file to Supabase Storage
      const { url, error } = await uploadWinnerProof(
        supabase,
        winner.user_id,
        winner.id,
        file
      );

      if (error || !url) {
        throw error || new Error('Upload failed');
      }

      // Update winner record via API
      const res = await fetch('/api/winners/upload-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId: winner.id,
          proofUrl: url,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Proof uploaded successfully! Admin will review your submission.');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Upload Proof of Win
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        You won ₹{(winner.prize_amount / 100).toFixed(2)} in the {winner.match_type}!
        Please upload a screenshot or document as proof to claim your prize.
      </p>

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File (JPG, PNG, or PDF)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-brand-50 file:text-brand-700
              hover:file:bg-brand-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum file size: 5MB
          </p>
        </div>

        {/* Preview */}
        {preview && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
            />
          </div>
        )}

        {/* File Info */}
        {file && !preview && (
          <div className="text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          variant="primary"
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Proof'}
        </Button>
      </div>
    </div>
  );
}
