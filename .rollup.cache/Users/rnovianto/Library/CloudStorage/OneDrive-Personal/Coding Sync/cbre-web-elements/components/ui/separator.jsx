"use client";
import { __rest } from "tslib";
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";
function Separator(_a) {
    var { className, orientation = "horizontal", decorative = true } = _a, props = __rest(_a, ["className", "orientation", "decorative"]);
    return (<SeparatorPrimitive.Root data-slot="separator-root" decorative={decorative} orientation={orientation} className={cn("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", className)} {...props}/>);
}
export { Separator };
//# sourceMappingURL=separator.jsx.map