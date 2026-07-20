import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sarthak Mehta — Full-Stack Engineer & AI Builder',
  description:
    'Full-stack engineer and AI builder from NIT Jalandhar. Building geospatial intelligence pipelines, AI-powered systems, and premium products at startup speed.',
  openGraph: {
    title: 'Sarthak Mehta — Full-Stack Engineer & AI Builder',
    description:
      'Building geospatial intelligence pipelines, AI-powered systems, and premium full-stack products.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
