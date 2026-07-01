import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Beskyttet sletting: krever riktig admin-kode (env ADMIN_CODE).
// Gjester har ikke koden, så de kan ikke slette. Bare de som åpner
// /galleri?admin=KODEN får slette-knapper.
export async function POST(request: Request) {
  const admin = process.env.ADMIN_CODE;
  if (!admin) {
    return NextResponse.json({ error: 'ADMIN_CODE er ikke satt' }, { status: 500 });
  }
  let body: { url?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 });
  }
  if (body.code !== admin) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }
  if (!body.url) {
    return NextResponse.json({ error: 'Mangler url' }, { status: 400 });
  }
  try {
    await del(body.url);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
