import { type NextRequest, NextResponse } from "next/server";

/**
 * Path-based proxy route for private Vercel Blob images.
 * Reconstructs the full blob URL from the path segments and fetches it
 * server-side using BLOB_READ_WRITE_TOKEN.
 *
 * Usage: GET /api/blob/<blob-pathname>
 * e.g.   /api/blob/image-abc123.png
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> },
) {
  const { pathname } = await params;
  const blobPathname = pathname.join("/");

  if (!blobPathname) {
    return NextResponse.json({ error: "Missing blob pathname" }, { status: 400 });
  }

  const blobBaseUrl = process.env.BLOB_BASE_URL;
  if (!blobBaseUrl) {
    console.error("❌ BLOB_BASE_URL env var is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const fullBlobUrl = `${blobBaseUrl}/${blobPathname}`;

  try {
    const response = await fetch(fullBlobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error("❌ Blob fetch failed:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch blob" },
        { status: response.status },
      );
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const body = response.body;

    if (!body) {
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache for 1 year — blob URLs are immutable (random suffix)
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("❌ Blob proxy error:", error);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
