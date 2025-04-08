"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Import the base Checkbox component
import { Checkbox as BaseCheckbox } from "@/components/ui/checkbox"

/**
 * CBRECheckbox - A CBRE-styled checkbox component
 * 
 * Features:
 * - CBRE styling with customizable props
 * - Uses the shadcn/ui checkbox with CBRE-specific defaults
 */
function CBRECheckbox({
  className,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof BaseCheckbox>) {
  const handleCheckedChange = React.useCallback(
    (checked: boolean | "indeterminate") => {
      if (onCheckedChange) {
        onCheckedChange(checked);
      }
    },
    [onCheckedChange]
  );

  return (
    <BaseCheckbox
      className={cn(
        "border-light-grey data-[state=checked]:bg-cbre-green data-[state=checked]:border-cbre-green focus-visible:ring-accent-green/50",
        className
      )}
      onCheckedChange={handleCheckedChange}
      {...props}
    />
  )
}

/**
 * CBRECheckboxWithLabel - A CBRE-styled checkbox with an associated label
 */
interface CBRECheckboxWithLabelProps extends React.ComponentProps<typeof BaseCheckbox> {
  label: string
  description?: string
  labelClassName?: string
  descriptionClassName?: string
}

function CBRECheckboxWithLabel({
  label,
  description,
  className,
  labelClassName,
  descriptionClassName,
  onCheckedChange,
  ...props
}: CBRECheckboxWithLabelProps) {
  return (
    <div className="flex items-start space-x-2">
      <CBRECheckbox 
        className={className} 
        id={props.id} 
        onCheckedChange={(checked) => {
          if (onCheckedChange) {
            onCheckedChange(checked === true);
          }
        }}
        {...props} 
      />
      <div className="flex flex-col">
        <label 
          htmlFor={props.id} 
          className={cn(
            "text-sm font-calibre text-dark-grey cursor-pointer",
            labelClassName
          )}
        >
          {label}
        </label>
        {description && (
          <p className={cn(
            "text-xs font-calibre text-light-grey",
            descriptionClassName
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export { CBRECheckbox, CBRECheckboxWithLabel }

// Aliases for convenience
export { CBRECheckbox as Checkbox, CBRECheckboxWithLabel as CheckboxWithLabel } 