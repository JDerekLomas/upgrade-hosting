import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UpGrade Hosting - A/B Testing for Education",
  description: "Hosted A/B testing platform built for EdTech. Run rigorous experiments that improve student learning outcomes.",
  openGraph: {
    title: "UpGrade Hosting - A/B Testing for Education",
    description: "Hosted A/B testing platform built for EdTech. Run rigorous experiments that improve student learning outcomes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
