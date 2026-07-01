import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// Genererer klient-opplastingstokens slik at store filer går DIREKTE til Blob
// (ikke gjennom serverless-funksjonen) — billigere og takler video.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif',
          'video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v',
        ],
        addRandomSuffix: true,
        maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB per fil (rom for video)
      }),
      onUploadCompleted: async () => {
        // valgfritt: her kunne vi logget/varslet ved fullført opplasting
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
