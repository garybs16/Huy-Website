import type { Metadata } from "next";
import { GeistPixelLine } from 'geist/font/pixel';
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
      <head>
        <link rel="preconnect" href="https://d8j0ntlcm91z4.cloudfront.net" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="video"
          href="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260404_050931_6b868bbb-85a4-498d-921e-e815d5a55906.mp4"
        />
      </head>
      <body className={GeistPixelLine.className}>{children}</body>
    </html>
  );
}
