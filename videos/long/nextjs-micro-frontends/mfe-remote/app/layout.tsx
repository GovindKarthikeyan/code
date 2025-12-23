import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MFE Remote - Micro Frontend Components",
  description: "Micro frontend application that exposes components as web components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
