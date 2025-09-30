import { test, expect } from "@playwright/test"

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route("**/auth/v1/user**", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: "user-123",
          email: "test@example.com",
          user_metadata: { full_name: "Test User" },
        }),
      })
    })

    await page.goto("/dashboard")
  })

  test("should display dashboard header", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible()
    await expect(page.getByText(/welcome back/i)).toBeVisible()
  })

  test("should display user profile information", async ({ page }) => {
    await expect(page.getByText("Test User")).toBeVisible()
    await expect(page.getByText("test@example.com")).toBeVisible()
  })

  test("should display feature tiles", async ({ page }) => {
    await expect(page.getByText(/gift gut check/i)).toBeVisible()
    await expect(page.getByText(/smart search/i)).toBeVisible()
    await expect(page.getByText(/agentvault/i)).toBeVisible()
  })

  test("should navigate to feature page when tile is clicked", async ({ page }) => {
    await page.getByText(/gift gut check/i).click()

    await expect(page).toHaveURL(/\/gut-check/)
  })

  test("should display XP progress", async ({ page }) => {
    await expect(page.getByText(/xp/i)).toBeVisible()
    await expect(page.getByRole("progressbar")).toBeVisible()
  })

  test("should display credits balance", async ({ page }) => {
    await expect(page.getByText(/credits/i)).toBeVisible()
    await expect(page.getByText(/50/)).toBeVisible()
  })

  test("should show locked features for free tier", async ({ page }) => {
    const lockedFeature = page.getByText(/smart search/i).locator("..")
    await expect(lockedFeature.getByRole("img", { name: /lock/i })).toBeVisible()
  })

  test("should display upgrade CTA for locked features", async ({ page }) => {
    await page.getByText(/smart search/i).click()

    await expect(page.getByText(/upgrade to unlock/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /upgrade now/i })).toBeVisible()
  })

  test("should open navigation menu", async ({ page }) => {
    await page.getByRole("button", { name: /menu/i }).click()

    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /features/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /settings/i })).toBeVisible()
  })

  test("should toggle theme", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /toggle theme/i })
    await themeToggle.click()

    // Check if dark mode class is applied
    const html = page.locator("html")
    await expect(html).toHaveClass(/dark/)
  })

  test("should display recent activity", async ({ page }) => {
    await expect(page.getByText(/recent activity/i)).toBeVisible()
    await expect(page.getByText(/completed gift gut check/i)).toBeVisible()
  })

  test("should show empty state when no activity", async ({ page }) => {
    // Mock empty activity
    await page.route("**/rest/v1/user_activity**", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([]),
      })
    })

    await page.reload()

    await expect(page.getByText(/no recent activity/i)).toBeVisible()
  })

  test("should display loading skeleton on initial load", async ({ page }) => {
    await page.goto("/dashboard")

    // Check for skeleton loaders
    await expect(page.locator(".animate-pulse").first()).toBeVisible()
  })

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/rest/v1/agentgift_features**", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      })
    })

    await page.reload()

    await expect(page.getByText(/something went wrong/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible()
  })

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /menu/i })).toBeVisible()
  })
})
