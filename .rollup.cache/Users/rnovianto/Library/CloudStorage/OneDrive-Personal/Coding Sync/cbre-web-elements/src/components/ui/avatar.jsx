"use client";
import { __rest } from "tslib";
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
function Avatar(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Root data-slot="avatar" className={cn("relative flex size-8 shrink-0 overflow-hidden", className)} {...props}/>);
}
function AvatarImage(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full", className)} {...props}/>);
}
function AvatarFallback(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Fallback data-slot="avatar-fallback" className={cn("bg-muted flex size-full items-center justify-center", className)} {...props}/>);
}
export { Avatar, AvatarImage, AvatarFallback };
//# sourceMappingURL=avatar.jsx.map