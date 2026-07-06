// Neon Auth (Better Auth) client — the whole app talks to this singleton.
//
// createInternalNeonAuth wraps the Better Auth React client and adds a
// getJWTToken() helper that pulls the signed JWT from the auth server. We
// re-expose the client as `authClient` and the token accessor as
// getAccessToken(), which is what canvasApi/useVoiceSession send to our own
// FastAPI backend as `Authorization: Bearer <token>` (or `?token=` on WS).

import { createInternalNeonAuth } from '@neondatabase/auth';
import {
  BetterAuthReactAdapter,
  type BetterAuthReactAdapterInstance,
} from '@neondatabase/auth/react/adapters';

const url = import.meta.env.VITE_NEON_AUTH_URL;

if (!url) {
  throw new Error(
    'VITE_NEON_AUTH_URL is not set — paste it from Neon Console → Auth → ' +
      'Configuration into client/.env',
  );
}

// The shipped types don't define NeonAuthConfigInternal, so without the
// explicit generic T the default (VanillaBetterAuthClient) leaks into the
// return type and `useSession` shows up as a nanostores atom instead of a
// React hook. Pinning T here restores the React client shape.
const _neon = createInternalNeonAuth<BetterAuthReactAdapterInstance>(url, {
  adapter: BetterAuthReactAdapter(),
});

// Better Auth React client: signIn.email, signUp.email, signOut, useSession…
export const authClient = _neon.adapter;

// JWT for our own backend. Returns null when signed out.
export function getAccessToken(): Promise<string | null> {
  return _neon.getJWTToken();
}
