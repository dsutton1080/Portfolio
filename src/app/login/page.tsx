'use client'
import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../providers'
import { login } from '../services'
import { SuccessNotification, ErrorNotification } from '@/components/Alerts'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/lib/auth'

export default function Login() {
  const { user, setUser } = useContext(UserContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (email && password) {
      await login({ email, password }).then((response) => {
        if (response) {
          loginUser(response)
          setUser(response)
          setSuccessMessage('Logged In Successfully')
          setTimeout(() => {
            router.push('/')
          }, 1000)
        } else {
          setErrorMessage('Invalid Credentials')
        }
      })
    }
  }

  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setSuccessMessage('')
        setShowSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      setShowError(true)
      const timer = setTimeout(() => {
        setErrorMessage('')
        setShowError(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="fixed bottom-8 right-8 z-50">
          {showSuccess && <SuccessNotification message={successMessage} />}
        </div>
        <div className="fixed bottom-8 right-8 z-50">
          {showError && <ErrorNotification message={errorMessage} />}
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <button
                onClick={handleLogin}
                type="button"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Dont have an account?{' '}
            <a
              href="/signup"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Signup
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
