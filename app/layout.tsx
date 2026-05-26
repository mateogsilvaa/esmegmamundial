import type { Metadata, Viewport } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mundial 2026 — Predicciones',
  description: 'Predice el Mundial 2026 y compite con tus amigos',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: '#18181b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${barlow.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
