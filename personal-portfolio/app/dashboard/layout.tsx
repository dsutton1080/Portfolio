import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Personal Portfolio</h1>
        <nav className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/resume">Resume</Link>
          {/* <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/dashboard/resume">Resume</a> */}
        </nav>
      </header>
      <main className="flex-1 p-4">{children}</main>
      <footer className="flex items-center justify-center h-16 border-t">
        <p>Footer</p>
      </footer>
    </div>
  );
}
