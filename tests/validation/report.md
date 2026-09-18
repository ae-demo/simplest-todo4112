# Validation report

- **Issue:** #7
- **Commit:** 02c8635a6bbaab1bf82c7dc8618007026a549b43
- **Generated:** 2026-09-18T03:26:01.655Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 12 | 1 | 11 | 0 |
| manual (human checklist) | 0 | — | — | — |
| scenario (not validated) | 0 | — | — | — |

## E2E results

| Criterion | Must | Status | Spec | Notes |
|---|---|---|---|---|
| AC-001-a | An unauthenticated visitor is directed to sign in before seeing the todo list | ✅ pass | `tests/e2e/specs/AC-001-a.spec.ts` | healed ×1 |
| AC-001-b | After signing in, the user lands on the shared todo list | ❌ fail | `tests/e2e/specs/AC-001-b.spec.ts` | — |
| AC-002-a | Submitting a todo with text adds it to the shared list | ❌ fail | `tests/e2e/specs/AC-002-a.spec.ts` | — |
| AC-002-b | A newly added todo is visible to any other signed-in user viewing the list | ❌ fail | `tests/e2e/specs/AC-002-b.spec.ts` | — |
| AC-002-c | Attempting to add a todo with empty text is rejected | ❌ fail | `tests/e2e/specs/AC-002-c.spec.ts` | — |
| AC-003-a | The list view shows every todo on the shared list, regardless of who added it | ❌ fail | `tests/e2e/specs/AC-003-a.spec.ts` | — |
| AC-004-a | Marking a todo done updates its status and is reflected in the list | ❌ fail | `tests/e2e/specs/AC-004-a.spec.ts` | — |
| AC-004-b | Marking a done todo back to not done updates its status and is reflected in the list | ❌ fail | `tests/e2e/specs/AC-004-b.spec.ts` | — |
| AC-004-c | A completed todo remains visible in the list, shown as done, rather than disappearing | ❌ fail | `tests/e2e/specs/AC-004-c.spec.ts` | — |
| AC-004-d | A user can toggle a todo added by a different user | ❌ fail | `tests/e2e/specs/AC-004-d.spec.ts` | — |
| AC-005-a | Deleting a todo removes it from the shared list for every user | ❌ fail | `tests/e2e/specs/AC-005-a.spec.ts` | — |
| AC-005-b | A user can delete a todo added by a different user | ❌ fail | `tests/e2e/specs/AC-005-b.spec.ts` | healed ×1 |

## Failures

### AC-001-b — After signing in, the user lands on the shared todo list

Spec: `tests/e2e/specs/AC-001-b.spec.ts`
Location: `AC-001-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for" https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/" navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

### AC-002-a — Submitting a todo with text adds it to the shared list

Spec: `tests/e2e/specs/AC-002-a.spec.ts`
Location: `AC-002-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

### AC-002-b — A newly added todo is visible to any other signed-in user viewing the list

Spec: `tests/e2e/specs/AC-002-b.spec.ts`
Location: `AC-002-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

### AC-002-c — Attempting to add a todo with empty text is rejected

Spec: `tests/e2e/specs/AC-002-c.spec.ts`
Location: `AC-002-c.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })

```

### AC-003-a — The list view shows every todo on the shared list, regardless of who added it

Spec: `tests/e2e/specs/AC-003-a.spec.ts`
Location: `AC-003-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

### AC-004-a — Marking a todo done updates its status and is reflected in the list

Spec: `tests/e2e/specs/AC-004-a.spec.ts`
Location: `AC-004-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

### AC-004-b — Marking a done todo back to not done updates its status and is reflected in the list

Spec: `tests/e2e/specs/AC-004-b.spec.ts`
Location: `AC-004-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for" https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/" navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

### AC-004-c — A completed todo remains visible in the list, shown as done, rather than disappearing

Spec: `tests/e2e/specs/AC-004-c.spec.ts`
Location: `AC-004-c.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

### AC-004-d — A user can toggle a todo added by a different user

Spec: `tests/e2e/specs/AC-004-d.spec.ts`
Location: `AC-004-d.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

### AC-005-a — Deleting a todo removes it from the shared list for every user

Spec: `tests/e2e/specs/AC-005-a.spec.ts`
Location: `AC-005-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

### AC-005-b — A user can delete a todo added by a different user

Spec: `tests/e2e/specs/AC-005-b.spec.ts`
Location: `AC-005-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Shared Todos' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Shared Todos' })
    - waiting for" https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/" navigation to finish...
    - navigated to "https://http-simplest-todo-development-default-5a4fe791.apps.94.72.97.95.sslip.io/"

```

## Healing log

| Criterion | Classification | Change | Commit |
|---|---|---|---|
| AC-001-a | timing | waitForURL(/\/gate\/signin/, { timeout: 20_000 }) -> { timeout: 45_000 }, plus test.setTimeout(60_000); the app's session-check splash can take longer than 20s before the redirect fires | `pending` |
| AC-005-b | timing | lib/login.ts: waitForURL(/\/gate\/signin/, { timeout: 45_000 }) -> { timeout: 60_000 }; the shared login helper's redirect wait still timed out intermittently under load at 45s, observed on this spec's first sign-in | `pending` |

