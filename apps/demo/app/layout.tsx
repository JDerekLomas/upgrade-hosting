import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kiddom A/B Testing Demo",
  description: "See how Kiddom uses UpGrade to run rigorous experiments that improve student learning outcomes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
