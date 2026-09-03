import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library only auto-registers cleanup when Vitest globals are enabled.
// This suite uses explicit imports, so unmount between tests here instead -
// without it, renders stack up and queries match elements from earlier tests.
afterEach(cleanup)
