import { test, expect, type Page } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
mkdirSync("docs/evidence", { recursive: true });
const consoleErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  consoleErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});
test.afterEach(async ({ page }) => {
  expect(consoleErrors.get(page) || []).toEqual([]);
});
async function settle(page: Page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await page.waitForTimeout(1700);
}
async function scroll(page: Page, y: number) {
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    y,
  );
  await page.waitForTimeout(1100);
}
const viewports = [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [375, 812],
];
for (const [width, height] of viewports) {
  test(`responsive ${width}x${height}: six scroll positions and no overflow`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await settle(page);
    await expect(page.locator(".project")).toHaveCount(11);
    await expect(page.locator(".feed")).toHaveCount(13);
    await expect(page.locator(".faq-item")).toHaveCount(9);
    for (const percent of [0, 20, 40, 60, 80, 100]) {
      const total = await page.evaluate(
        () => document.documentElement.scrollHeight - innerHeight,
      );
      await scroll(page, (total * percent) / 100);
      const dimensions = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll, `overflow at ${percent}%`).toBeLessThanOrEqual(
        dimensions.width + 1,
      );
      await page.screenshot({
        path: `docs/evidence/viewport-${width}-${percent}.png`,
      });
    }
    expect(errors).toEqual([]);
  });
}
test("scroll choreography changes transforms, masks, text emphasis, and reverses", async ({
  page,
}) => {
  await page.goto("/");
  await settle(page);
  const hero = page.locator(".hero-title .line-one");
  const start = await hero.evaluate((el) => getComputedStyle(el).transform);
  await scroll(page, 420);
  const end = await hero.evaluate((el) => getComputedStyle(el).transform);
  expect(end).not.toEqual(start);
  const design = page.locator('[data-design-word="design"]');
  const code = page.locator('[data-design-word="code"]');
  const amp = page.locator("[data-design-amp]");
  await expect(design).toHaveCount(1);
  await expect(code).toHaveCount(1);
  const top = await page
    .locator(".design-section")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  const read = () =>
    Promise.all(
      [design, code, amp].map((el) =>
        el.evaluate((el) => getComputedStyle(el).transform),
      ),
    );
  await scroll(page, top + 20);
  const before = await read();
  await page.screenshot({ path: "docs/evidence/design-before.png" });
  await scroll(page, top + 700);
  const during = await read();
  await page.screenshot({ path: "docs/evidence/design-during.png" });
  await scroll(page, top + 1350);
  const after = await read();
  await page.screenshot({ path: "docs/evidence/design-after.png" });
  before.forEach((s, i) => expect(during[i]).not.toEqual(s));
  during.forEach((s, i) => expect(after[i]).not.toEqual(s));
  await scroll(page, top + 20);
  const reverse = await read();
  reverse.forEach((s, i) => {
    const a = s.match(/-?\d+\.?\d*/g)!.map(Number);
    const b = before[i].match(/-?\d+\.?\d*/g)!.map(Number);
    a.forEach((n, j) => expect(Math.abs(n - b[j])).toBeLessThan(1));
  });
  const project = page.locator(".project").first();
  const projectTop = await project.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY,
  );
  await scroll(page, projectTop - 850);
  const maskBefore = await project
    .locator(".project-art")
    .evaluate((el) => getComputedStyle(el).clipPath);
  await scroll(page, projectTop - 150);
  const maskAfter = await project
    .locator(".project-art")
    .evaluate((el) => getComputedStyle(el).clipPath);
  expect(maskBefore).not.toEqual(maskAfter);
  const about = page.locator(".about-statement");
  const aboutTop = await about.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY,
  );
  await scroll(page, aboutTop - 850);
  const colorBefore = await page
    .locator(".about-word")
    .last()
    .evaluate((el) => getComputedStyle(el).color);
  await scroll(page, aboutTop + 200);
  const colorAfter = await page
    .locator(".about-word")
    .last()
    .evaluate((el) => getComputedStyle(el).color);
  expect(colorBefore).not.toEqual(colorAfter);
  writeFileSync(
    "docs/evidence/motion-transforms.json",
    JSON.stringify(
      {
        hero: { start, end },
        design: { before, during, after, reverse },
        mask: { before: maskBefore, after: maskAfter },
        about: { before: colorBefore, after: colorAfter },
      },
      null,
      2,
    ),
  );
});
test("all thirteen feeds visibly animate and expand with keyboard dismissal", async ({
  page,
}) => {
  test.setTimeout(300000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await settle(page);
  const records = [];
  for (let i = 0; i < 13; i++) {
    const feed = page.locator(".feed").nth(i);
    await feed.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await expect(feed.locator(".motion-art")).toHaveClass(/is-playing/);
    const image1 = await feed.screenshot({
      path: `docs/evidence/cam-${i + 1}-a.png`,
    });
    await page.waitForTimeout(800);
    const image2 = await feed.screenshot({
      path: `docs/evidence/cam-${i + 1}-b.png`,
    });
    const hash1 = createHash("sha256").update(image1).digest("hex");
    const hash2 = createHash("sha256").update(image2).digest("hex");
    expect(hash1, `CAM ${i + 1} must change pixels`).not.toEqual(hash2);
    await expect(feed.locator(".webgl-fallback")).toHaveCount(0);
    await feed.click();
    await expect(page.locator(".art-modal")).toBeVisible();
    await expect(page.locator(".modal-art")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".art-modal")).not.toBeVisible();
    await expect(feed).toBeFocused();
    records.push({ camera: i + 1, hash1, hash2, changed: true });
  }
  expect(errors).toEqual([]);
  writeFileSync(
    "docs/evidence/feed-motion.json",
    JSON.stringify(records, null, 2),
  );
});
test("library search, filters, six demos, clipboard, legal routes and navigation", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/library");
  await expect(page.locator(".library-card")).toHaveCount(6);
  await page.getByRole("button", { name: "WebGL", exact: true }).click();
  await expect(page.locator(".library-card")).toHaveCount(2);
  await page.getByRole("button", { name: /All/ }).click();
  await page.getByPlaceholder("Find an experiment…").fill("menu");
  await expect(page.locator(".library-card")).toHaveCount(1);
  await page.getByPlaceholder("Find an experiment…").fill("zzzz");
  await expect(page.getByText("No signals found.")).toBeVisible();
  await page.getByRole("button", { name: /Reset filters/ }).click();
  await expect(page.locator(".library-card")).toHaveCount(6);
  await page.screenshot({ path: "docs/evidence/library.png" });
  for (const slug of [
    "menu-icon-morph",
    "animated-footer-ascii",
    "ai-status-orb",
    "magnetic-button",
    "kinetic-type",
    "orbital-study",
  ]) {
    await page.goto(`/prompts/${slug}`);
    await expect(page.locator(".prompt-demo")).toBeVisible();
    await page.getByRole("button", { name: "Copy code ↗" }).click();
    await expect(page.getByRole("button", { name: "Copied ✓" })).toBeVisible();
    expect(
      (await page.evaluate(() => navigator.clipboard.readText())).length,
    ).toBeGreaterThan(50);
    if (slug === "menu-icon-morph") {
      const button = page.getByRole("button", { name: "Toggle menu icon" });
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
    }
    if (slug === "ai-status-orb") {
      await page.getByRole("button", { name: "thinking", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "thinking", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
    }
    if (slug === "kinetic-type") {
      await page.getByRole("slider").fill("90");
      await expect(page.getByRole("slider")).toHaveValue("90");
    }
  }
  for (const route of [
    "/legal",
    "/privacy",
    "/prompts/not-a-demo",
    "/missing",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("mobile menu, FAQ, project viewer, focus and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await settle(page);
  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to content")).toBeFocused();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator(".mobile-menu")).toBeVisible();
  await page
    .locator(".mobile-menu")
    .getByRole("link", { name: "Library ↗" })
    .click();
  await expect(page).toHaveURL(/library/);
  await expect(page.locator(".mobile-menu")).not.toBeVisible();
  await page.goto("/");
  await settle(page);
  for (const item of await page.locator(".faq-item").all()) {
    const summary = item.locator("summary");
    await summary.scrollIntoViewIfNeeded();
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(item).toHaveAttribute("open", "");
    await expect(item.locator(".faq-answer")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(item).not.toHaveAttribute("open", "");
  }
  for (let i = 0; i < 11; i++) {
    const button = page.locator(".project-art").nth(i);
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await expect(page.locator(".art-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await settle(page);
  expect(await page.locator(".pin-spacer").count()).toBe(0);
  const scene = page.locator(".hero .art-canvas");
  await expect(scene.locator("canvas")).toHaveCount(1);
  const frame = await scene.getAttribute("data-frame");
  await page.waitForTimeout(700);
  expect(await scene.getAttribute("data-frame")).toEqual(frame);
  await page.screenshot({ path: "docs/evidence/reduced-motion-mobile.png" });
});

test("offscreen scenes release WebGL contexts and CSS loops pause", async ({
  page,
}) => {
  await page.goto("/");
  await settle(page);
  const hero = page.locator(".hero .art-canvas");
  await expect(hero.locator("canvas")).toHaveCount(1);
  const feed = page.locator(".feed").nth(3);
  await feed.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await expect(hero.locator("canvas")).toHaveCount(0);
  await expect(feed.locator(".motion-art")).toHaveClass(/is-playing/);
  await scroll(page, 0);
  await expect(hero.locator("canvas")).toHaveCount(1);
  await expect(feed.locator(".motion-art")).not.toHaveClass(/is-playing/);
});
