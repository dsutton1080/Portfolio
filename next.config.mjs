import rehypePrism from '@mapbox/rehype-prism'
import nextMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  // Optimize build performance
  typescript: {
    // Only check types in production
    ignoreBuildErrors: true, // Temporarily disable type checking during build
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize production builds
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Disable experimental features
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [],
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
