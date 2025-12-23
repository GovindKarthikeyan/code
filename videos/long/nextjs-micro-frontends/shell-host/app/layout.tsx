import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shell Host - Micro Frontend Container",
  description: "Shell application that consumes micro frontends as web components",
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
