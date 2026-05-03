import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SAFAR सफर — Migrant Worker Protection',
    template: '%s | SAFAR सफर',
  },
  description:
    'AI-powered protection and monitoring system for Nepali migrant workers abroad.',
  keywords: ['SAFAR', 'migrant workers', 'Nepal', 'worker rights', 'protection'],
  robots: {
    index: false, // Do not index — this is a private case management tool
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/*
          Google Fonts — Inter for Latin text, Noto Sans Devanagari for Nepali.
          Loaded via link tags to keep bundle small; no next/font to avoid
          dynamic import complexity in this demo setup.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-navy-900 text-white">
        {children}
      </body>
    </html>
  );
}
