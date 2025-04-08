"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Import the base Checkbox component
import { Checkbox } from "@/components/ui/checkbox"

/**
 * CBRECheckboxItem - A CBRE-styled checkbox with label and optional description
 */
interface CheckboxItemProps {
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  required?: boolean
  name?: string
  value?: string
  label: string
  description?: string
  className?: string
  checkboxClassName?: string
  labelClassName?: string
  descriptionClassName?: string
}

function CBRECheckboxItem({
  id,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  name,
  value,
  label,
  description,
  className,
  checkboxClassName,
  labelClassName,
  descriptionClassName,
}: CheckboxItemProps) {
  return (
    <div className={cn("flex items-start space-x-2", className)}>
      <Checkbox
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(value) => {
          // Convert indeterminate to boolean for simpler state management
          const isChecked = value === true;
          onCheckedChange?.(isChecked);
        }}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        className={cn(
          "mt-0.5", // Adjust vertical alignment with the label
          "border-light-grey data-[state=checked]:bg-cbre-green data-[state=checked]:border-cbre-green focus-visible:ring-accent-green/50",
          checkboxClassName
        )}
      />
      <div className="flex flex-col">
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-calibre text-dark-grey cursor-pointer leading-normal",
            disabled && "opacity-50 cursor-not-allowed",
            labelClassName
          )}
          onClick={disabled ? undefined : (e) => {
            // Only handle click when no ID is present (otherwise htmlFor handles it)
            if (!id) {
              e.preventDefault();
              onCheckedChange?.(!checked);
            }
          }}
        >
          {label}
        </label>
        {description && (
          <p 
            className={cn(
              "text-xs font-calibre text-light-grey mt-0.5",
              disabled && "opacity-50",
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

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
        <div className="mb-2">
          {title && (
            <h3 className="text-xl font-financier text-cbre-green mb-1">{title}</h3>
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

export { 
  Checkbox, 
  CBRECheckboxItem,
  CBRECheckboxGroup
}

// Aliases for convenience
export { 
  CBRECheckboxItem as CheckboxItem,
  CBRECheckboxGroup as CheckboxGroup
} 