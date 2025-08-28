"use client"

import { Toaster } from "sonner"

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      duration={4000}
    />
  )
}
