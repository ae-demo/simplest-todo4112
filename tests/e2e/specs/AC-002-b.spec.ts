// spec: tests/validation/test-plan.md § AC-002-b
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-002-b: a newly added todo is visible to any other signed-in user viewing the list", async ({
  browser,
}) => {
  test.setTimeout(150_000);
  // 1. Session A signs in and adds a unique todo
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await login(pageA);
  await expectSignedIn(pageA);
  const text = `ac-002-b-${Date.now()}`;
  await pageA.getByPlaceholder("Add a todo...").fill(text);
  await pageA.getByRole("button", { name: "Add" }).click();
  await expect(pageA.getByRole("row", { name: new RegExp(text) })).toBeVisible();

  // 2. Session B (separate context, no second test account provisioned)
  // signs in independently and opens the list
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await login(pageB);
  await expectSignedIn(pageB);
  // Assert: session B sees the todo session A added
  await expect(pageB.getByRole("row", { name: new RegExp(text) })).toBeVisible();

  await contextA.close();
  await contextB.close();
});
