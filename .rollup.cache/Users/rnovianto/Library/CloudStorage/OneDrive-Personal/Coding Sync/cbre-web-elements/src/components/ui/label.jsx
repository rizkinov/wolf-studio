"use client";
import { __rest } from "tslib";
import * as React from "react";
import { cn } from "@/lib/utils";
const Label = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<label ref={ref} data-slot="label" className={cn("text-foreground text-base font-calibre font-medium mb-1.5", "select-none", "peer-disabled:cursor-not-allowed peer-disabled:opacity-50", "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50", className)} {...props}/>);
});
Label.displayName = "Label";
export { Label };
//# sourceMappingURL=label.jsx.map