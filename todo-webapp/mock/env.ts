// What window._env_ holds in mock mode — exactly the keys the platform
// actually emits for this component (src/env.ts's Env type), plus the OIDC
// scopes mock/authz/session.ts turns a `?role=` into a token for.

export const mockEnv = {
  USER_AUTH_CLIENT_ID: "mock-client",
  USER_AUTH_ISSUER: "https://mock-idp.test",
  // No USER_AUTH_JWKS_URL: the platform emits it, src/env.ts does not declare
  // it (the browser never validates a token — the API gateway does).
  // group/ou are singular, as the platform requests them; the project's own
  // catalog handles (security.json) follow.
  USER_AUTH_SCOPES: "openid profile email group ou todos:read todos:manage",
  USER_AUTH_RESOURCE: "https://mock-idp.test/resources/simplest-todo4112",
};
