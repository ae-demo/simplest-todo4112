// spec: tests/validation/test-plan.md § AC-005-b
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-005-b: a user can delete a todo added by a different user", async ({ browser }) => {
  test.setTimeout(150_000);
  // 1. Session A signs in, adds a unique todo
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await login(pageA);
  await expectSignedIn(pageA);
  const text = `ac-005-b-${Date.now()}`;
  await pageA.getByPlaceholder("Add a todo...").fill(text);
  await pageA.getByRole("button", { name: "Add" }).click();
  await expect(pageA.getByRole("row", { name: new RegExp(text) })).toBeVisible();

  // 2. Session B (separate context) signs in independently and deletes it
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await login(pageB);
  await expectSignedIn(pageB);
  const rowB = pageB.getByRole("row", { name: new RegExp(text) });
  await expect(rowB).toBeVisible();
  await rowB.getByRole("button", { name: "Delete" }).click();
  await expect(pageB.getByRole("row", { name: new RegExp(text) })).toHaveCount(0);

  // Assert: gone from session A after reload
  await pageA.reload();
  await expectSignedIn(pageA);
  await expect(pageA.getByRole("row", { name: new RegExp(text) })).toHaveCount(0);

  await contextA.close();
  await contextB.close();
});
