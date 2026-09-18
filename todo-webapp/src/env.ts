// Typed read of window._env_, the platform's runtime config. Populated by
// /env-config.js, mounted into the served root at request time — never at
// build time. Throws rather than defaulting: a missing key here is a missing
// piece of platform wiring, not something to silently paper over.

type Env = {
  // The auth platform-resource dependency `user-auth`. All four are required
  // for sign-in to work; USER_AUTH_JWKS_URL is intentionally NOT here — the
  // browser never validates a token, the API gateway does.
  USER_AUTH_CLIENT_ID: string;
  USER_AUTH_ISSUER: string;
  USER_AUTH_SCOPES: string;
  USER_AUTH_RESOURCE: string;
};

declare global {
  interface Window {
    _env_: Env;
  }
}

if (!window._env_) {
  throw new Error(
    "window._env_ not set — /env-config.js failed to load. " +
      "The platform mounts this file; if you see this locally, host " +
      "/env-config.js from your dev server.",
  );
}

export const env: Env = window._env_;
