import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WorkNest — Manage Work Together",
  description:
    "WorkNest helps teams organize projects, manage tasks, and collaborate.",
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