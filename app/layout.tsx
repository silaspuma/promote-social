import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "promote.social - Earn points by supporting creators",
  description:
    "Promote your content and earn points by supporting other creators. Complete tasks like following, subscribing, liking, and commenting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
