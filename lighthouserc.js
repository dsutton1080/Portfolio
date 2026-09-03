/**
 * Lighthouse CI configuration.
 *
 * Audits the deployed site and enforces accessibility + resource-size budgets.
 *
 * Two deliberate choices worth knowing about:
 *
 * 1. Timing metrics (LCP / CLS / TBT) are set to "warn", not "error".
 *    Lighthouse timing scores depend on the CPU and network of the machine
 *    running them, and a GitHub-hosted runner is both slower and noisier than
 *    a laptop. Hard-failing on them before observing real runner variance
 *    produces flaky builds. Watch them for a few runs, then tighten.
 *
 * 2. Accessibility audits and byte budgets ARE hard errors, because they are
 *    deterministic - the same markup and the same bytes produce the same
 *    result on any machine.
 */
module.exports = {
  ci: {
    collect: {
      url: [
        'https://portfolio.dsuttonserver.net/',
        'https://portfolio.dsuttonserver.net/resume',
        'https://portfolio.dsuttonserver.net/experience',
        'https://portfolio.dsuttonserver.net/projects',
        'https://portfolio.dsuttonserver.net/login',
        'https://portfolio.dsuttonserver.net/signup',
      ],
      numberOfRuns: 3,
      settings: {
        // Lighthouse's own default throttling, applied consistently so runs
        // are comparable to each other over time.
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        // ---- Accessibility: deterministic, hard failures ----------------
        // These currently PASS. Asserting them locks in the current state so
        // a regression fails the build.
        'html-has-lang': 'error',
        'image-alt': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'document-title': 'error',
        'meta-viewport': 'error',
        'list': 'error',
        'listitem': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr-value': 'error',
        'label': 'error',
        'heading-order': 'error',
        'bypass': 'error',

        // Fixed by PR #8 and verified live (text-zinc-500 / text-teal-700 /
        // dark: variants on the auth pages are all deployed), so this is now
        // a hard error to keep it fixed.
        'color-contrast': 'error',

        // Overall category score. Starts as a warning because the exact
        // number has not been observed on a CI runner yet; once you see it in
        // the first run, set a real minScore and make it an error.
        'categories:accessibility': ['warn', { minScore: 1 }],

        // ---- Resource budgets: deterministic, hard failures -------------
        // Ceilings set ~15-20% above the live over-the-wire numbers measured
        // after PR #7 shipped, so there is room for normal change but not for
        // another 380 KB regression.
        //
        //   measured live          budget
        //   images     ~16,900 B ->  30,000  (attLogo + avatar + omni)
        //   scripts   114,752 B -> 140,000
        //   stylesheet  8,486 B ->  15,000
        //   total     ~148,200 B -> 180,000
        //
        // The image number is still dominated by two auto-traced SVG logos
        // (attLogo 108,544 B + graceLogo 21,873 B gzip). Replacing those with
        // hand-authored vectors should let the image budget drop to ~20,000
        // and the total to ~160,000.
        'resource-summary:script:size': ['error', { maxNumericValue: 140000 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 15000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 30000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 180000 }],

        // ---- Timing: watch first, tighten later -------------------------
        'largest-contentful-paint': 'warn',
        'cumulative-layout-shift': 'warn',
        'total-blocking-time': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-responsive-images': 'warn',

        // Not useful signal for this site; silence rather than ignore.
        'csp-xss': 'off',
        'errors-in-console': 'off',
        'unsized-images': 'off',
      },
    },
    upload: {
      // Publishes each report to Google's temporary public storage and prints
      // a shareable URL in the job log. Reports expire after a few days.
      // The audited site is already public, so nothing private is exposed.
      target: 'temporary-public-storage',
    },
  },
}
