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
    // bcrypt loads its .node binary at runtime through node-gyp-build, which
    // static tracing cannot follow, so the standalone bundle ships the JS
    // wrapper without the native build and every call throws. Name the
    // prebuilds explicitly for the one route that hashes passwords.
    outputFileTracingIncludes: {
      '/api/users': ['./node_modules/bcrypt/prebuilds/**'],
    },
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
