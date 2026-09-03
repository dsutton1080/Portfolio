import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('renders an ISO date as a readable US date', () => {
    expect(formatDate('2024-02-05')).toBe('February 5, 2024')
  })

  it('is timezone-stable at the start of a month', () => {
    // The helper appends T00:00:00Z and formats in UTC. Without that, a
    // machine west of UTC renders "January 31, 2024" for this input.
    expect(formatDate('2024-02-01')).toBe('February 1, 2024')
  })
})
