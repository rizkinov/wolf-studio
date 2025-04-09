"use client";
import { __rest } from "tslib";
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
function Checkbox(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<CheckboxPrimitive.Root data-slot="checkbox" className={cn("peer size-4 shrink-0 rounded-[0px] border border-input shadow-xs transition-shadow outline-none", "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "hover:border-foreground", "disabled:cursor-not-allowed disabled:opacity-50", "aria-invalid:ring-destructive/20 aria-invalid:border-destructive", className)} {...props}>
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center text-current">
        <CheckIcon className="size-3.5"/>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>);
}
export { Checkbox };
//# sourceMappingURL=checkbox.jsx.map