import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const svc = vi.hoisted(() => ({
  getSectionHeaders: vi.fn(),
  getSectionById: vi.fn(),
  createSection: vi.fn(),
  updateSection: vi.fn(),
  deleteSection: vi.fn(),
}))
vi.mock('@/app/services', () => svc)

import { SectionManager } from './SectionManager'

const HEADERS = [
  { id: 's1', header: 'Development' },
  { id: 's2', header: 'College' },
]

const COLLEGE = {
  id: 's2', title: 'Education', order: 9, header: 'College', subHeader: 'Degrees',
  contents: [{ content: 'MBA' }, { content: 'BS' }], // only two - see the route note
}

const onSuccess = vi.fn()
const onError = vi.fn()

function setup() {
  render(<SectionManager onSuccess={onSuccess} onError={onError} />)
  return userEvent.setup()
}

describe('SectionManager', () => {
  beforeEach(() => {
    onSuccess.mockReset(); onError.mockReset()
    svc.getSectionHeaders.mockReset().mockResolvedValue(HEADERS)
    svc.getSectionById.mockReset().mockResolvedValue(COLLEGE)
    svc.createSection.mockReset().mockResolvedValue({})
    svc.updateSection.mockReset().mockResolvedValue({})
    svc.deleteSection.mockReset().mockResolvedValue({})
  })

  it('lists section headers with distinguishable Edit buttons', async () => {
    setup()
    expect(await screen.findByRole('button', { name: 'Edit Development' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit College' })).toBeInTheDocument()
  })

  it('loads a section through the service layer and prefills every field', async () => {
    // Previously this used a hardcoded fetch('/api/sections/${id}') with no
    // response check, bypassing the service layer entirely.
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit College' }))

    await waitFor(() => expect(svc.getSectionById).toHaveBeenCalledWith('s2'))
    expect(screen.getByLabelText(/^title/i)).toHaveValue('Education')
    expect(screen.getByLabelText(/^header$/i)).toHaveValue('College')
    expect(screen.getByLabelText(/sub header/i)).toHaveValue('Degrees')
    expect(screen.getByLabelText(/order/i)).toHaveValue(9)
    expect(screen.getByLabelText(/content 1/i)).toHaveValue('MBA')
    expect(screen.getByLabelText(/content 2/i)).toHaveValue('BS')
    expect(screen.getByLabelText(/content 3/i)).toHaveValue('')
  })

  it('exposes subHeader for editing', async () => {
    // Regression: subHeader was stored and sent but had no input, so it could
    // only ever be set through the API. Sections with a blank subHeader are
    // what produced the empty <h3> elements on /resume.
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit College' }))
    const sub = await screen.findByLabelText(/sub header/i)
    await user.clear(sub)
    await user.type(sub, 'Education history')
    await user.click(screen.getByRole('button', { name: 'Update Section' }))

    await waitFor(() =>
      expect(svc.updateSection).toHaveBeenCalledWith(
        's2', expect.objectContaining({ subHeader: 'Education history' }),
      ),
    )
  })

  it('sends the flattened content1..3 shape on update', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit College' }))
    await screen.findByLabelText(/content 1/i)
    await user.click(screen.getByRole('button', { name: 'Update Section' }))

    await waitFor(() =>
      expect(svc.updateSection).toHaveBeenCalledWith('s2', expect.objectContaining({
        content1: 'MBA', content2: 'BS', content3: '', order: 9,
      })),
    )
    expect(onSuccess).toHaveBeenCalledWith('Section updated successfully')
  })

  it('sends the nested contents.records shape on create', async () => {
    const user = setup()
    await screen.findByText('Development')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    await user.type(screen.getByLabelText(/^title/i), 'Education')
    await user.type(screen.getByLabelText(/^header$/i), 'Bootcamps')
    await user.type(screen.getByLabelText(/content 1/i), 'First')
    await user.click(screen.getByRole('button', { name: 'Add Section' }))

    await waitFor(() =>
      expect(svc.createSection).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Education',
        header: 'Bootcamps',
        contents: { records: [
          { content: 'First', order: 0 },
          { content: '', order: 1 },
          { content: '', order: 2 },
        ] },
      })),
    )
  })

  it('never writes a NaN order when the box is blank', async () => {
    // parseInt('') is NaN, which JSON.stringify turns into null.
    const user = setup()
    await screen.findByText('Development')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    await user.type(screen.getByLabelText(/^title/i), 'T')
    await user.type(screen.getByLabelText(/^header$/i), 'H')
    await user.click(screen.getByRole('button', { name: 'Add Section' }))

    await waitFor(() => expect(svc.createSection).toHaveBeenCalled())
    const { order } = svc.createSection.mock.calls[0][0]
    expect(Number.isNaN(order)).toBe(false)
    expect(order).toBe(0)
  })

  it('requires a title and a header', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Create' }))
    await user.click(screen.getByRole('button', { name: 'Add Section' }))
    expect(onError).toHaveBeenCalledWith('Title and Header are required')
    expect(svc.createSection).not.toHaveBeenCalled()
  })

  it('reports a failure to load a section instead of silently doing nothing', async () => {
    svc.getSectionById.mockRejectedValue(new Error('boom'))
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit College' }))
    await waitFor(() => expect(onError).toHaveBeenCalledWith('Error fetching section'))
  })

  it('deletes only after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit College' }))
    await screen.findByLabelText(/content 1/i)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(svc.deleteSection).not.toHaveBeenCalled()

    confirm.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(svc.deleteSection).toHaveBeenCalledWith('s2'))
  })
})
