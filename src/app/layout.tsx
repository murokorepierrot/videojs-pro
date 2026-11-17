import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next-Gen Cinema UI — Video.js v10 Premium Skin",
  description: "Experience the future of web video players with ambient theater lighting and accessible controls.",
};

// viewportFit: "cover" lets the page draw under the notch / gesture bar, which is what makes env(safe-area-inset-*) report real values.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
