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
  const [adminCode, setAdminCode] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('admin');
    if (code) setAdminCode(code);
  }, []);

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

  const remove = useCallback(async (m: Media) => {
    if (!adminCode) return;
    if (!confirm('Slette denne for godt?')) return;
    try {
      const r = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: m.url, code: adminCode }),
      });
      if (!r.ok) { alert('Kunne ikke slette: ' + (await r.json()).error); return; }
      setItems((prev) => prev.filter((x) => x.url !== m.url));
      setActive(null);
    } catch (e) {
      alert('Feil ved sletting');
    }
  }, [adminCode]);

  return (
    <main className="gallery-wrap">
      <Brand subtitle="Bildene som strømmer inn fra dagen" />

      <div className="gal-head">
        <h2>Galleriet{adminCode ? ' · admin' : ''}</h2>
        <span className="count">{items.length} {items.length === 1 ? 'fil' : 'filer'} · oppdateres live</span>
        <Link href="/" className="btn secondary" style={{ marginTop: 0 }}>+ Last opp</Link>
      </div>

      {loaded && items.length === 0 && (
        <div className="empty">Ingen bilder ennå — bli den første til å laste opp! 📷</div>
      )}

      <div className="grid">
        {items.map((m) => (
          <div key={m.url} className="tile">
            <div className="tile-inner" onClick={() => setActive(m)}>
              {isVideo(m.pathname) ? (
                <>
                  <video src={m.url} preload="metadata" muted playsInline />
                  <div className="play">▶</div>
                </>
              ) : (
                <Image src={m.url} alt="" fill sizes="(max-width: 700px) 33vw, 150px" />
              )}
            </div>
            {adminCode && (
              <button className="del" title="Slett" onClick={(e) => { e.stopPropagation(); remove(m); }}>✕</button>
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
          <div className="dl">
            <a href={active.url} download target="_blank" rel="noreferrer">Last ned original</a>
            {adminCode && <button className="lb-del" onClick={() => remove(active)}>Slett</button>}
          </div>
        </div>
      )}
    </main>
  );
}
