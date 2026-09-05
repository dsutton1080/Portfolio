'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useContext } from 'react'
import { UserContext } from '../app/providers'
import { logout } from '../app/services'

import { ContainerInner, ContainerOuter } from '@/components/Container'

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="transition hover:text-teal-700 dark:hover:text-teal-400"
    >
      {children}
    </Link>
  )
}

export function Footer() {
  const { user, setUser } = useContext(UserContext)
  const router = useRouter()

  // The session is an httpOnly cookie, so only the server can end it. Clearing
  // the local copy alone would leave the caller still authorised.
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <footer className="mt-32 flex-none">
      <ContainerOuter>
        <div className="border-t border-zinc-100 pb-16 pt-10 dark:border-zinc-700/40">
          <ContainerInner>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/resume">Resume</NavLink>
                <NavLink href="/experience">Experience</NavLink>
                <NavLink href="/projects">Projects</NavLink>
                {/*
                  Rendered conditionally rather than with `hidden=`, which left
                  the markup in the DOM for every visitor. This is presentation
                  only either way - /admin and the write routes are guarded
                  server-side, so a forged localStorage entry now buys a link to
                  a page that redirects.
                */}
                {user?.isAdmin && <NavLink href="/admin">Admin</NavLink>}
                {user === null ? (
                  <NavLink href="/login">Login</NavLink>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="border-0 border-transparent bg-transparent transition hover:text-teal-700 dark:hover:text-teal-400"
                  >
                    Logout
                  </button>
                )}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                &copy; {new Date().getFullYear()} DeRon Sutton. All rights
                reserved.
              </p>
            </div>
          </ContainerInner>
        </div>
      </ContainerOuter>
    </footer>
  )
}
