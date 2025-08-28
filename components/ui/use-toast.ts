"use client"

import { toast as sonnerToast } from "sonner"

type Variant = "default" | "destructive" | "success" | "warning" | "info"

type ToastOptions = {
  title?: string
  description?: string
  variant?: Variant
  duration?: number
}

export function toast(options: ToastOptions | string) {
  if (typeof options === "string") {
    return sonnerToast(options)
  }

  const { title, description, variant = "default", duration } = options
  const message = title ?? description ?? ""

  // Map shadcn-style variants to sonner helpers
  switch (variant) {
    case "destructive":
      return sonnerToast.error(message, { description, duration })
    case "success":
      return sonnerToast.success(message, { description, duration })
    case "warning":
      return sonnerToast.warning(message, { description, duration })
    case "info":
      return sonnerToast.info?.(message, { description, duration }) ?? sonnerToast(message, { description, duration })
    default:
      return sonnerToast(message, { description, duration })
  }
}

// Simple compat hook (matches shadcn API usage patterns)
export function useToast() {
  return { toast }
}
