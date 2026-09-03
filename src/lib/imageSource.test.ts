import { describe, expect, it } from 'vitest'
import { getImageUrl, isSvgSource } from './imageSource'

describe('isSvgSource', () => {
  it('opts SVGs out of the optimizer', () => {
    // next/image returns HTTP 400 for SVG without dangerouslyAllowSVG.
    expect(isSvgSource({ src: '/_next/static/media/attLogo.abc.svg', height: 400, width: 400 })).toBe(true)
  })

  it('does NOT opt raster images out', () => {
    // Regression: a blanket `unoptimized` shipped an 880x880 PNG at full size
    // (381,657 B) to fill a 28x28 circle. Routing it through the optimizer
    // brings it to ~1,559 B.
    expect(isSvgSource({ src: '/_next/static/media/logo.abc.png', height: 880, width: 880 })).toBe(false)
    expect(isSvgSource({ src: '/_next/static/media/avatar.abc.jpg', height: 100, width: 100 })).toBe(false)
  })

  it('handles plain string sources', () => {
    expect(isSvgSource('/icon.svg')).toBe(true)
    expect(isSvgSource('/icon.png')).toBe(false)
  })

  it('unwraps the { default } shape some bundlers produce', () => {
    const wrapped = { default: { src: '/a.svg', height: 1, width: 1 } }
    expect(getImageUrl(wrapped)).toBe('/a.svg')
    expect(isSvgSource(wrapped)).toBe(true)
  })
})
