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

        // ---- Accessibility: currently FAILING -> warn for now -----------
        // color-contrast is fixed by PR #8 (5 WCAG AA failures). Flip it to
        // 'error' once that lands - that ratchet is the point of this file.
        'color-contrast': 'warn',

        // Overall category score. Starts as a warning because the exact
        // number has not been observed on a CI runner yet; once you see it in
        // the first run, set a real minScore and make it an error.
        'categories:accessibility': ['warn', { minScore: 1 }],

        // ---- Resource budgets: deterministic, hard failures -------------
        // Ceilings set just above today's measured over-the-wire numbers so
        // the build is green on day one. Tighten as PRs land - see the table
        // in the PR description for the target values.
        'resource-summary:script:size': ['error', { maxNumericValue: 200000 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 25000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 550000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 800000 }],

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
