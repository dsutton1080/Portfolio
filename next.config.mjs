import rehypePrism from '@mapbox/rehype-prism'
import nextMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  // Optimize production builds
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Disable experimental features
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [],
    // Enables src/instrumentation.ts, which fails the boot when SESSION_SECRET
    // is missing rather than letting the server come up without it.
    instrumentationHook: true,
  },
  // Add output configuration
  output: 'standalone',
  // Disable source maps in production
  productionBrowserSourceMaps: false,
}

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
})

export default withMDX(nextConfig)
