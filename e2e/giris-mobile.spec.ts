import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { width: 320, height: 568, name: "320" },
  { width: 375, height: 667, name: "iPhone SE 375×667" },
  { width: 390, height: 844, name: "390" },
  { width: 430, height: 932, name: "430" },
] as const;

async function assertNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

async function assertTabsSingleRow(page: Page) {
  const tabs = page.getByRole("tablist", { name: "Hesap türü" }).getByRole("tab");
  await expect(tabs).toHaveCount(3);
  const tops = await tabs.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
}

async function assertSendButton(page: Page) {
  const send = page.getByRole("button", { name: "Kod gönder" });
  await expect(send).toBeVisible();
  const box = await send.boundingBox();
  expect(box).toBeTruthy();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  const widths = await send.evaluate((el) => {
    const self = el.getBoundingClientRect();
    const parent = el.parentElement?.getBoundingClientRect();
    return { self: self.width, parent: parent?.width ?? 0 };
  });
  expect(widths.self).toBeGreaterThanOrEqual(widths.parent - 2);
}

async function assertKeyboardKeepsSendVisible(page: Page, viewport: { width: number; height: number }) {
  await page.getByLabel("Telefon").focus();
  const keyboardHeight = Math.round(viewport.height * 0.48);
  await page.setViewportSize({
    width: viewport.width,
    height: Math.max(280, viewport.height - keyboardHeight),
  });
  const send = page.getByRole("button", { name: "Kod gönder" });
  await expect(send).toBeVisible();
  const box = await send.boundingBox();
  const vh = page.viewportSize()?.height ?? 0;
  expect(box).toBeTruthy();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(vh);
}

for (const viewport of VIEWPORTS) {
  test(`giriş ${viewport.name}: taşmaz, sekmeler tek satır, Kod gönder görünür`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/app/giris");
    await expect(page.getByRole("button", { name: "Kod gönder" })).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await assertTabsSingleRow(page);
    await assertSendButton(page);
    await assertKeyboardKeepsSendVisible(page, viewport);
  });
}
