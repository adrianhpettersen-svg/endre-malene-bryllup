export default function Brand({ subtitle }: { subtitle?: string }) {
  return (
    <div className="brand">
      <div className="badge" aria-hidden>
        <div className="top">Endre &amp; Malene</div>
        <div className="mono">E&amp;M</div>
        <div className="date">4. juli 2026</div>
      </div>
      <h1>Endre &amp; Malene</h1>
      <p>{subtitle ?? 'Del bildene og videoene dine fra bryllupet'}</p>
    </div>
  );
}
