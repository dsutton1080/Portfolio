'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '@/app/services'

export interface AdminProject {
  id: string
  name: string
  description: string
  link: string
  label: string
  order?: number | null
  logo?: string | null
}

type Mode = { kind: 'closed' } | { kind: 'add' } | { kind: 'edit'; id: string }

const EMPTY = { name: '', description: '', link: '', label: '', order: '', logo: '' }
type Form = typeof EMPTY

export function ProjectManager({
  onSuccess,
  onError,
}: {
  onSuccess: (message: string) => void
  onError: (message: string) => void
}) {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [mode, setMode] = useState<Mode>({ kind: 'closed' })
  const [form, setForm] = useState<Form>(EMPTY)

  const refresh = useCallback(async () => {
    try {
      setProjects(await getProjects())
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const close = () => {
    setMode({ kind: 'closed' })
    setForm(EMPTY)
  }

  /**
   * `order` drives the sort on /projects. A blank box must never be written as
   * NaN (which serialises to null) or silently coerced to 0 - both of those
   * discard a deliberate ordering. Blank means "leave it where it is", and a
   * brand new project goes on the end.
   */
  const resolveOrder = (): number => {
    const typed = parseInt(form.order, 10)
    if (!Number.isNaN(typed)) return typed
    if (mode.kind === 'edit') {
      const current = projects.find((p) => p.id === mode.id)?.order
      if (typeof current === 'number') return current
    }
    const highest = projects.reduce(
      (max, p) => (typeof p.order === 'number' && p.order > max ? p.order : max),
      -1,
    )
    return highest + 1
  }

  const field = (name: keyof Form) => ({
    id: `project-${name}`,
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

    if (!form.name || !form.description || !form.link || !form.label) {
      onError('All fields are required')
      return
    }

    const payload = {
      name: form.name,
      description: form.description,
      link: form.link,
      label: form.label,
      order: resolveOrder(),
      logo: form.logo,
    }

    const adding = mode.kind === 'add'
    try {
      if (adding) {
        await createProject(payload)
      } else {
        await updateProject(mode.id, payload)
      }
      onSuccess(`Project ${adding ? 'added' : 'updated'} successfully`)
      close()
      await refresh()
    } catch (error) {
      onError(`Error ${adding ? 'adding' : 'updating'} project`)
      console.error('Error:', error)
    }
  }

  const handleDelete = async () => {
    if (mode.kind !== 'edit') return
    if (!window.confirm('Are you sure you want to delete this project?')) return

    try {
      await deleteProject(mode.id)
      close()
      await refresh()
      onSuccess('Project deleted successfully!')
    } catch (error) {
      onError('Failed to delete project.')
    }
  }

  const rowButton =
    'w-32 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-transparent border-none shadow-none'
  const labelClass =
    'block text-sm font-medium text-zinc-900 dark:text-zinc-100'

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Project Management
      </h2>
      <div className="mt-6">
        <div>
          <div className="flex items-center justify-end px-3">
            <button
              onClick={() => {
                setForm(EMPTY)
                setMode({ kind: 'add' })
              }}
              className={rowButton}
            >
              Create
            </button>
          </div>
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`flex items-center justify-between px-3 ${
                index % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
              }`}
            >
              <span>{project.name}</span>
              <button
                onClick={() => {
                  setForm({
                    name: project.name,
                    description: project.description,
                    link: project.link,
                    label: project.label,
                    order: typeof project.order === 'number' ? String(project.order) : '',
                    logo: project.logo ?? '',
                  })
                  setMode({ kind: 'edit', id: project.id })
                }}
                aria-label={`Edit ${project.name}`}
                className={rowButton}
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {mode.kind !== 'closed' && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="project-name" className={labelClass}>Name</label>
              <input type="text" {...field('name')} />
            </div>
            <div>
              <label htmlFor="project-description" className={labelClass}>Description</label>
              <textarea rows={4} {...field('description')} />
            </div>
            <div>
              <label htmlFor="project-link" className={labelClass}>Link</label>
              <input type="text" {...field('link')} />
            </div>
            <div>
              <label htmlFor="project-label" className={labelClass}>Label</label>
              <input type="text" {...field('label')} />
            </div>
            <div>
              <label htmlFor="project-order" className={labelClass}>
                Order (lowest first; blank keeps the current position)
              </label>
              <input type="number" {...field('order')} />
            </div>
            <div>
              <label htmlFor="project-logo" className={labelClass}>Logo</label>
              <input type="text" {...field('logo')} />
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
                  {mode.kind === 'add' ? 'Add Project' : 'Update Project'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
