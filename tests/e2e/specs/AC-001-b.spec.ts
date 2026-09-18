// spec: tests/validation/test-plan.md § AC-001-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/login";

test("AC-001-b: after signing in, the user lands on the shared todo list", async ({ page }) => {
  test.setTimeout(90_000);
  // 1. Complete the sign-in flow
  await login(page);
  // Assert: the shared todo list is shown
  await expect(page.getByRole("heading", { name: "Shared Todos" })).toBeVisible({ timeout: 20_000 });
});
