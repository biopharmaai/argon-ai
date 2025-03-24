import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Clinical Trials",
  description: "Searching for clinical trials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {/* Navigation Bar */}
        <header className="fixed top-0 left-0 z-50 w-full bg-white p-4 text-black shadow">
          <nav className="mx-auto flex w-full items-center">
            <Link
              href="/"
              aria-label="Argon-Ai Logo"
              className="flex items-center"
            >
              <Logo className="h-12 w-26" />
            </Link>
          </nav>
        </header>
        <main className="bg-gray-100">{children}</main>
      </body>
    </html>
  );
}
