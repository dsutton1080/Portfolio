'use client'

import { useCallback, useEffect, useState } from 'react'

import { createRole, deleteRole, getRoles, updateRole } from '@/app/services'
import { ROLE_LOGOS } from '@/lib/roles'

export interface AdminRole {
  id: string
  company: string
  title: string
  start: string
  end: string
  order?: number | null
  logo?: string | null
}

type Mode = { kind: 'closed' } | { kind: 'add' } | { kind: 'edit'; id: string }

const EMPTY = { company: '', title: '', start: '', end: '', order: '', logo: '' }
type Form = typeof EMPTY

export function RoleManager({
  onSuccess,
  onError,
}: {
  onSuccess: (message: string) => void
  onError: (message: string) => void
}) {
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [mode, setMode] = useState<Mode>({ kind: 'closed' })
  const [form, setForm] = useState<Form>(EMPTY)

  const refresh = useCallback(async () => {
    try {
      setRoles(await getRoles())
    } catch (error) {
      console.error('Error fetching roles:', error)
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
   * `order` is what puts the work history in reverse-chronological order on the
   * home page. Blank means "leave it where it is", and a new role goes on the
   * end - never NaN (which serialises to null) or a silent 0.
   */
  const resolveOrder = (): number => {
    const typed = parseInt(form.order, 10)
    if (!Number.isNaN(typed)) return typed
    if (mode.kind === 'edit') {
      const current = roles.find((r) => r.id === mode.id)?.order
      if (typeof current === 'number') return current
    }
    const highest = roles.reduce(
      (max, r) => (typeof r.order === 'number' && r.order > max ? r.order : max),
      -1,
    )
    return highest + 1
  }

  const field = (name: keyof Form) => ({
    id: `role-${name}`,
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [name]: e.target.value })),
    className:
      'mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm',
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (mode.kind === 'closed') return

    if (!form.company || !form.title || !form.start || !form.end) {
      onError('Company, title, start and end are required')
      return
    }

    const payload = {
      company: form.company,
      title: form.title,
      start: form.start,
      end: form.end,
      order: resolveOrder(),
      logo: form.logo,
    }

    const adding = mode.kind === 'add'
    try {
      if (adding) {
        await createRole(payload)
      } else {
        await updateRole(mode.id, payload)
      }
      onSuccess(`Role ${adding ? 'added' : 'updated'} successfully`)
      close()
      await refresh()
    } catch (error) {
      onError(`Error ${adding ? 'adding' : 'updating'} role`)
      console.error('Error:', error)
    }
  }

  const handleDelete = async () => {
    if (mode.kind !== 'edit') return
    if (!window.confirm('Are you sure you want to delete this role?')) return

    try {
      await deleteRole(mode.id)
      close()
      await refresh()
      onSuccess('Role deleted successfully!')
    } catch (error) {
      onError('Failed to delete role.')
    }
  }

  const rowButton =
    'w-32 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-transparent border-none shadow-none'
  const labelClass =
    'block text-sm font-medium text-zinc-900 dark:text-zinc-100'

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Work History Management
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
          {roles.map((role, index) => (
            <div
              key={role.id}
              className={`flex items-center justify-between px-3 ${
                index % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
              }`}
            >
              <span>
                {role.company} — {role.title}
              </span>
              <button
                onClick={() => {
                  setForm({
                    company: role.company,
                    title: role.title,
                    start: role.start,
                    end: role.end,
                    order:
                      typeof role.order === 'number' ? String(role.order) : '',
                    logo: role.logo ?? '',
                  })
                  setMode({ kind: 'edit', id: role.id })
                }}
                aria-label={`Edit ${role.company} ${role.title}`}
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
              <label htmlFor="role-company" className={labelClass}>Company</label>
              <input type="text" {...field('company')} />
            </div>
            <div>
              <label htmlFor="role-title" className={labelClass}>Title</label>
              <input type="text" {...field('title')} />
            </div>
            <div>
              <label htmlFor="role-start" className={labelClass}>Start (year)</label>
              <input type="text" {...field('start')} />
            </div>
            <div>
              <label htmlFor="role-end" className={labelClass}>
                End (year, or &quot;Present&quot;)
              </label>
              <input type="text" {...field('end')} />
            </div>
            <div>
              <label htmlFor="role-order" className={labelClass}>
                Order (lowest first; blank keeps the current position)
              </label>
              <input type="number" {...field('order')} />
            </div>
            <div>
              <label htmlFor="role-logo" className={labelClass}>
                Logo (ships with the app; blank shows the company initial)
              </label>
              <select {...field('logo')}>
                <option value="">None</option>
                {Object.keys(ROLE_LOGOS).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
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
                  {mode.kind === 'add' ? 'Add Role' : 'Update Role'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
