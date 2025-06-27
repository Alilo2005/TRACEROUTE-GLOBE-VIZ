import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Traceroute Globe - Cyberpunk Network Visualization",
  description: "Visualize network traceroute paths on a 3D globe with cyberpunk aesthetics",
  keywords: "traceroute, network, visualization, cyberpunk, 3D globe, networking tools",
  authors: [{ name: "Traceroute Globe" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-neon-green font-mono overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
