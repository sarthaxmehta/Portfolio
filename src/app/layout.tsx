import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sarthak Mehta // Full-Stack AI & Geospatial Engineer',
  description: 'Engineering high-impact geospatial intelligence pipelines and premium full-stack systems. Student at NIT Jalandhar, Remote Sensing intern, and creator of ChiefOS, UrbanNet, and Vital Archive.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
