import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const svc = vi.hoisted(() => ({
  getRoles: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
}))
vi.mock('@/app/services', () => svc)

import { RoleManager } from './RoleManager'

const ROWS = [
  { id: 'r1', company: 'Omni Federal', title: 'Software Engineer', start: '2024', end: 'Present', order: 0, logo: 'omni-federal' },
  { id: 'r2', company: 'AT&T', title: 'Software Engineer II', start: '2022', end: '2024', order: 1, logo: 'att' },
]

const onSuccess = vi.fn()
const onError = vi.fn()

function setup() {
  render(<RoleManager onSuccess={onSuccess} onError={onError} />)
  return userEvent.setup()
}

describe('RoleManager', () => {
  beforeEach(() => {
    onSuccess.mockReset(); onError.mockReset()
    svc.getRoles.mockReset().mockResolvedValue(ROWS)
    svc.createRole.mockReset().mockResolvedValue({})
    svc.updateRole.mockReset().mockResolvedValue({})
    svc.deleteRole.mockReset().mockResolvedValue({})
  })

  it('lists roles with distinguishable Edit buttons', async () => {
    setup()
    expect(await screen.findByRole('button', { name: 'Edit Omni Federal Software Engineer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit AT&T Software Engineer II' })).toBeInTheDocument()
  })

  it('prefills the form when editing', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit AT&T Software Engineer II' }))
    expect(screen.getByLabelText(/^Company$/)).toHaveValue('AT&T')
    expect(screen.getByLabelText(/^End/)).toHaveValue('2024')
    expect(screen.getByLabelText(/^Order/)).toHaveValue(1)
    expect(screen.getByLabelText(/^Logo/)).toHaveValue('att')
  })

  it('preserves an existing order when editing other fields', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit AT&T Software Engineer II' }))
    const title = screen.getByLabelText(/^Title$/)
    await user.clear(title)
    await user.type(title, 'Senior Software Engineer')
    await user.click(screen.getByRole('button', { name: 'Update Role' }))

    await waitFor(() =>
      expect(svc.updateRole).toHaveBeenCalledWith(
        'r2', expect.objectContaining({ title: 'Senior Software Engineer', order: 1 }),
      ),
    )
  })

  it('puts a new role at the end rather than sending null', async () => {
    // parseInt('') is NaN, which JSON.stringify turns into null - the same trap
    // that left live projects with order: null.
    const user = setup()
    await screen.findByText(/Omni Federal/)
    await user.click(screen.getByRole('button', { name: 'Create' }))
    for (const [label, value] of [[/^Company$/, 'AT&T'], [/^Title$/, 'Software Engineer I'], [/^Start/, '2021'], [/^End/, '2022']] as const) {
      await user.type(screen.getByLabelText(label), value)
    }
    await user.click(screen.getByRole('button', { name: 'Add Role' }))

    await waitFor(() =>
      expect(svc.createRole).toHaveBeenCalledWith(
        expect.objectContaining({ company: 'AT&T', start: '2021', order: 2 }),
      ),
    )
    expect(onSuccess).toHaveBeenCalledWith('Role added successfully')
    expect(svc.getRoles).toHaveBeenCalledTimes(2) // list refreshes after add
  })

  it('rejects missing required fields without calling the API', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Create' }))
    await user.click(screen.getByRole('button', { name: 'Add Role' }))
    expect(onError).toHaveBeenCalledWith('Company, title, start and end are required')
    expect(svc.createRole).not.toHaveBeenCalled()
  })

  it('deletes only after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Omni Federal Software Engineer' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(svc.deleteRole).not.toHaveBeenCalled()

    confirm.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(svc.deleteRole).toHaveBeenCalledWith('r1'))
  })
})
