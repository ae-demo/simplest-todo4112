// spec: tests/validation/test-plan.md § AC-002-a
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-002-a: submitting a todo with text adds it to the shared list", async ({ page }) => {
  test.setTimeout(90_000);
  // 1. Sign in
  await login(page);
  await expectSignedIn(page);
  // 2. Fill the "Add a todo..." field with a unique run-marked text
  const text = `ac-002-a-${Date.now()}`;
  await page.getByPlaceholder("Add a todo...").fill(text);
  // 3. Click "Add"
  await page.getByRole("button", { name: "Add" }).click();
  // Assert: a row with that text is visible in the list
  await expect(page.getByRole("row", { name: new RegExp(text) })).toBeVisible();
});
