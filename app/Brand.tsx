import Image from 'next/image';

export default function Brand({ subtitle }: { subtitle?: string }) {
  return (
    <div className="brand">
      <Image
        src="/logo.png"
        alt="Endre & Malene — 4. juli 2026"
        width={152}
        height={174}
        priority
        className="logo"
      />
      <p>{subtitle ?? 'Del bildene og videoene dine fra bryllupet'}</p>
    </div>
  );
}
