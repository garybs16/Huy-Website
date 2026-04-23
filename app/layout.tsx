import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unstable ML",
  description: "Cinematic text-to-3D infrastructure for creators, studios, and teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
