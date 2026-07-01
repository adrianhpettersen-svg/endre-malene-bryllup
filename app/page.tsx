'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { upload } from '@vercel/blob/client';
import Brand from './Brand';

type Item = { name: string; pct: number; status: 'venter' | 'laster' | 'ferdig' | 'feil' };

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setBusy(true);
    const start = items.length;
    setItems((prev) => [...prev, ...list.map((f) => ({ name: f.name, pct: 0, status: 'venter' as const }))]);

    for (let i = 0; i < list.length; i++) {
      const idx = start + i;
      const file = list[i];
      const set = (patch: Partial<Item>) =>
        setItems((prev) => prev.map((it, k) => (k === idx ? { ...it, ...patch } : it)));
      try {
        set({ status: 'laster' });
        await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          onUploadProgress: (p) => set({ pct: Math.round(p.percentage) }),
        });
        set({ status: 'ferdig', pct: 100 });
        setDoneCount((c) => c + 1);
      } catch (e) {
        set({ status: 'feil' });
      }
    }
    setBusy(false);
  }, [items.length]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <main className="wrap">
      <Brand />

      <div
        className={'drop' + (over ? ' over' : '')}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <div className="icon">📷</div>
        <div className="big">Trykk for å velge bilder & videoer</div>
        <div className="small">eller dra dem hit — du kan velge mange på én gang</div>
        <button className="btn" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
          Velg fra telefonen
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
      />

      {items.length > 0 && (
        <div className="files">
          {items.map((it, i) => (
            <div key={i} className={'file ' + (it.status === 'ferdig' ? 'done' : it.status === 'feil' ? 'error' : '')}>
              <div className="name">{it.name}</div>
              {it.status === 'laster' ? (
                <div className="bar"><span style={{ width: it.pct + '%' }} /></div>
              ) : null}
              <div className="state">
                {it.status === 'ferdig' ? '✓' : it.status === 'feil' ? 'feil' : it.status === 'laster' ? it.pct + '%' : '…'}
              </div>
            </div>
          ))}
        </div>
      )}

      {doneCount > 0 && !busy && (
        <div className="done-msg">
          🎉 Takk! <strong>{doneCount}</strong> {doneCount === 1 ? 'fil' : 'filer'} lastet opp. Du kan legge til flere når som helst.
        </div>
      )}

      <div className="row">
        <Link href="/galleri" className="btn secondary">Se galleriet →</Link>
      </div>

      <div className="foot">
        Bildene samles til Endre &amp; Malene. Takk for at du deler minnene fra dagen! 💛
      </div>
    </main>
  );
}
