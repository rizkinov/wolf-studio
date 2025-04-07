import type { Metadata } from "next";
import "./globals.css";
import { financierDisplay, calibre } from "./fonts";

export const metadata: Metadata = {
  title: "CBRE Web Elements",
  description: "A modern web application template with CBRE styling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${financierDisplay.variable} ${calibre.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
