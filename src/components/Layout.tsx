import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 flex justify-center sm:px-8">
        <div className="flex w-full max-w-7xl lg:px-8">
          <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
        </div>
      </div>
      <a
        href="#main"
        className="sr-only rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Skip to content
      </a>
      <div className="relative flex w-full flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="flex-auto">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}
