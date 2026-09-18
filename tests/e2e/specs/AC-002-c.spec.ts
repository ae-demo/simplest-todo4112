// spec: tests/validation/test-plan.md § AC-002-c
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-002-c: attempting to add a todo with empty text is rejected", async ({ page }) => {
  test.setTimeout(90_000);
  // 1. Sign in
  await login(page);
  await expectSignedIn(page);
  // 2. Leave the "Add a todo..." field empty
  // Assert: the "Add" button is disabled
  await expect(page.getByRole("button", { name: "Add" })).toBeDisabled();
});
