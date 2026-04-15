import { expect, test } from "@playwright/test";

test.describe("public browsing", () => {
  test("opens catalog from home and reaches a resort detail page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /выберите отдых на алаколе/i })).toBeVisible();
    await page.getByRole("link", { name: /смотреть каталог/i }).click({ force: true });

    await expect(page).toHaveURL(/\/catalog$/);
    await expect(page.getByRole("heading", { name: /каталог, в котором легко понять/i })).toBeVisible();

    await page.getByRole("link", { name: /nomad breeze village/i }).first().click();

    await expect(page).toHaveURL(/\/catalog\/nomad-breeze-village$/);
    await expect(page.getByRole("heading", { name: /nomad breeze village/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /цены и размещение/i })).toBeVisible();
  });

  test("submits a lead from the resort page and returns with success state", async ({ page }) => {
    await page.goto("/catalog/nomad-breeze-village");

    await page.getByLabel("Ваше имя").fill("Playwright Guest");
    await page.getByLabel("Телефон").fill("+7 700 123 45 67");
    await page.getByLabel("Комментарий").fill("Проверка e2e заявки через Playwright.");
    await page.getByRole("button", { name: /отправить заявку/i }).click();

    await expect(page).toHaveURL(/\/catalog\?lead=success$/);
    await expect(page.getByText("Заявка отправлена")).toBeVisible();
  });

  test("adds resorts to comparison and opens compare page", async ({ page }) => {
    await page.goto("/catalog/nomad-breeze-village");

    await page.getByRole("button", { name: /сравнить/i }).click();
    await expect(page.getByRole("link", { name: /открыть сравнение/i })).toBeVisible();

    await page.goto("/catalog/saffron-coast-family-club");
    await page.getByRole("button", { name: /сравнить/i }).click();

    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /сравните зоны отдыха/i })).toBeVisible();
    await expect(page.getByText(/nomad breeze village/i)).toBeVisible();
    await expect(page.getByText(/saffron coast family club/i)).toBeVisible();
    await expect(page.getByText(/таблица отличий/i)).toBeVisible();
  });

  test("adds resort to favorites and opens favorites page", async ({ page }) => {
    await page.goto("/catalog/azure-dune-resort");

    await page.getByRole("button", { name: /сохранить/i }).click();
    await expect(page.getByRole("link", { name: /избранное/i }).first()).toBeVisible();

    await page.goto("/favorites");
    await expect(page.getByRole("heading", { name: /сохраните то, что понравилось/i })).toBeVisible();
    await expect(page.getByText(/azure dune resort/i)).toBeVisible();
  });
});
