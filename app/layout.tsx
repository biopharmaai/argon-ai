import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Logo from "@/components/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clinical Trials",
  description: "Searching for clinical trials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // return (
  //   <html lang="en">
  //     <body
  //       className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  //     >
  //       {children}
  //     </body>
  //   </html>
  // );
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation Bar */}
        <header className="bg-white text-black p-4">
          <nav className="w-full mx-auto flex items-center">
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
