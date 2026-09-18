// spec: tests/validation/test-plan.md § AC-003-a
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-003-a: the list view shows every todo on the shared list, regardless of who added it", async ({
  page,
}) => {
  test.setTimeout(90_000);
  // 1. Sign in and add two uniquely-named todos in the same session
  await login(page);
  await expectSignedIn(page);
  const run = Date.now();
  const textOne = `ac-003-a-one-${run}`;
  const textTwo = `ac-003-a-two-${run}`;
  for (const text of [textOne, textTwo]) {
    await page.getByPlaceholder("Add a todo...").fill(text);
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByRole("row", { name: new RegExp(text) })).toBeVisible();
  }
  // Assert: both todos are visible simultaneously (list isn't truncated/filtered)
  await expect(page.getByRole("row", { name: new RegExp(textOne) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(textTwo) })).toBeVisible();
});
