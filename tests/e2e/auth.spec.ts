import { expect, test } from "@playwright/test";

test.describe("auth and dashboards", () => {
  test("owner can sign in and open the owner dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("owner@alakol.kz");
    await page.getByLabel("Пароль").fill("owner123");
    await page.getByRole("button", { name: /войти/i }).click();

    await expect(page).toHaveURL(/\/owner$/);
    await expect(page.getByRole("heading", { name: /ваши объекты и входящие заявки/i })).toBeVisible();
    await expect(page.getByText(/crm лидов/i)).toBeVisible();
  });

  test("admin can sign in and open the moderation dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("admin@alakol.kz");
    await page.getByLabel("Пароль").fill("admin123");
    await page.getByRole("button", { name: /войти/i }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: /очередь модерации и аудит изменений/i })).toBeVisible();
    await expect(page.getByText(/отзывы на модерации/i)).toBeVisible();
  });
});
