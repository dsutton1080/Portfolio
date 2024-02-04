import type { Metadata } from "next";
// import { useRouter } from "next/navigation";
import "./globals.css";
import Link from "next/link";
import Footer from "./footer";

export const metadata: Metadata = {
  title: "Personal Portfolio",
  description: "A personal portfolio built with Next.js and Tailwind CSS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // const router = useRouter();

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          <header className="bg-nav-color flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-white">Personal Portfolio</h1>
            <nav className="flex gap-4">
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/dashboard/resume">Resume</Link>
              <Link href="/dashboard/resume/add-section">Add Section</Link>
            </nav>
          </header>
          <main className="flex min-h-screen flex-col justify-between p-24">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
