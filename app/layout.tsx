import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Endre & Malene — Del bildene dine',
  description: 'Last opp bildene og videoene dine fra Endre & Malenes bryllup 4. juli 2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
