import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth';

interface Props {
  children: ReactNode;
}

// Blocks its subtree until Better Auth has confirmed a signed-in session.
// Anonymous visitors are bounced to /login with a `next` param so we can send
// them back after auth. Session state has three flavors:
//   isPending  → still resolving (first render before the /session call)
//   data null  → no session, redirect
//   data ok    → render children
//
// Important: useSession() re-enters `isPending` on transient refetches (e.g.
// a TOKEN_REFRESH triggered by getJWTToken() when the mic starts). We must
// NOT unmount children then — that blanks the whole app mid-session. Once
// authenticated, keep rendering while a refetch is in flight.
export function RequireAuth({ children }: Props) {
  const session = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const wasAuthed = useRef(false);

  if (session.data) wasAuthed.current = true;

  useEffect(() => {
    if (session.isPending) return;
    if (!session.data) {
      wasAuthed.current = false;
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`, { replace: true });
    }
  }, [session.isPending, session.data, navigate, location]);

  if (session.data || (session.isPending && wasAuthed.current)) {
    return <>{children}</>;
  }
  return null;
}
