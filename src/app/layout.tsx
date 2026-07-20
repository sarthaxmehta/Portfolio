import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sarthak Mehta — Full-Stack Engineer & AI/ML Enthusiast',
  description:
    'B.Tech Computer Science student at NIT Jalandhar. Building full-stack web applications, AI/ML pipelines, and geospatial intelligence systems.',
  openGraph: {
    title: 'Sarthak Mehta — Full-Stack Engineer & AI/ML Enthusiast',
    description:
      'Full-stack engineer and AI/ML enthusiast at NIT Jalandhar. Building geospatial intelligence pipelines, AI systems, and premium products.',
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
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
