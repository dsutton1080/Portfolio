'use client'

import { SimpleLayout } from '@/components/SimpleLayout'
import { useState, useEffect } from 'react'
import { ExperienceManager } from '@/components/admin/ExperienceManager'
import { ProjectManager } from '@/components/admin/ProjectManager'
import { SectionManager } from '@/components/admin/SectionManager'
import { CheckCircleIcon, XMarkIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface SuccessNotificationProps {
  message: string
  onClose: () => void
}

function SuccessNotification({ message, onClose }: SuccessNotificationProps) {
  return (
    <div role="status" className="fixed bottom-8 right-8 rounded-md bg-green-50 p-4 dark:bg-green-900">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-800"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ErrorNotificationProps {
  message: string
  onClose: () => void
}

function ErrorNotification({ message, onClose }: ErrorNotificationProps) {
  return (
    <div role="alert" className="fixed bottom-8 right-8 rounded-md bg-red-50 p-4 dark:bg-red-900">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminActions() {
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

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
    <SimpleLayout title="Admin" intro="">
      <div className="space-y-8">
        <ExperienceManager
          onSuccess={setSuccessMessage}
          onError={setErrorMessage}
        />

        <ProjectManager onSuccess={setSuccessMessage} onError={setErrorMessage} />

        <SectionManager onSuccess={setSuccessMessage} onError={setErrorMessage} />

        {/* Success and Error Notifications */}
        {showSuccess && (
          <SuccessNotification
            message={successMessage}
            onClose={() => setShowSuccess(false)}
          />
        )}
        {showError && (
          <ErrorNotification
            message={errorMessage}
            onClose={() => setShowError(false)}
          />
        )}
      </div>
    </SimpleLayout>
  )
}
