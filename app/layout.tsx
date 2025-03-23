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
        <header className="bg-white p-4 text-black">
          <nav className="mx-auto flex w-full items-center">
            <Link
              href="/"
              aria-label="Argon-Ai Logo"
              className="flex items-center"
            >
              <Logo className="h-32 w-32" />
            </Link>
            <div></div>
          </nav>
        </header>
        <main className="min-h-screen bg-gray-100">{children}</main>
      </body>
    </html>
  );
}
