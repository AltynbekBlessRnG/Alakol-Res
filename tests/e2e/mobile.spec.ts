import { expect, test, devices } from "@playwright/test";

test.use({
  ...devices["Pixel 7"]
});

test.describe("mobile flows", () => {
  test("opens and closes the mobile filter bottom sheet", async ({ page }) => {
    await page.goto("/catalog");

    await page.getByRole("button", { name: /фильтры и подбор/i }).click();
    await expect(page.getByRole("heading", { name: /подобрать на телефоне/i })).toBeVisible();
    await expect(page.getByText(/здесь всё собрано в один bottom-sheet/i)).toBeVisible();

    await page.getByRole("button", { name: /показать варианты/i }).click();
    await expect(page.getByRole("heading", { name: /подобрать на телефоне/i })).toBeHidden();
  });

  test("shows sticky contact actions and gallery on the resort page", async ({ page }) => {
    await page.goto("/catalog/nomad-breeze-village");

    await expect(page.getByText(/быстрый контакт/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /заявка/i })).toBeVisible();
    await expect(page.getByText(/1 \/ \d+/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^позвонить$/i }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: /whatsapp/i }).last()).toBeVisible();
  });
});
