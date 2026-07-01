# Endre & Malene — Bildedeling 📷

Gjestene skanner en QR-kode → laster opp bilder & video fra bryllupet (ingen app, ingen konto). Alt samles ett sted, og et **live-galleri** viser bildene som strømmer inn.

- **Design:** hvit bakgrunn, sort tekst (E&M-profil)
- **Stack:** Next.js 16 (App Router) + Vercel Blob
- **Sider:** `/` (opplasting), `/galleri` (live-galleri)
- Store filer (video) lastes **direkte til Blob** fra nettleseren via klient-opplasting (`/api/upload` genererer token) — billig og robust.

## Kjør lokalt
```bash
npm install
# Trenger et Blob-token for at opplasting/galleri skal virke:
echo "BLOB_READ_WRITE_TOKEN=<token fra Vercel>" > .env.local
npm run dev            # → http://localhost:3000
```

## Deploy til Vercel
1. Push dette repoet til GitHub (kontoen **adrianhpettersen-svg**).
2. På vercel.com: **Add New → Project** → importer repoet.
3. **Storage → Create Database → Blob** → koble til prosjektet. Da settes `BLOB_READ_WRITE_TOKEN` automatisk.
4. Deploy. Du får en URL, f.eks. `https://endre-malene.vercel.app`.
5. Lag QR-kode som peker til URL-en (f.eks. `npx qrcode "https://…" -o qr.png`) → print på bordene.

## Innstillinger
- **Maks filstørrelse:** 500 MB/fil (`app/api/upload/route.ts`) — rom for video.
- **Tillatte typer:** bilder + video (`allowedContentTypes` samme sted).
- **Kostnad:** lagring ~$0,023/GB/mnd (neglisjerbart). Galleriet viser nedskalerte
  thumbnails (Next Image) så dataoverføring holdes lav. Pro-plan ($20/mnd) gir trygg
  buffer for bryllupsmåneden — kan sies opp etterpå.

## Etter bryllupet
Last ned alt (Blob-dashboard eller `list()` + nedlasting), så kan Blob-storen tømmes/Pro sies opp.
