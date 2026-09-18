# Validation test plan — issue #7

Target: `todo-webapp` (primary), backed by `todo-api`. Single test account
available (`test-collaborator`, role Collaborator) per the roles gate ticket
(#3) — no second role/account was provisioned, so criteria that call for "a
different user" are validated with a second, independent signed-in browser
context under the same account (two separate sessions/tokens), noted per
criterion below.

## Known blocking defect (discovered during exploration)

Signing in through the app's real SSO flow never reaches the todo list: the
user lands on a **"No access yet"** screen instead, for every sign-in,
regardless of role.

Root cause, confirmed live:
- `todo-webapp/workload.yaml` binds `client_id`, `issuer`, `jwks_url`,
  `scopes` from the `user-auth` platform resource dependency, but never binds
  its `resource` output to `USER_AUTH_RESOURCE`.
- The deployed `/env-config.js` therefore has `USER_AUTH_SCOPES` correct
  (`... todos:read todos:manage`) but has no `USER_AUTH_RESOURCE` key at all.
- `src/authz/session.ts` reads `env.USER_AUTH_RESOURCE` as `undefined` and
  passes it as the OAuth `resource` indicator (RFC 8707). Confirmed live: the
  captured `/oauth2/authorize` request has `scope=...todos:read+todos:manage`
  in the query string but **no `resource` parameter**.
- Without the resource indicator, the IdP mints a token against its default
  audience instead of this project's resource server — confirmed from the
  stored token: `aud` is `.../mcp`, and the granted `scope` claim is only
  `openid profile email group ou` (the two `todos:*` scopes the app asked for
  are silently dropped).
- `App.tsx`'s `hasScopedReach(scopes, signedIn)` is then false, so the app
  renders `NoAccess` instead of the todo list — for every signed-in user,
  independent of their assigned role.

This is a genuine, reproducible app/deployment defect, not a test issue. Every
spec below drives the real sign-in flow and asserts what the criterion
actually claims; where the criterion requires reaching the todo list, the
spec fails honestly against this defect rather than being weakened to match
observed behavior.

## AC-001-a — An unauthenticated visitor is directed to sign in before seeing the todo list

- Target: todo-webapp (primary)
- Steps:
  1. Navigate to `/` with no session.
  2. Wait for the redirect away from the app origin.
- Assert: the IdP's Sign In heading/form is visible; the "Shared Todos"
  heading is never rendered.
- Source of truth: live redirect observed via playwright-cli
  (`/` → `https://default-idp.../gate/signin`).

## AC-001-b — After signing in, the user lands on the shared todo list

- Target: todo-webapp (primary)
- Steps:
  1. Complete the sign-in flow as `test-collaborator`.
- Assert: the "Shared Todos" heading is visible.
- Source of truth: `todo-webapp/src/pages/TodoListPage.tsx` (heading text)
  and `todo-webapp/src/App.tsx` (routing). Live run currently shows
  **"No access yet"** instead — see defect above. Expected to fail genuinely.

## AC-002-a — Submitting a todo with text adds it to the shared list

- Target: todo-webapp (primary)
- Steps:
  1. Sign in.
  2. Fill the "Add a todo..." field with a unique run-marked text.
  3. Click "Add".
- Assert: a row with that text is visible in the list.
- Source of truth: `TodoListPage.tsx` (`handleAdd`, placeholder text, table
  row rendering).

## AC-002-b — A newly added todo is visible to any other signed-in user viewing the list

- Target: todo-webapp (primary)
- Steps:
  1. Session A signs in and adds a unique todo.
  2. Session B (separate browser context, same test account — no second
     account provisioned) signs in independently and opens the list.
- Assert: session B sees the todo session A added.
- Source of truth: `TodoListPage.tsx` (`GET /todos` loads the full shared
  list, no per-user filter) and `openapi.yaml` (`/todos` has no `createdBy`
  filter parameter).

## AC-002-c — Attempting to add a todo with empty text is rejected

- Target: todo-webapp (primary)
- Steps:
  1. Sign in.
  2. Leave the "Add a todo..." field empty (or whitespace only).
- Assert: the "Add" button is disabled.
- Source of truth: `TodoListPage.tsx` —
  `disabled={newText.trim().length === 0 || adding}`.

## AC-003-a — The list view shows every todo on the shared list, regardless of who added it

- Target: todo-webapp (primary)
- Steps:
  1. Sign in and add two uniquely-named todos in the same session.
- Assert: both todos are visible simultaneously in the list (list is not
  filtered to a single item or truncated to the latest one).
- Source of truth: `TodoListPage.tsx` (`GET /todos` renders every row from
  `data.data`, `Added by` column shows `createdBy` unconditionally).

## AC-004-a — Marking a todo done updates its status and is reflected in the list

- Target: todo-webapp (primary)
- Steps:
  1. Sign in, add a unique todo.
  2. Check its row checkbox.
- Assert: the checkbox is checked and the todo's text is rendered
  strike-through.
- Source of truth: `TodoListPage.tsx` (`handleToggle`, `Checkbox checked`,
  strike-through `sx`).

## AC-004-b — Marking a done todo back to not done updates its status and is reflected in the list

- Target: todo-webapp (primary)
- Steps:
  1. Continue from a todo marked done (as AC-004-a).
  2. Uncheck its row checkbox.
- Assert: the checkbox is unchecked and the strike-through style is gone.
- Source of truth: same as AC-004-a, toggled the other direction.

## AC-004-c — A completed todo remains visible in the list, shown as done, rather than disappearing

- Target: todo-webapp (primary)
- Steps:
  1. Sign in, add a unique todo, mark it done.
  2. Reload the page.
- Assert: the todo is still visible in the list and still shown checked/done.
- Source of truth: `TodoListPage.tsx` — done todos stay in `todos` array,
  only styled differently; `GET /todos` has no "hide completed" filter.

## AC-004-d — A user can toggle a todo added by a different user

- Target: todo-webapp (primary)
- Steps:
  1. Session A signs in, adds a unique todo.
  2. Session B (separate context; see note under AC-002-b) signs in
     independently and toggles that todo done.
- Assert: session A, after reload, sees the todo marked done.
- Source of truth: `openapi.yaml` — `PATCH /todos/{todoId}` is scope-gated
  (`todos:manage`) only, with no ownership/`createdBy` check.

## AC-005-a — Deleting a todo removes it from the shared list for every user

- Target: todo-webapp (primary)
- Steps:
  1. Session A signs in, adds a unique todo.
  2. Session B (separate context) signs in and confirms the todo is visible,
     then session A deletes it.
- Assert: the todo disappears from session A's list and from session B's
  list after reload.
- Source of truth: `TodoListPage.tsx` (`handleDelete`), `openapi.yaml`
  (`DELETE /todos/{todoId}` → 204).

## AC-005-b — A user can delete a todo added by a different user

- Target: todo-webapp (primary)
- Steps:
  1. Session A signs in, adds a unique todo.
  2. Session B (separate context) signs in independently and deletes it.
- Assert: the todo is gone from session A's list after reload.
- Source of truth: `openapi.yaml` — `DELETE /todos/{todoId}` is scope-gated
  only, no ownership check.

## Note on two-session criteria

No second test account/role exists in this environment (roles gate ticket #3
provisioned only `test-collaborator`). Criteria requiring "a different user"
are validated with a second independent signed-in browser context on the
same account, which still exercises cross-session visibility and the
absence of any ownership check in the API — the closest available proxy
given the provisioned test users.
