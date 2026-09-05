import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
const refresh = vi.fn()
const searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => searchParams,
}))

const login = vi.fn()
vi.mock('@/app/services', () => ({ login: (...a: unknown[]) => login(...a) }))

const loginUser = vi.fn()
vi.mock('@/lib/auth', () => ({
  loginUser: (...a: unknown[]) => loginUser(...a),
  logoutUser: vi.fn(),
  getCurrentUser: () => null,
}))

import Login from './page'

async function submit(email = 'a@b.com', password = 'hunter2') {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/email address/i), email)
  await user.type(screen.getByLabelText(/^password$/i), password)
  await user.click(screen.getByRole('button', { name: /sign in/i }))
  return user
}

describe('Login', () => {
  beforeEach(() => {
    push.mockReset()
    refresh.mockReset()
    searchParams.delete('redirectTo')
    login.mockReset()
    loginUser.mockReset()
  })

  it('tells the user when sign-in fails', async () => {
    // Regression: the handler chained .then() with no .catch(), so a rejected
    // login was an unhandled rejection and the user saw nothing at all.
    login.mockRejectedValue(new Error('Invalid password'))
    render(<Login />)
    await submit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid password')
    expect(push).not.toHaveBeenCalled()
  })

  it('falls back to a generic message when the error has no useful text', async () => {
    login.mockRejectedValue('nope')
    render(<Login />)
    await submit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid Credentials')
  })

  it('stores the user and confirms success when sign-in works', async () => {
    const account = { id: '1', email: 'a@b.com', isAdmin: true }
    login.mockResolvedValue(account)
    render(<Login />)
    await submit()

    expect(await screen.findByRole('status')).toHaveTextContent('Logged In Successfully')
    expect(loginUser).toHaveBeenCalledWith(account)
  })

  it('does not call the API when a field is empty', async () => {
    render(<Login />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email address/i), 'a@b.com')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(login).not.toHaveBeenCalled()
  })

  it('submits on Enter, not only on button click', async () => {
    // Regression: the form had no onSubmit and the button was type="button",
    // so pressing Enter in a field did nothing.
    login.mockResolvedValue({ id: '1' })
    render(<Login />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email address/i), 'a@b.com')
    await user.type(screen.getByLabelText(/^password$/i), 'hunter2{Enter}')

    expect(login).toHaveBeenCalledTimes(1)
  })
})
