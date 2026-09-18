// spec: tests/validation/test-plan.md § AC-004-b
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-004-b: marking a done todo back to not done updates its status and is reflected in the list", async ({
  page,
}) => {
  test.setTimeout(90_000);
  // 1. Sign in, add a unique todo, and mark it done
  await login(page);
  await expectSignedIn(page);
  const text = `ac-004-b-${Date.now()}`;
  await page.getByPlaceholder("Add a todo...").fill(text);
  await page.getByRole("button", { name: "Add" }).click();
  const row = page.getByRole("row", { name: new RegExp(text) });
  await expect(row).toBeVisible();
  const checkbox = row.getByRole("checkbox");
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  // 2. Uncheck its row checkbox
  await checkbox.uncheck();
  // Assert: unchecked, and strike-through removed
  await expect(checkbox).not.toBeChecked();
  await expect(row.getByText(text)).not.toHaveCSS("text-decoration-line", "line-through");
});
