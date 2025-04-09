"use client";
import { __rest } from "tslib";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
function Select(_a) {
    var props = __rest(_a, []);
    return <SelectPrimitive.Root data-slot="select" {...props}/>;
}
function SelectGroup(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return <SelectPrimitive.Group data-slot="select-group" className={cn("mb-2 last:mb-0", className)} {...props}/>;
}
function SelectValue(_a) {
    var props = __rest(_a, []);
    return <SelectPrimitive.Value data-slot="select-value" {...props}/>;
}
function SelectTrigger(_a) {
    var { className, size = "default", children } = _a, props = __rest(_a, ["className", "size", "children"]);
    return (<SelectPrimitive.Trigger data-slot="select-trigger" data-size={size} className={cn("border-input bg-transparent text-foreground placeholder:text-muted-foreground", "flex w-full items-center justify-between gap-2 border rounded-[0px] px-3 py-2 text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "hover:border-foreground", "aria-invalid:ring-destructive/20 aria-invalid:border-destructive", "shadow-xs transition-[color,box-shadow] outline-none", "disabled:cursor-not-allowed disabled:opacity-50", "data-[size=default]:h-10 data-[size=sm]:h-8", "font-calibre", className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50"/>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>);
}
function SelectContent(_a) {
    var { className, children, position = "popper" } = _a, props = __rest(_a, ["className", "children", "position"]);
    return (<SelectPrimitive.Portal>
      <SelectPrimitive.Content data-slot="select-content" className={cn("bg-popover text-popover-foreground", "relative z-50 min-w-[8rem] rounded-[0px] border shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out", "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2", "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", "overflow-hidden", position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)} position={position} {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={cn("p-2", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>);
}
function SelectLabel(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SelectPrimitive.Label data-slot="select-label" className={cn("text-muted-foreground px-2 py-2 text-xs font-calibre font-medium mb-1", className)} {...props}/>);
}
function SelectItem(_a) {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<SelectPrimitive.Item data-slot="select-item" className={cn("relative flex w-full cursor-default select-none items-center gap-2 rounded-[0px] py-1.5 pr-8 pl-2 text-sm outline-none", "focus:bg-accent focus:text-accent-foreground", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", "font-calibre", className)} {...props}>
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-primary"/>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>);
}
function SelectSeparator(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SelectPrimitive.Separator data-slot="select-separator" className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)} {...props}/>);
}
function SelectScrollUpButton(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
      <ChevronUpIcon className="size-4"/>
    </SelectPrimitive.ScrollUpButton>);
}
function SelectScrollDownButton(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
      <ChevronDownIcon className="size-4"/>
    </SelectPrimitive.ScrollDownButton>);
}
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, };
//# sourceMappingURL=select.jsx.map