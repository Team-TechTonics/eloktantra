import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from './client-providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'eLoktantra | Election Transparency',
  description: 'A civic-tech platform for democratizing election data and issue reporting in India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="theme-dark scroll-smooth">
      <body className="antialiased bg-background text-foreground selection:bg-primary/30">
        <ClientProviders>
          <Navbar />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
