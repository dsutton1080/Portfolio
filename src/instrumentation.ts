// Runs once as the server prepares itself, ahead of anything it serves.
//
// Without a secret, verifySessionToken() already rejects every cookie, so a
// missing SESSION_SECRET cannot quietly let forged sessions through - it locks
// the admin out instead. But that only shows up the next time someone tries to
// sign in, on a site whose public pages carry on working perfectly, so a broken
// deploy could sit unnoticed for weeks.
//
// Throwing here makes Next fail to prepare the server, and every request then
// returns 500 with this message in the log. Loud and immediate beats correct
// but invisible: the deploy that forgot the variable does not look healthy.

export async function register() {
  // Middleware runs on Edge and imports the same module; this check belongs to
  // the Node server process, which is the one that serves pages.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { getSessionSecret } = await import('@/lib/session')
  getSessionSecret()
}
