import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asme",
  description: "A dark minimalist landing page for Asme."
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
