import { NextRequest, NextResponse } from "next/server";

const PINATA_JWT = process.env.PINATA_JWT;

export async function POST(request: NextRequest) {
  if (!PINATA_JWT) {
    return NextResponse.json({ error: "PINATA_JWT is not configured" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const pinataForm = new FormData();
    pinataForm.append("file", file);
    pinataForm.append(
      "pinataMetadata",
      JSON.stringify({ name: (file as File).name || "card" })
    );
    pinataForm.append(
      "pinataOptions",
      JSON.stringify({ cidVersion: 1 })
    );

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: pinataForm,
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: body }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Pinata upload failed:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed" },
      { status: 500 }
    );
  }
}
