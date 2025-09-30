import { render, screen } from "@/__tests__/utils/test-utils"
import userEvent from "@testing-library/user-event"
import { Pagination } from "@/components/pagination"
import jest from "jest" // Import jest to fix the undeclared variable error

describe("Pagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders pagination controls", () => {
    render(<Pagination {...defaultProps} />)

    expect(screen.getByRole("navigation")).toBeInTheDocument()
    expect(screen.getByText("Page 1 of 10")).toBeInTheDocument()
  })

  it("disables previous button on first page", () => {
    render(<Pagination {...defaultProps} currentPage={1} />)

    const prevButton = screen.getByRole("button", { name: /previous/i })
    expect(prevButton).toBeDisabled()
  })

  it("disables next button on last page", () => {
    render(<Pagination {...defaultProps} currentPage={10} totalPages={10} />)

    const nextButton = screen.getByRole("button", { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it("calls onPageChange when next button is clicked", async () => {
    const user = userEvent.setup()
    render(<Pagination {...defaultProps} currentPage={5} />)

    const nextButton = screen.getByRole("button", { name: /next/i })
    await user.click(nextButton)

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(6)
  })

  it("calls onPageChange when previous button is clicked", async () => {
    const user = userEvent.setup()
    render(<Pagination {...defaultProps} currentPage={5} />)

    const prevButton = screen.getByRole("button", { name: /previous/i })
    await user.click(prevButton)

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4)
  })

  it("renders page numbers for small page counts", () => {
    render(<Pagination {...defaultProps} totalPages={5} currentPage={3} />)

    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("4")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("shows ellipsis for large page counts", () => {
    render(<Pagination {...defaultProps} totalPages={20} currentPage={10} />)

    const ellipsis = screen.getAllByText("...")
    expect(ellipsis.length).toBeGreaterThan(0)
  })

  it("highlights current page", () => {
    render(<Pagination {...defaultProps} currentPage={5} />)

    const currentPageButton = screen.getByRole("button", { name: "5" })
    expect(currentPageButton).toHaveAttribute("aria-current", "page")
  })

  it("calls onPageChange when page number is clicked", async () => {
    const user = userEvent.setup()
    render(<Pagination {...defaultProps} totalPages={5} currentPage={1} />)

    const pageButton = screen.getByRole("button", { name: "3" })
    await user.click(pageButton)

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3)
  })

  it("handles single page correctly", () => {
    render(<Pagination {...defaultProps} totalPages={1} currentPage={1} />)

    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled()
  })
})
