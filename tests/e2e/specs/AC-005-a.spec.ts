// spec: tests/validation/test-plan.md § AC-005-a
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-005-a: deleting a todo removes it from the shared list for every user", async ({ browser }) => {
  test.setTimeout(150_000);
  // 1. Session A signs in, adds a unique todo
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await login(pageA);
  await expectSignedIn(pageA);
  const text = `ac-005-a-${Date.now()}`;
  await pageA.getByPlaceholder("Add a todo...").fill(text);
  await pageA.getByRole("button", { name: "Add" }).click();
  const rowA = pageA.getByRole("row", { name: new RegExp(text) });
  await expect(rowA).toBeVisible();

  // 2. Session B (separate context) signs in and confirms the todo is visible
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await login(pageB);
  await expectSignedIn(pageB);
  await expect(pageB.getByRole("row", { name: new RegExp(text) })).toBeVisible();

  // then session A deletes it
  await rowA.getByRole("button", { name: "Delete" }).click();
  // Assert: gone from session A
  await expect(pageA.getByRole("row", { name: new RegExp(text) })).toHaveCount(0);

  // Assert: gone from session B after reload
  await pageB.reload();
  await expectSignedIn(pageB);
  await expect(pageB.getByRole("row", { name: new RegExp(text) })).toHaveCount(0);

  await contextA.close();
  await contextB.close();
});
