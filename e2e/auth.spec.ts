import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display sign in page", async ({ page }) => {
    await page.goto("/auth/signin")

    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
  })

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/auth/signin")

    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test("should show error for invalid email", async ({ page }) => {
    await page.goto("/auth/signin")

    await page.getByLabel(/email/i).fill("invalid-email")
    await page.getByLabel(/password/i).fill("password123")
    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test("should navigate to sign up page", async ({ page }) => {
    await page.goto("/auth/signin")

    await page.getByRole("link", { name: /sign up/i }).click()

    await expect(page).toHaveURL(/\/auth\/signup/)
    await expect(page.getByRole("heading", { name: /sign up/i })).toBeVisible()
  })

  test("should display sign up form", async ({ page }) => {
    await page.goto("/auth/signup")

    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible()
  })

  test("should show error when passwords do not match", async ({ page }) => {
    await page.goto("/auth/signup")

    await page.getByLabel(/^email/i).fill("test@example.com")
    await page.getByLabel(/^password/i).fill("password123")
    await page.getByLabel(/confirm password/i).fill("different123")
    await page.getByRole("button", { name: /sign up/i }).click()

    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test("should redirect to dashboard after successful sign in", async ({ page }) => {
    await page.goto("/auth/signin")

    // Mock successful authentication
    await page.route("**/auth/v1/token**", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: "mock-token",
          user: { id: "user-123", email: "test@example.com" },
        }),
      })
    })

    await page.getByLabel(/email/i).fill("test@example.com")
    await page.getByLabel(/password/i).fill("password123")
    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("should show loading state during sign in", async ({ page }) => {
    await page.goto("/auth/signin")

    await page.getByLabel(/email/i).fill("test@example.com")
    await page.getByLabel(/password/i).fill("password123")

    const signInButton = page.getByRole("button", { name: /sign in/i })
    await signInButton.click()

    await expect(signInButton).toBeDisabled()
    await expect(page.getByText(/signing in/i)).toBeVisible()
  })

  test("should allow password visibility toggle", async ({ page }) => {
    await page.goto("/auth/signin")

    const passwordInput = page.getByLabel(/password/i)
    await expect(passwordInput).toHaveAttribute("type", "password")

    await page.getByRole("button", { name: /show password/i }).click()
    await expect(passwordInput).toHaveAttribute("type", "text")

    await page.getByRole("button", { name: /hide password/i }).click()
    await expect(passwordInput).toHaveAttribute("type", "password")
  })
})
