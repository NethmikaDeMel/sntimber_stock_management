import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SN Timber Stores – Stock Management",
  description: "Premium timber inventory & stock management system",
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
