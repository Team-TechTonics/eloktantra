import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientProviders from './client-providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'eLoktantra | Secure Digital Democracy',
  description: 'India\'s most secure digital voting and civic transparency platform. Powered by AI, DigiLocker & Blockchain.',
  keywords: 'eloktantra, digital voting, India election, DigiLocker, civic tech, democracy',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#060810',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="theme-dark scroll-smooth">
      <body className="antialiased bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
        <ClientProviders>
          <Navbar />
          <main className="pt-16 min-h-screen w-full max-w-[100vw]">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
