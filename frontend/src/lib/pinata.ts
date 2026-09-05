/**
 * Helper for uploading card images + metadata JSON to IPFS via Pinata.
 *
 * Set the following env vars in `frontend/.env.local`:
 *   PINATA_JWT=your_pinata_jwt
 *   NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
 */

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API = "https://api.pinata.cloud";
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

export interface UploadedFile {
  cid: string;
  ipfsUri: string;
  httpUrl: string;
}

/**
 * Upload a raw file (image) to Pinata. Runs on the server route so the JWT
 * is never exposed to the browser.
 */
async function uploadFile(file: Blob, name: string): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file, name);

  const res = await fetch("/api/pinata", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinata upload failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const cid = data.IpfsHash as string;
  return toUploadedFile(cid);
}

/**
 * Upload a JSON blob (metadata) to Pinata.
 */
async function uploadJson(json: unknown, name: string): Promise<UploadedFile> {
  const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
  return uploadFile(blob, name);
}

/**
 * End-to-end: upload an image, build card metadata, then upload the metadata JSON.
 * Returns the metadata `ipfs://...` URI to pass to `mintCard(metadataURI)`.
 */
export async function uploadCardMetadata(params: {
  image: Blob;
  name: string;
  description: string;
  attributes: { trait_type: string; value: string | number }[];
}): Promise<string> {
  const { image, name, description, attributes } = params;

  const imageUpload = await uploadFile(image, `card-image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`);

  const metadata = {
    name,
    description,
    image: imageUpload.ipfsUri,
    attributes,
  };

  const metadataUpload = await uploadJson(metadata, `card-metadata-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`);

  return metadataUpload.ipfsUri;
}

function toUploadedFile(cid: string): UploadedFile {
  return {
    cid,
    ipfsUri: `ipfs://${cid}`,
    httpUrl: `${PINATA_GATEWAY}${cid}`,
  };
}

export { PINATA_GATEWAY };
