import { render, screen, waitFor } from "@/__tests__/utils/test-utils"
import userEvent from "@testing-library/user-event"
import { ConfirmDialog } from "@/components/confirm-dialog"
import jest from "jest"

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onConfirm: jest.fn(),
    title: "Confirm Action",
    description: "Are you sure you want to proceed?",
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders when open is true", () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText("Confirm Action")).toBeInTheDocument()
    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument()
  })

  it("does not render when open is false", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />)

    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument()
  })

  it("calls onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog {...defaultProps} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await user.click(confirmButton)

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it("calls onOpenChange when cancel button is clicked", async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog {...defaultProps} />)

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it("renders with destructive variant", () => {
    render(<ConfirmDialog {...defaultProps} variant="destructive" />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    expect(confirmButton).toHaveClass("bg-destructive")
  })

  it("shows loading state when confirming", async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await user.click(confirmButton)

    expect(confirmButton).toBeDisabled()
    expect(screen.getByText(/confirming/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled()
    })
  })

  it("uses custom confirm and cancel labels", () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Delete" cancelLabel="Keep" />)

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument()
  })

  it("closes dialog after successful confirmation", async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog {...defaultProps} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
