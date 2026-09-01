"use client";

import { useState } from "react";
import { uploadCardMetadata } from "../lib/pinata";

interface UploadParams {
  image: File;
  name: string;
  description: string;
  attributes: { trait_type: string; value: string | number }[];
}

/**
 * Custom hook that uploads a card image + metadata to IPFS via Pinata.
 * Returns a loading flag, an error, and a function to trigger the upload.
 */
export function useIPFS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(params: UploadParams): Promise<string> {
    setLoading(true);
    setError(null);
    try {
      const metadataUri = await uploadCardMetadata({
        image: params.image,
        name: params.name,
        description: params.description,
        attributes: params.attributes,
      });
      return metadataUri;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { upload, loading, error };
}
