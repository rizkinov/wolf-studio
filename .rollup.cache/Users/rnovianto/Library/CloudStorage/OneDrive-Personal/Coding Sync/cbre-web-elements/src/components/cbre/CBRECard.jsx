"use client";
import { __rest } from "tslib";
import React from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
/**
 * CBRECard - A styled card component following CBRE design
 *
 * Features:
 * - CBRE styled card with consistent spacing
 * - Sharp corners (no border radius)
 * - Three variants: default, outline, and secondary
 */
export function CBRECard(_a) {
    var { children, className, variant = "default" } = _a, props = __rest(_a, ["children", "className", "variant"]);
    // Variant styles
    const variantClasses = {
        default: "bg-white border border-light-grey shadow-sm",
        outline: "bg-white border border-light-grey shadow-none",
        secondary: "bg-[var(--lighter-grey)] border-none shadow-none",
    };
    return (<Card className={cn(
        // Remove rounded corners
        "rounded-none", 
        // Apply variant-specific styles
        variantClasses[variant], 
        // Custom spacing
        "py-6", className)} {...props}>
      {children}
    </Card>);
}
export function CBRECardHeader(_a) {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (<CardHeader className={cn("px-6", className)} {...props}>
      {children}
    </CardHeader>);
}
export function CBRECardTitle(_a) {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (<CardTitle className={cn("text-xl font-financier text-cbre-green", className)} {...props}>
      {children}
    </CardTitle>);
}
export function CBRECardDescription(_a) {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (<CardDescription className={cn("text-dark-grey font-calibre mt-1", className)} {...props}>
      {children}
    </CardDescription>);
}
export function CBRECardContent(_a) {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (<CardContent className={cn("px-6 text-dark-grey font-calibre", className)} {...props}>
      {children}
    </CardContent>);
}
export function CBRECardFooter(_a) {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (<CardFooter className={cn("px-6 flex items-center justify-end gap-4", className)} {...props}>
      {children}
    </CardFooter>);
}
export { CBRECard as Card, CBRECardHeader as CardHeader, CBRECardTitle as CardTitle, CBRECardDescription as CardDescription, CBRECardContent as CardContent, CBRECardFooter as CardFooter, };
//# sourceMappingURL=CBRECard.jsx.map