import { render, screen } from "@/__tests__/utils/test-utils"
import { EmptyState } from "@/components/empty-state"
import { Gift } from "lucide-react"
import { jest } from "@jest/globals"

describe("EmptyState", () => {
  it("renders with title and description", () => {
    render(<EmptyState title="No gifts found" description="Try adjusting your search criteria" />)

    expect(screen.getByText("No gifts found")).toBeInTheDocument()
    expect(screen.getByText("Try adjusting your search criteria")).toBeInTheDocument()
  })

  it("renders with custom icon", () => {
    render(<EmptyState icon={Gift} title="No gifts" description="Start by adding your first gift" />)

    // Icon should be rendered
    const icon = screen.getByRole("img", { hidden: true })
    expect(icon).toBeInTheDocument()
  })

  it("renders action button when provided", () => {
    const handleAction = jest.fn()

    render(
      <EmptyState
        title="No gifts"
        description="Get started"
        action={{
          label: "Add Gift",
          onClick: handleAction,
        }}
      />,
    )

    const button = screen.getByRole("button", { name: "Add Gift" })
    expect(button).toBeInTheDocument()

    button.click()
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  it("renders link button when href is provided", () => {
    render(
      <EmptyState
        title="No gifts"
        description="Browse our catalog"
        action={{
          label: "Browse Gifts",
          href: "/gifts",
        }}
      />,
    )

    const link = screen.getByRole("link", { name: "Browse Gifts" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/gifts")
  })

  it("applies custom className", () => {
    const { container } = render(<EmptyState title="Test" description="Test description" className="custom-class" />)

    expect(container.firstChild).toHaveClass("custom-class")
  })

  it("renders without action button", () => {
    render(<EmptyState title="No results" description="Try a different search" />)

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
