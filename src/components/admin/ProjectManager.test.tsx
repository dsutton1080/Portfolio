import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const svc = vi.hoisted(() => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}))
vi.mock('@/app/services', () => svc)

import { ProjectManager } from './ProjectManager'

const ROWS = [
  { id: 'p1', name: 'Portfolio', description: 'This site', link: 'https://a', label: 'Github Link', order: 0, logo: '' },
  { id: 'p2', name: 'Allegiance', description: 'Client work', link: 'https://b', label: 'Website Link', order: 1, logo: '' },
]

const onSuccess = vi.fn()
const onError = vi.fn()

function setup() {
  render(<ProjectManager onSuccess={onSuccess} onError={onError} />)
  return userEvent.setup()
}

describe('ProjectManager', () => {
  beforeEach(() => {
    onSuccess.mockReset(); onError.mockReset()
    svc.getProjects.mockReset().mockResolvedValue(ROWS)
    svc.createProject.mockReset().mockResolvedValue({})
    svc.updateProject.mockReset().mockResolvedValue({})
    svc.deleteProject.mockReset().mockResolvedValue({})
  })

  it('lists projects with distinguishable Edit buttons', async () => {
    setup()
    expect(await screen.findByRole('button', { name: 'Edit Portfolio' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit Allegiance' })).toBeInTheDocument()
  })

  it('prefills the order field when editing', async () => {
    // Regression: handleEditProject never populated editingProjectOrder, and
    // the form had no order input at all, so the value was unrecoverable.
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Allegiance' }))
    expect(screen.getByLabelText(/order/i)).toHaveValue(1)
  })

  it('preserves an existing order when editing other fields', async () => {
    // Regression: `parseInt(editingProjectOrder) || 0` reset every edited
    // project to order 0, silently destroying a deliberate ordering.
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Allegiance' }))
    const name = screen.getByLabelText(/name/i)
    await user.clear(name)
    await user.type(name, 'Allegiance HHC')
    await user.click(screen.getByRole('button', { name: 'Update Project' }))

    await waitFor(() =>
      expect(svc.updateProject).toHaveBeenCalledWith(
        'p2', expect.objectContaining({ name: 'Allegiance HHC', order: 1 }),
      ),
    )
  })

  it('keeps the current order when the box is cleared', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Allegiance' }))
    await user.clear(screen.getByLabelText(/order/i))
    await user.click(screen.getByRole('button', { name: 'Update Project' }))

    await waitFor(() =>
      expect(svc.updateProject).toHaveBeenCalledWith('p2', expect.objectContaining({ order: 1 })),
    )
  })

  it('puts a new project at the end rather than sending null', async () => {
    // Regression: parseInt('') is NaN, which JSON.stringify turns into null.
    // That is how three of four live projects ended up with order: null.
    const user = setup()
    await screen.findByText('Portfolio')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    for (const [label, value] of [[/name/i, 'New'], [/description/i, 'D'], [/link/i, 'https://c'], [/^label$/i, 'L']] as const) {
      await user.type(screen.getByLabelText(label), value)
    }
    await user.click(screen.getByRole('button', { name: 'Add Project' }))

    await waitFor(() =>
      expect(svc.createProject).toHaveBeenCalledWith(expect.objectContaining({ name: 'New', order: 2 })),
    )
    expect(onSuccess).toHaveBeenCalledWith('Project added successfully')
    expect(svc.getProjects).toHaveBeenCalledTimes(2) // list refreshes after add
  })

  it('honours an explicitly typed order', async () => {
    const user = setup()
    await screen.findByText('Portfolio')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    for (const [label, value] of [[/name/i, 'N'], [/description/i, 'D'], [/link/i, 'https://c'], [/^label$/i, 'L']] as const) {
      await user.type(screen.getByLabelText(label), value)
    }
    await user.type(screen.getByLabelText(/order/i), '7')
    await user.click(screen.getByRole('button', { name: 'Add Project' }))

    await waitFor(() =>
      expect(svc.createProject).toHaveBeenCalledWith(expect.objectContaining({ order: 7 })),
    )
  })

  it('rejects missing required fields without calling the API', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Create' }))
    await user.click(screen.getByRole('button', { name: 'Add Project' }))
    expect(onError).toHaveBeenCalledWith('All fields are required')
    expect(svc.createProject).not.toHaveBeenCalled()
  })

  it('reports API failures', async () => {
    svc.updateProject.mockRejectedValue(new Error('nope'))
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Portfolio' }))
    await user.click(screen.getByRole('button', { name: 'Update Project' }))
    await waitFor(() => expect(onError).toHaveBeenCalledWith('Error updating project'))
  })

  it('deletes only after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Portfolio' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(svc.deleteProject).not.toHaveBeenCalled()

    confirm.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(svc.deleteProject).toHaveBeenCalledWith('p1'))
  })
})
