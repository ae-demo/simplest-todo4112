// spec: tests/validation/test-plan.md § AC-004-c
import { test, expect } from "@playwright/test";
import { login, expectSignedIn } from "../lib/login";

test("AC-004-c: a completed todo remains visible in the list, shown as done, rather than disappearing", async ({
  page,
}) => {
  test.setTimeout(90_000);
  // 1. Sign in, add a unique todo, mark it done
  await login(page);
  await expectSignedIn(page);
  const text = `ac-004-c-${Date.now()}`;
  await page.getByPlaceholder("Add a todo...").fill(text);
  await page.getByRole("button", { name: "Add" }).click();
  const row = page.getByRole("row", { name: new RegExp(text) });
  await expect(row).toBeVisible();
  await row.getByRole("checkbox").check();
  await expect(row.getByRole("checkbox")).toBeChecked();
  // 2. Reload the page
  await page.reload();
  await expectSignedIn(page);
  // Assert: still visible, still shown checked/done
  const rowAfterReload = page.getByRole("row", { name: new RegExp(text) });
  await expect(rowAfterReload).toBeVisible();
  await expect(rowAfterReload.getByRole("checkbox")).toBeChecked();
});
