"use client"

import { useState } from "react"
import { z } from "zod"

export function useFormValidation<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = (data: z.infer<T>): boolean => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const validateField = (field: string, value: any): boolean => {
    try {
      const fieldSchema = schema.shape[field]
      if (fieldSchema) {
        fieldSchema.parse(value)
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
        return true
      }
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors[0]?.message || "Invalid value",
        }))
      }
      return false
    }
  }

  const touchField = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const resetValidation = () => {
    setErrors({})
    setTouched({})
  }

  return {
    errors,
    touched,
    validate,
    validateField,
    touchField,
    setErrors,
    resetValidation,
  }
}
