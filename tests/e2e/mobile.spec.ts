import { expect, test, devices } from "@playwright/test";

test.use({
  ...devices["Pixel 7"]
});

test.describe("mobile flows", () => {
  test("opens and closes the mobile filter bottom sheet", async ({ page }) => {
    await page.goto("/catalog");

    await page.getByRole("button", { name: /фильтры/i }).click();
    await expect(page.getByRole("heading", { name: /подбор/i })).toBeVisible();
    await expect(page.getByText(/вариантов/i).last()).toBeVisible();

    await page.getByRole("button", { name: /^показать$/i }).click();
    await expect(page.getByRole("heading", { name: /подбор/i })).toBeHidden();
  });

  test("shows contact form and gallery on the resort page", async ({ page }) => {
    await page.goto("/catalog/saffron-coast-family-club");

    await expect(page.getByRole("heading", { level: 1, name: /saffron coast family club/i })).toBeVisible();
    await expect(page.getByText(/1 \/ \d+/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /уточнить условия/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /отправить заявку/i })).toBeVisible();
  });
});
