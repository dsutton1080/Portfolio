'use client'
import Link from 'next/link'
import React, { useContext } from 'react'
import { UserContext } from '../app/providers'

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
      className="transition hover:text-teal-500 dark:hover:text-teal-400"
    >
      {children}
    </Link>
  )
}

export function Footer() {
  const { user, setUser } = useContext(UserContext)
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
                {/* <NavLink href="/projects">Projects</NavLink> */}
                <div hidden={user === null || !user?.isAdmin}>
                  <NavLink href="/admin">Admin</NavLink>
                </div>
                <div hidden={user === null}>
                  <Link
                    href="/"
                    onClick={() => setUser(null)}
                    className="border-0 border-transparent bg-transparent transition hover:text-teal-500 dark:hover:text-teal-400"
                  >
                    Logout
                  </Link>
                </div>
                <div hidden={user !== null}>
                  <NavLink href="/login">Login</NavLink>
                </div>
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
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
