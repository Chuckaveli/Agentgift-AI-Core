import { render, screen } from "@/test-utils"
import { ErrorBoundary } from "@/components/error-boundary"
import jest from "jest" // Import jest to declare the variable

const ThrowError = () => {
  throw new Error("Test error")
}

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    )

    expect(screen.getByText("Test content")).toBeInTheDocument()
  })

  it("renders error UI when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/test error/i)).toBeInTheDocument()
  })

  it("shows retry button", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )

    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
  })

  it("resets error state when retry button is clicked", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )

    const retryButton = screen.getByRole("button", { name: /try again/i })
    retryButton.click()

    // After retry, render without error
    rerender(
      <ErrorBoundary>
        <div>Recovered content</div>
      </ErrorBoundary>,
    )

    expect(screen.getByText("Recovered content")).toBeInTheDocument()
  })

  it("displays error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/error details/i)).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })
})
