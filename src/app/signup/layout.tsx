import { type Metadata } from 'next'

// The page itself is a client component and cannot export metadata, so the
// title is set here. Without this, /signup inherited the generic site-wide
// title and was indistinguishable from every other page (WCAG 2.4.2).
export const metadata: Metadata = {
  title: 'Create an account',
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
