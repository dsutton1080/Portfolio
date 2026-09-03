import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorNotification, SuccessNotification } from './Alerts'

describe('Alerts', () => {
  it('announces success politely', () => {
    render(<SuccessNotification message="Saved" />)
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
  })

  it('announces errors assertively', () => {
    render(<ErrorNotification message="Invalid Credentials" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid Credentials')
  })

  it('does not show the success checkmark on the error alert', () => {
    // Regression: ErrorNotification was copy-pasted from SuccessNotification
    // with only the colour class changed, so failures rendered a green tick.
    const ok = render(<SuccessNotification message="x" />)
    const okIcon = ok.container.querySelector('svg')?.innerHTML
    ok.unmount()

    const bad = render(<ErrorNotification message="x" />)
    const badIcon = bad.container.querySelector('svg')?.innerHTML

    expect(okIcon).toBeTruthy()
    expect(badIcon).toBeTruthy()
    expect(badIcon).not.toBe(okIcon)
  })
})
