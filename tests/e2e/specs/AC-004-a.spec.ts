// spec: tests/validation/test-plan.md § AC-004-a
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-004-a: marking a todo done updates its status and is reflected in the list", async ({ page }) => {
  test.setTimeout(90_000);
  // 1. Sign in, add a unique todo
  await login(page);
  await expectSignedIn(page);
  const text = `ac-004-a-${Date.now()}`;
  await page.getByPlaceholder("Add a todo...").fill(text);
  await page.getByRole("button", { name: "Add" }).click();
  const row = page.getByRole("row", { name: new RegExp(text) });
  await expect(row).toBeVisible();
  // 2. Check its row checkbox
  await row.getByRole("checkbox").check();
  // Assert: checked, and rendered strike-through
  await expect(row.getByRole("checkbox")).toBeChecked();
  await expect(row.getByText(text)).toHaveCSS("text-decoration-line", "line-through");
});
