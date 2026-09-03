'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  createExperience,
  deleteExperience,
  getExperiences,
  updateExperience,
} from '@/app/services'

export interface AdminExperience {
  id: string
  title: string
  date: string
  content: string
}

/**
 * Which form, if any, is open. Replaces the previous pair of parallel state
 * sets (`experienceTitle` + `editingExperienceTitle`, and so on) that every
 * input had to choose between with a ternary.
 */
type Mode = { kind: 'closed' } | { kind: 'add' } | { kind: 'edit'; id: string }

const EMPTY = { title: '', date: '', content: '' }
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function ExperienceManager({
  onSuccess,
  onError,
}: {
  onSuccess: (message: string) => void
  onError: (message: string) => void
}) {
  const [experiences, setExperiences] = useState<AdminExperience[]>([])
  const [mode, setMode] = useState<Mode>({ kind: 'closed' })
  const [form, setForm] = useState(EMPTY)

  const refresh = useCallback(async () => {
    try {
      setExperiences(await getExperiences())
    } catch (error) {
      console.error('Error fetching experiences:', error)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const close = () => {
    setMode({ kind: 'closed' })
    setForm(EMPTY)
  }

  const field = (name: keyof typeof EMPTY) => ({
    id: `experience-${name}`,
    value: form[name],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setForm((f) => ({ ...f, [name]: e.target.value })),
    className:
      'mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm',
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (mode.kind === 'closed') return

    if (!form.title || !form.date || !form.content) {
      onError('All fields are required')
      return
    }
    if (!ISO_DATE.test(form.date)) {
      onError('Invalid date format')
      return
    }

    const adding = mode.kind === 'add'
    try {
      if (adding) {
        await createExperience(form)
      } else {
        await updateExperience(mode.id, form)
      }
      onSuccess(`Experience ${adding ? 'added' : 'updated'} successfully`)
      close()
      await refresh()
    } catch (error) {
      onError(`Error ${adding ? 'adding' : 'updating'} experience`)
      console.error('Error:', error)
    }
  }

  const handleDelete = async () => {
    if (mode.kind !== 'edit') return
    if (!window.confirm('Are you sure you want to delete this experience?')) return

    try {
      await deleteExperience(mode.id)
      close()
      await refresh()
      onSuccess('Experience deleted successfully!')
    } catch (error) {
      onError('Failed to delete experience.')
    }
  }

  const buttonClass =
    'w-32 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-transparent border-none shadow-none'

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Experience Management
      </h2>
      <div className="mt-6">
        <div>
          <div className="flex items-center justify-end px-3">
            <button
              onClick={() => {
                setForm(EMPTY)
                setMode({ kind: 'add' })
              }}
              className={buttonClass}
            >
              Create
            </button>
          </div>
          {experiences.map((experience, index) => (
            <div
              key={experience.id}
              className={`flex items-center justify-between px-3 ${
                index % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
              }`}
            >
              <span>{experience.title}</span>
              <button
                onClick={() => {
                  setForm({
                    title: experience.title,
                    date: experience.date,
                    content: experience.content,
                  })
                  setMode({ kind: 'edit', id: experience.id })
                }}
                aria-label={`Edit ${experience.title}`}
                className={buttonClass}
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {mode.kind !== 'closed' && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="experience-title"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Title
              </label>
              <input type="text" {...field('title')} />
            </div>
            <div>
              <label
                htmlFor="experience-date"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Date (YYYY-MM-DD)
              </label>
              <input type="text" {...field('date')} />
            </div>
            <div>
              <label
                htmlFor="experience-content"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Content
              </label>
              <textarea rows={4} {...field('content')} />
            </div>
            <div className="flex justify-between space-x-4">
              {mode.kind === 'edit' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                >
                  Delete
                </button>
              )}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {mode.kind === 'add' ? 'Add Experience' : 'Update Experience'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
