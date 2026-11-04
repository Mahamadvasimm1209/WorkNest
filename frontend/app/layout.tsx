import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TaskFlow — Manage Work Together",
  description:
    "TaskFlow helps teams organize projects, manage tasks, and collaborate.",
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