// Feature flags read from NEXT_PUBLIC_ env vars so both server and client
// components see the same value. Off by default: the flag is only on when
// the var is exactly 'true'.
export const MALAMI_ENABLED = process.env.NEXT_PUBLIC_MALAMI === 'true'
