import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-gray-900",
        muted: "text-gray-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Label = React.forwardRef<
  HTMLLabelElement,
  React.HTMLAttributes<HTMLLabelElement> & VariantProps<typeof labelVariants>
>(({ className, children, ...props }, ref) => (
  <label className={cn(labelVariants(), className)} ref={ref} {...props}>
    {children}
  </label>
))
Label.displayName = "Label"

export { Label, labelVariants }
