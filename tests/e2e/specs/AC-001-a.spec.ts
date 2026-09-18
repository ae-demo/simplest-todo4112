// spec: tests/validation/test-plan.md § AC-001-a
import { test, expect } from "@playwright/test";

test("AC-001-a: an unauthenticated visitor is directed to sign in before seeing the todo list", async ({
  page,
}) => {
  test.setTimeout(60_000);
  // 1. Navigate to / with no session
  await page.goto("/");
  // 2. Wait for the redirect away from the app origin (the splash's silent-
  // renew attempt can take longer than a typical navigation timeout)
  await page.waitForURL(/\/gate\/signin/, { timeout: 45_000 });
  // Assert: the IdP sign-in form is shown, not the todo list
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shared Todos" })).toHaveCount(0);
});
