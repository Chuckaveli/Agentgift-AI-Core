import { renderHook, act } from "@testing-library/react"
import { useFormValidation } from "@/hooks/use-form-validation"
import { z } from "zod"
import jest from "jest" // Import jest to fix the undeclared variable error

describe("useFormValidation", () => {
  const schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
  })

  it("initializes with empty values and no errors", () => {
    const { result } = renderHook(() => useFormValidation(schema))

    expect(result.current.values).toEqual({})
    expect(result.current.errors).toEqual({})
    expect(result.current.isValid).toBe(false)
  })

  it("validates field on change", () => {
    const { result } = renderHook(() => useFormValidation(schema))

    act(() => {
      result.current.handleChange("email", "invalid-email")
    })

    expect(result.current.values.email).toBe("invalid-email")
    expect(result.current.errors.email).toBe("Invalid email")
    expect(result.current.isValid).toBe(false)
  })

  it("clears error when field becomes valid", () => {
    const { result } = renderHook(() => useFormValidation(schema))

    act(() => {
      result.current.handleChange("email", "invalid")
    })

    expect(result.current.errors.email).toBe("Invalid email")

    act(() => {
      result.current.handleChange("email", "valid@example.com")
    })

    expect(result.current.errors.email).toBeUndefined()
  })

  it("validates all fields on submit", async () => {
    const onSubmit = jest.fn()
    const { result } = renderHook(() => useFormValidation(schema, { onSubmit }))

    act(() => {
      result.current.handleChange("email", "invalid")
      result.current.handleChange("password", "short")
      result.current.handleChange("name", "a")
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.errors.email).toBe("Invalid email")
    expect(result.current.errors.password).toBe("Password must be at least 8 characters")
    expect(result.current.errors.name).toBe("Name must be at least 2 characters")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("calls onSubmit when form is valid", async () => {
    const onSubmit = jest.fn()
    const { result } = renderHook(() => useFormValidation(schema, { onSubmit }))

    act(() => {
      result.current.handleChange("email", "test@example.com")
      result.current.handleChange("password", "password123")
      result.current.handleChange("name", "John Doe")
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.errors).toEqual({})
    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      name: "John Doe",
    })
  })

  it("sets isSubmitting during submission", async () => {
    const onSubmit = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)))
    const { result } = renderHook(() => useFormValidation(schema, { onSubmit }))

    act(() => {
      result.current.handleChange("email", "test@example.com")
      result.current.handleChange("password", "password123")
      result.current.handleChange("name", "John Doe")
    })

    const submitPromise = act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.isSubmitting).toBe(true)

    await submitPromise

    expect(result.current.isSubmitting).toBe(false)
  })

  it("resets form to initial values", () => {
    const { result } = renderHook(() => useFormValidation(schema))

    act(() => {
      result.current.handleChange("email", "test@example.com")
      result.current.handleChange("password", "password123")
    })

    expect(result.current.values).toEqual({
      email: "test@example.com",
      password: "password123",
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.values).toEqual({})
    expect(result.current.errors).toEqual({})
  })

  it("sets field error manually", () => {
    const { result } = renderHook(() => useFormValidation(schema))

    act(() => {
      result.current.setFieldError("email", "Custom error message")
    })

    expect(result.current.errors.email).toBe("Custom error message")
  })

  it("updates isValid when all fields are valid", () => {
    const { result } = renderHook(() => useFormValidation(schema))

    expect(result.current.isValid).toBe(false)

    act(() => {
      result.current.handleChange("email", "test@example.com")
      result.current.handleChange("password", "password123")
      result.current.handleChange("name", "John Doe")
    })

    expect(result.current.isValid).toBe(true)
  })
})
