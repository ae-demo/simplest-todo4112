import { expect, type Page } from "@playwright/test";

// Drives the real SSO sign-in flow (IdP redirect + credentials form), never
// a shortcut. Credentials come only from the environment (roles gate ticket).
export async function login(page: Page): Promise<void> {
  const username = process.env.AEP_E2E_USERNAME;
  const password = process.env.AEP_E2E_PASSWORD;
  if (!username || !password) {
    throw new Error("AEP_E2E_USERNAME / AEP_E2E_PASSWORD must be set");
  }

  await page.goto("/");
  // The splash's silent-renew attempt can take longer than a typical
  // navigation timeout before it redirects to the IdP.
  await page.waitForURL(/\/gate\/signin/, { timeout: 60_000 });
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.hostname.includes("default-idp"), { timeout: 20_000 });
}

export async function expectSignedIn(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Shared Todos" })).toBeVisible({ timeout: 20_000 });
}
