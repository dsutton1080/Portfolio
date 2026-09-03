'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  createSection,
  deleteSection,
  getSectionById,
  getSectionHeaders,
  updateSection,
} from '@/app/services'
import { type Header } from '@/lib/resume'

type Mode = { kind: 'closed' } | { kind: 'add' } | { kind: 'edit'; id: string }

const EMPTY = {
  title: '',
  order: '',
  header: '',
  subHeader: '',
  content1: '',
  content2: '',
  content3: '',
}
type Form = typeof EMPTY

/**
 * Sections are still modelled as exactly three content slots, because both the
 * create and update endpoints are shaped that way (`contents.records` on POST,
 * `content1..3` on PATCH). Generalising to a list is a server change as much as
 * a client one, so this component preserves the existing contract.
 */
export function SectionManager({
  onSuccess,
  onError,
}: {
  onSuccess: (message: string) => void
  onError: (message: string) => void
}) {
  const [headers, setHeaders] = useState<Header[]>([])
  const [mode, setMode] = useState<Mode>({ kind: 'closed' })
  const [form, setForm] = useState<Form>(EMPTY)

  const refresh = useCallback(async () => {
    try {
      setHeaders(await getSectionHeaders())
    } catch (error) {
      onError('Failed to fetch section headers.')
    }
  }, [onError])

  useEffect(() => {
    refresh()
  }, [refresh])

  const close = () => {
    setMode({ kind: 'closed' })
    setForm(EMPTY)
  }

  /** Blank must not become NaN (which serialises to null) or silently 0. */
  const resolveOrder = (): number => {
    const typed = parseInt(form.order, 10)
    if (!Number.isNaN(typed)) return typed
    const highest = headers.reduce(
      (max, h: any) => (typeof h.order === 'number' && h.order > max ? h.order : max),
      -1,
    )
    return highest + 1
  }

  const openForEdit = async (id: string) => {
    try {
      const data: any = await getSectionById(id)
      setForm({
        title: data.title ?? '',
        order: typeof data.order === 'number' ? String(data.order) : '',
        header: data.header ?? '',
        subHeader: data.subHeader ?? '',
        content1: data.contents?.[0]?.content ?? '',
        content2: data.contents?.[1]?.content ?? '',
        content3: data.contents?.[2]?.content ?? '',
      })
      setMode({ kind: 'edit', id })
    } catch (error) {
      onError('Error fetching section')
      console.error('Error fetching section:', error)
    }
  }

  const field = (name: keyof Form) => ({
    id: `section-${name}`,
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

    if (!form.title || !form.header) {
      onError('Title and Header are required')
      return
    }

    const adding = mode.kind === 'add'
    try {
      if (adding) {
        // POST expects nested `contents.records`.
        await createSection({
          title: form.title,
          order: resolveOrder(),
          header: form.header,
          subHeader: form.subHeader,
          contents: {
            records: [
              { content: form.content1, order: 0 },
              { content: form.content2, order: 1 },
              { content: form.content3, order: 2 },
            ],
          },
        })
      } else {
        // PATCH expects flattened content1..3.
        await updateSection(mode.id, {
          title: form.title,
          order: resolveOrder(),
          header: form.header,
          subHeader: form.subHeader,
          content1: form.content1,
          content2: form.content2,
          content3: form.content3,
        })
      }
      onSuccess(`Section ${adding ? 'added' : 'updated'} successfully`)
      close()
      await refresh()
    } catch (error) {
      onError(`Error ${adding ? 'adding' : 'updating'} section`)
      console.error('Error:', error)
    }
  }

  const handleDelete = async () => {
    if (mode.kind !== 'edit') return
    if (!window.confirm('Are you sure you want to delete this section?')) return

    try {
      await deleteSection(mode.id)
      close()
      await refresh()
      onSuccess('Section deleted successfully!')
    } catch (error) {
      onError('Failed to delete section.')
    }
  }

  const rowButton =
    'w-32 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-transparent border-none shadow-none'
  const labelClass = 'block text-sm font-medium text-zinc-900 dark:text-zinc-100'

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Section Management
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
          {headers.map((header, index) => (
            <div
              key={header.id}
              className={`flex items-center px-3 ${
                (index + 1) % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
              }`}
            >
              <span className="flex-1">{header.header}</span>
              <button
                onClick={() => openForEdit(header.id)}
                aria-label={`Edit ${header.header}`}
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
              <label htmlFor="section-title" className={labelClass}>
                Title (groups sections on the resume page)
              </label>
              <input type="text" {...field('title')} />
            </div>
            <div>
              <label htmlFor="section-order" className={labelClass}>
                Order (lowest first; blank appends)
              </label>
              <input type="number" {...field('order')} />
            </div>
            <div>
              <label htmlFor="section-header" className={labelClass}>Header</label>
              <input type="text" {...field('header')} />
            </div>
            <div>
              <label htmlFor="section-subHeader" className={labelClass}>Sub Header</label>
              <input type="text" {...field('subHeader')} />
            </div>
            {(['content1', 'content2', 'content3'] as const).map((name, i) => (
              <div key={name}>
                <label htmlFor={`section-${name}`} className={labelClass}>
                  {`Content ${i + 1}`}
                </label>
                <textarea rows={3} {...field(name)} />
              </div>
            ))}
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
                  {mode.kind === 'add' ? 'Add Section' : 'Update Section'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
