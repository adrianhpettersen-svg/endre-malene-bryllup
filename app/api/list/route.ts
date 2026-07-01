import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Bla gjennom ALLE sider (Blob returnerer maks 1000 per kall)
    const blobs: Awaited<ReturnType<typeof list>>['blobs'] = [];
    let cursor: string | undefined;
    for (;;) {
      const res = await list({ limit: 1000, cursor });
      blobs.push(...res.blobs);
      if (!res.hasMore) break;
      cursor = res.cursor;
    }
    const items = blobs
      .map((b) => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return NextResponse.json({ items });
  } catch (e) {
    // Om BLOB_READ_WRITE_TOKEN mangler (f.eks. før deploy) → tom liste i stedet for krasj
    return NextResponse.json({ items: [], error: (e as Error).message });
  }
}
