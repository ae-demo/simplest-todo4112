import { useEffect, type ReactElement } from "react";
import { handleCallback } from "../authz/session";

/**
 * The OIDC redirect target. Processes the authorization code once on mount
 * and returns to the app root — there is no session to read until that
 * completes, so this route sits outside <AuthzProvider> (see App.tsx).
 */
export function CallbackPage(): ReactElement {
  useEffect(() => {
    void handleCallback().finally(() => {
      window.location.assign("/");
    });
  }, []);

  return (
    <main>
      <p>Signing you in…</p>
    </main>
  );
}
