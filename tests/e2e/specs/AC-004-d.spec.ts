// spec: tests/validation/test-plan.md § AC-004-d
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-004-d: a user can toggle a todo added by a different user", async ({ browser }) => {
  test.setTimeout(150_000);
  // 1. Session A signs in, adds a unique todo
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await login(pageA);
  await expectSignedIn(pageA);
  const text = `ac-004-d-${Date.now()}`;
  await pageA.getByPlaceholder("Add a todo...").fill(text);
  await pageA.getByRole("button", { name: "Add" }).click();
  const rowA = pageA.getByRole("row", { name: new RegExp(text) });
  await expect(rowA).toBeVisible();

  // 2. Session B (separate context) signs in independently and toggles it done
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await login(pageB);
  await expectSignedIn(pageB);
  const rowB = pageB.getByRole("row", { name: new RegExp(text) });
  await expect(rowB).toBeVisible();
  await rowB.getByRole("checkbox").check();
  await expect(rowB.getByRole("checkbox")).toBeChecked();

  // Assert: session A, after reload, sees the todo marked done
  await pageA.reload();
  await expectSignedIn(pageA);
  const rowAAfterReload = pageA.getByRole("row", { name: new RegExp(text) });
  await expect(rowAAfterReload.getByRole("checkbox")).toBeChecked();

  await contextA.close();
  await contextB.close();
});
