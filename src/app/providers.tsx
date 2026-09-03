'use client'

import { createContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeProvider, useTheme } from 'next-themes'
import { type SessionUser, getCurrentUser, loginUser, logoutUser } from '@/lib/auth'

function usePrevious<T>(value: T) {
  let ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

function ThemeWatcher() {
  let { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    let media = window.matchMedia('(prefers-color-scheme: dark)')

    function onMediaChange() {
      let systemTheme = media.matches ? 'dark' : 'light'
      if (resolvedTheme === systemTheme) {
        setTheme('system')
      }
    }

    onMediaChange()
    media.addEventListener('change', onMediaChange)

    return () => {
      media.removeEventListener('change', onMediaChange)
    }
  }, [resolvedTheme, setTheme])

  return null
}

type UserContextType = {
  user: SessionUser | null
  /**
   * Not a state setter, despite the name: it writes localStorage as well as
   * React state, so it cannot honour the functional-updater form
   * `setUser(prev => ...)`. Typing it as a Dispatch<SetStateAction> advertised
   * an updater the provider would have stored as the user itself.
   */
  setUser: (user: SessionUser | null) => void
}
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
})
export default function UserProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUserState] = useState<SessionUser | null>(null)

  // On mount, initialize user from localStorage
  useEffect(() => {
    setUserState(getCurrentUser())
  }, [])

  // When user changes, update localStorage
  const setUser = (user: SessionUser | null) => {
    setUserState(user)
    if (user) loginUser(user)
    else logoutUser()
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const AppContext = createContext<{ previousPathname?: string }>({})

export function Providers({ children }: { children: React.ReactNode }) {
  let pathname = usePathname()
  let previousPathname = usePrevious(pathname)

  return (
    <AppContext.Provider value={{ previousPathname }}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <ThemeWatcher />
        <UserProvider>{children}</UserProvider>
      </ThemeProvider>
    </AppContext.Provider>
  )
}
