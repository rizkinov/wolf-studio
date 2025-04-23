"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * CBRECheckboxGroup - A group of checkboxes with a shared title
 */
interface CheckboxGroupProps {
  title?: string
  description?: string
  className?: string
  children: React.ReactNode
}

function CBRECheckboxGroup({
  title,
  description,
  className,
  children
}: CheckboxGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <h3 className="text-xl font-financier text-cbre-green mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-dark-grey font-calibre text-sm">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

/**
 * CheckboxWithText - A helper function to create a checkbox with label and description
 * 
 * Not exported as a component - use composition pattern instead:
 * 
 * <div className="flex items-start space-x-2">
 *   <Checkbox id="my-checkbox" checked={checked} onCheckedChange={setChecked} />
 *   <div className="grid gap-1.5">
 *     <Label htmlFor="my-checkbox">Label text</Label>
 *     <p className="text-xs text-light-grey">Description text</p>
 *   </div>
 * </div>
 */

// Export only the CheckboxGroup to encourage composition pattern with the base Checkbox
export { CBRECheckboxGroup }

// Export aliases for backward compatibility
export { 
  CBRECheckboxGroup as CheckboxGroup
}

// Props type for CBRECheckbox
interface CBRECheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
    labelText?: string;
    labelClassName?: string;
    id?: string;
  }

// Custom Checkbox component
const CBRECheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CBRECheckboxProps
>(({ className, labelText, labelClassName, id, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-cbre-green ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-cbre-green data-[state=checked]:text-primary-foreground",
        className
      )}
      id={id}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {labelText && (
      <label
        htmlFor={id}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          labelClassName
        )}
      >
        {labelText}
      </label>
    )}
  </div>
));
CBRECheckbox.displayName = CheckboxPrimitive.Root.displayName;

export { CBRECheckbox } 