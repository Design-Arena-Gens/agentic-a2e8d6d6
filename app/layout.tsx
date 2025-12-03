import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Advanced Rectangular Room Mode Calculator',
  description: 'Real-time acoustic analysis and 3D visualization of room modes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
