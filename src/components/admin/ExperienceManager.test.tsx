import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const svc = vi.hoisted(() => ({
  getExperiences: vi.fn(),
  createExperience: vi.fn(),
  updateExperience: vi.fn(),
  deleteExperience: vi.fn(),
}))
vi.mock('@/app/services', () => svc)

import { ExperienceManager } from './ExperienceManager'

const ROWS = [
  { id: '1', title: 'Shipped a thing', date: '2025-03-10', content: 'Details here' },
  { id: '2', title: 'Shipped another', date: '2024-01-02', content: 'More details' },
]

const onSuccess = vi.fn()
const onError = vi.fn()

function setup() {
  render(<ExperienceManager onSuccess={onSuccess} onError={onError} />)
  return userEvent.setup()
}

async function fillForm(user: ReturnType<typeof userEvent.setup>, v: Record<string, string>) {
  for (const [label, value] of Object.entries(v)) {
    const el = screen.getByLabelText(new RegExp(label, 'i'))
    await user.clear(el)
    if (value) await user.type(el, value)
  }
}

describe('ExperienceManager', () => {
  beforeEach(() => {
    onSuccess.mockReset()
    onError.mockReset()
    svc.getExperiences.mockReset().mockResolvedValue(ROWS)
    svc.createExperience.mockReset().mockResolvedValue({})
    svc.updateExperience.mockReset().mockResolvedValue({})
    svc.deleteExperience.mockReset().mockResolvedValue({})
  })

  it('lists existing experiences on mount', async () => {
    setup()
    expect(await screen.findByText('Shipped a thing')).toBeInTheDocument()
    expect(screen.getByText('Shipped another')).toBeInTheDocument()
  })

  it('gives each row Edit button a distinguishing accessible name', async () => {
    setup()
    expect(await screen.findByRole('button', { name: 'Edit Shipped a thing' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit Shipped another' })).toBeInTheDocument()
  })

  it('creates an experience and refreshes the list', async () => {
    const user = setup()
    await screen.findByText('Shipped a thing')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    await fillForm(user, { title: 'New one', 'date \\(yyyy': '2026-05-01', content: 'Body' })
    await user.click(screen.getByRole('button', { name: 'Add Experience' }))

    await waitFor(() =>
      expect(svc.createExperience).toHaveBeenCalledWith({
        title: 'New one', date: '2026-05-01', content: 'Body',
      }),
    )
    expect(onSuccess).toHaveBeenCalledWith('Experience added successfully')
    // Regression: the add path never re-fetched, so a newly created entry did
    // not appear until a full page reload.
    expect(svc.getExperiences).toHaveBeenCalledTimes(2)
  })

  it('opens the edit form prefilled and updates by id', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Shipped a thing' }))

    expect(screen.getByLabelText(/title/i)).toHaveValue('Shipped a thing')
    expect(screen.getByLabelText(/content/i)).toHaveValue('Details here')

    await fillForm(user, { title: 'Renamed' })
    await user.click(screen.getByRole('button', { name: 'Update Experience' }))

    await waitFor(() =>
      expect(svc.updateExperience).toHaveBeenCalledWith('1', {
        title: 'Renamed', date: '2025-03-10', content: 'Details here',
      }),
    )
    expect(onSuccess).toHaveBeenCalledWith('Experience updated successfully')
  })

  it('rejects empty fields without calling the API', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Create' }))
    await user.click(screen.getByRole('button', { name: 'Add Experience' }))

    expect(onError).toHaveBeenCalledWith('All fields are required')
    expect(svc.createExperience).not.toHaveBeenCalled()
  })

  it('rejects a malformed date', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Create' }))
    await fillForm(user, { title: 'T', 'date \\(yyyy': '05/01/2026', content: 'C' })
    await user.click(screen.getByRole('button', { name: 'Add Experience' }))

    expect(onError).toHaveBeenCalledWith('Invalid date format')
    expect(svc.createExperience).not.toHaveBeenCalled()
  })

  it('reports an API failure instead of failing silently', async () => {
    svc.createExperience.mockRejectedValue(new Error('boom'))
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Create' }))
    await fillForm(user, { title: 'T', 'date \\(yyyy': '2026-05-01', content: 'C' })
    await user.click(screen.getByRole('button', { name: 'Add Experience' }))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Error adding experience'))
  })

  it('deletes only after the user confirms', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Shipped a thing' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(svc.deleteExperience).not.toHaveBeenCalled()

    confirm.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(svc.deleteExperience).toHaveBeenCalledWith('1'))
    expect(onSuccess).toHaveBeenCalledWith('Experience deleted successfully!')
  })

  it('closes the form on cancel', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Create' }))
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument()
  })

  it('does not leak values from an edit into a later create', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Shipped a thing' }))
    expect(screen.getByLabelText(/title/i)).toHaveValue('Shipped a thing')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(screen.getByLabelText(/title/i)).toHaveValue('')
  })
})
