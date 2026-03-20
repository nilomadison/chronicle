import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chronicle — A Living Archive of Human Stories",
  description:
    "Chronicle is an AI-assisted storytelling archive where people share meaningful life stories, deepen them through thoughtful reflection, and contribute to a searchable commons of human experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
