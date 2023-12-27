import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Portfolio",
  description: "A personal portfolio built with Next.js and Tailwind CSS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          <header className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold">Personal Portfolio</h1>
            <nav className="flex gap-4">
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/dashboard/resume">Resume</Link>
            </nav>
          </header>
          <main className="flex-1 p-4">{children}</main>
          <footer className="flex items-center justify-center h-16 border-t">
            <p>Footer</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
