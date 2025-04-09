"use client";
import { __rest } from "tslib";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectSeparator, } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
/**
 * CBRESelect component that wraps the shadcn/ui Select component with CBRE styling.
 * Provides a label, description, and error handling.
 */
export function CBRESelect(_a) {
    var { label, labelClassName, description, error, triggerClassName, contentClassName, id: propId, className, children } = _a, props = __rest(_a, ["label", "labelClassName", "description", "error", "triggerClassName", "contentClassName", "id", "className", "children"]);
    // Generate a unique ID for accessibility
    const id = React.useId();
    const selectId = propId || `cbre-select-${id}`;
    const descriptionId = `${selectId}-description`;
    const errorId = `${selectId}-error`;
    return (<div className={cn("space-y-2", className)}>
      {label && (<Label htmlFor={selectId} className={cn("text-dark-grey font-calibre", labelClassName)}>
          {label}
        </Label>)}
      {description && !error && (<p id={descriptionId} className="text-sm text-muted-foreground font-calibre">
          {description}
        </p>)}
      
      <Select {...props} aria-describedby={description || error
            ? `${description ? descriptionId : ""} ${error ? errorId : ""}`
            : undefined}>
        {/* Use regular React children mapping with type casting for type safety */}
        {React.Children.map(children, (child) => {
            if (!React.isValidElement(child))
                return child;
            // Handle SelectTrigger
            if (child.type === SelectTrigger) {
                // Type cast the child to React element with SelectTrigger props
                const trigger = child;
                return React.cloneElement(trigger, {
                    id: selectId,
                    className: cn("border-light-grey focus-visible:border-cbre-green focus-visible:ring-accent-light/30", "hover:border-cbre-green", error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20", triggerClassName, trigger.props.className),
                    "aria-invalid": error ? "true" : undefined,
                });
            }
            // Handle SelectContent
            if (child.type === SelectContent) {
                // Type cast the child to React element with SelectContent props  
                const content = child;
                return React.cloneElement(content, {
                    className: cn("border-light-grey", contentClassName, content.props.className),
                });
            }
            return child;
        })}
      </Select>
      
      {error && (<p id={errorId} className="text-sm text-destructive font-calibre">
          {error}
        </p>)}
    </div>);
}
/**
 * CBREGroupedSelect component that renders a select with grouped options.
 * A convenience wrapper around CBRESelect with pre-built option groups.
 */
export function CBREGroupedSelect(_a) {
    var { groups, placeholder = "Select an option" } = _a, props = __rest(_a, ["groups", "placeholder"]);
    return (<CBRESelect {...props}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}/>
      </SelectTrigger>
      <SelectContent>
        {groups.map((group, groupIndex) => (<React.Fragment key={`group-${groupIndex}`}>
            {groupIndex > 0 && <SelectSeparator />}
            <SelectGroup>
              <SelectLabel>{group.label}</SelectLabel>
              {group.options.map((option) => (<SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </SelectItem>))}
            </SelectGroup>
          </React.Fragment>))}
      </SelectContent>
    </CBRESelect>);
}
//# sourceMappingURL=CBRESelect.jsx.map