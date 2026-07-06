import { useEffect, type ReactNode } from 'react';
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
export function RequireAuth({ children }: Props) {
  const session = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (session.isPending) return;
    if (!session.data) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`, { replace: true });
    }
  }, [session.isPending, session.data, navigate, location]);

  if (session.isPending || !session.data) return null;
  return <>{children}</>;
}
