import { type ImageProps } from 'next/image'

/**
 * Resolve a next/image `src` to the underlying URL string.
 *
 * Static imports arrive either as a StaticImageData object or, under some
 * bundler configurations, wrapped as `{ default: StaticImageData }`.
 */
export function getImageUrl(src: ImageProps['src']): string {
  if (typeof src === 'string') return src
  return 'default' in src ? src.default.src : src.src
}

/**
 * next/image returns HTTP 400 for SVG sources unless `dangerouslyAllowSVG` is
 * enabled, so vectors have to opt out of the optimizer individually. Raster
 * images must NOT opt out - bypassing the optimizer is what caused an 880x880
 * PNG to be served at full size for a 28px avatar.
 */
export function isSvgSource(src: ImageProps['src']): boolean {
  return getImageUrl(src).endsWith('.svg')
}
