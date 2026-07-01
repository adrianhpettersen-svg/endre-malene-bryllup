'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Brand from '../Brand';

type Media = { url: string; pathname: string; size: number; uploadedAt: string };

const isVideo = (p: string) => /\.(mp4|mov|m4v|webm|quicktime)$/i.test(p);

export default function Galleri() {
  const [items, setItems] = useState<Media[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Media | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/list', { cache: 'no-store' });
      const d = await r.json();
      setItems(d.items || []);
    } catch { /* ignorer */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // live: hent nye bilder hvert 15. sek
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="gallery-wrap">
      <Brand subtitle="Bildene som strømmer inn fra dagen" />

      <div className="gal-head">
        <h2>Galleriet</h2>
        <span className="count">{items.length} {items.length === 1 ? 'fil' : 'filer'} · oppdateres live</span>
        <Link href="/" className="btn secondary" style={{ marginTop: 0 }}>+ Last opp</Link>
      </div>

      {loaded && items.length === 0 && (
        <div className="empty">Ingen bilder ennå — bli den første til å laste opp! 📷</div>
      )}

      <div className="grid">
        {items.map((m) => (
          <div key={m.url} className="tile" onClick={() => setActive(m)}>
            {isVideo(m.pathname) ? (
              <>
                <video src={m.url} preload="metadata" muted playsInline />
                <div className="play">▶</div>
              </>
            ) : (
              <Image src={m.url} alt="" fill sizes="(max-width: 700px) 33vw, 150px" unoptimized={false} />
            )}
          </div>
        ))}
      </div>

      {active && (
        <div className="lb" onClick={(e) => { if (e.target === e.currentTarget) setActive(null); }}>
          <button className="x" onClick={() => setActive(null)}>✕</button>
          {isVideo(active.pathname)
            ? <video src={active.url} controls autoPlay playsInline />
            : <img src={active.url} alt="" />}
          <div className="dl"><a href={active.url} download target="_blank" rel="noreferrer">Last ned original</a></div>
        </div>
      )}
    </main>
  );
}
