"use client";
import { __rest } from "tslib";
import * as React from "react";
import { cn } from "@/lib/utils";
// Re-export all components from the ui/sidebar
import { SidebarProvider as BaseSidebarProvider, Sidebar as BaseSidebar, SidebarTrigger as BaseSidebarTrigger, SidebarRail as BaseSidebarRail, SidebarContent as BaseSidebarContent, SidebarHeader as BaseSidebarHeader, SidebarFooter as BaseSidebarFooter, SidebarGroup as BaseSidebarGroup, SidebarGroupLabel as BaseSidebarGroupLabel, SidebarGroupContent as BaseSidebarGroupContent, SidebarGroupAction as BaseSidebarGroupAction, SidebarMenu as BaseSidebarMenu, SidebarMenuItem as BaseSidebarMenuItem, SidebarMenuButton as BaseSidebarMenuButton, SidebarMenuAction as BaseSidebarMenuAction, SidebarMenuBadge as BaseSidebarMenuBadge, SidebarMenuSkeleton as BaseSidebarMenuSkeleton, SidebarMenuSub as BaseSidebarMenuSub, SidebarMenuSubItem as BaseSidebarMenuSubItem, SidebarMenuSubButton as BaseSidebarMenuSubButton, SidebarSeparator as BaseSidebarSeparator, useSidebar } from "@/components/ui/sidebar";
/**
 * CBRESidebarProvider - A CBRE-styled sidebar provider component
 *
 * Features:
 * - CBRE styling with customizable props
 * - Uses the shadcn/ui sidebar provider with CBRE-specific defaults
 */
function CBRESidebarProvider(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarProvider className={cn("text-dark-grey", className)} {...props}/>);
}
/**
 * CBRESidebar - A CBRE-styled sidebar component
 *
 * Features:
 * - CBRE styling with customizable props
 * - Uses the shadcn/ui sidebar with CBRE-specific styling
 */
function CBRESidebar(_a) {
    var { className, variant = "sidebar" } = _a, props = __rest(_a, ["className", "variant"]);
    return (<BaseSidebar className={cn("border-light-grey", className)} variant={variant} {...props}/>);
}
/**
 * CBRESidebarTrigger - A CBRE-styled sidebar trigger button
 *
 * Features:
 * - CBRE styling with customizable props
 * - Uses the shadcn/ui sidebar trigger with CBRE-specific styling
 */
function CBRESidebarTrigger(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarTrigger className={cn("text-cbre-green hover:bg-lighter-grey", className)} {...props}/>);
}
/**
 * CBRESidebarRail - A CBRE-styled sidebar rail for resizing
 */
function CBRESidebarRail(props) {
    return <BaseSidebarRail {...props}/>;
}
/**
 * CBRESidebarHeader - A CBRE-styled sidebar header
 */
function CBRESidebarHeader(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarHeader className={cn("border-b border-light-grey", className)} {...props}/>);
}
/**
 * CBRESidebarContent - A CBRE-styled sidebar content area
 */
function CBRESidebarContent(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarContent className={cn("px-0", className)} {...props}/>);
}
/**
 * CBRESidebarFooter - A CBRE-styled sidebar footer
 */
function CBRESidebarFooter(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarFooter className={cn("border-t border-light-grey", className)} {...props}/>);
}
/**
 * CBRESidebarSeparator - A CBRE-styled sidebar separator
 */
function CBRESidebarSeparator(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarSeparator className={cn("bg-light-grey", className)} {...props}/>);
}
/**
 * CBRESidebarGroup - A CBRE-styled sidebar group
 */
function CBRESidebarGroup(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarGroup className={cn("py-1", className)} {...props}/>);
}
/**
 * CBRESidebarGroupLabel - A CBRE-styled sidebar group label
 */
function CBRESidebarGroupLabel(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarGroupLabel className={cn("text-dark-grey font-financier tracking-normal", className)} {...props}/>);
}
/**
 * CBRESidebarGroupContent - A CBRE-styled sidebar group content area
 */
function CBRESidebarGroupContent(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarGroupContent className={cn("px-1", className)} {...props}/>);
}
/**
 * CBRESidebarGroupAction - A CBRE-styled sidebar group action button
 */
function CBRESidebarGroupAction(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarGroupAction className={cn("text-cbre-green hover:bg-lighter-grey", className)} {...props}/>);
}
/**
 * CBRESidebarMenu - A CBRE-styled sidebar menu
 */
function CBRESidebarMenu(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarMenu className={cn("space-y-1", className)} {...props}/>);
}
/**
 * CBRESidebarMenuItem - A CBRE-styled sidebar menu item
 */
function CBRESidebarMenuItem(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarMenuItem className={cn("", className)} {...props}/>);
}
/**
 * CBRESidebarMenuButton - A CBRE-styled sidebar menu button
 */
function CBRESidebarMenuButton(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarMenuButton className={cn("text-dark-grey hover:!bg-lighter-grey", "data-[active=true]:!bg-dark-green data-[active=true]:!text-white", className)} {...props}/>);
}
/**
 * CBRESidebarMenuAction - A CBRE-styled sidebar menu action button
 */
function CBRESidebarMenuAction(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarMenuAction className={cn("text-cbre-green hover:bg-lighter-grey", className)} {...props}/>);
}
/**
 * CBRESidebarMenuBadge - A CBRE-styled sidebar menu badge
 */
function CBRESidebarMenuBadge(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarMenuBadge className={cn("bg-cbre-green text-white", className)} {...props}/>);
}
/**
 * CBRESidebarMenuSkeleton - A CBRE-styled sidebar menu skeleton for loading states
 */
function CBRESidebarMenuSkeleton(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarMenuSkeleton className={cn("", className)} {...props}/>);
}
/**
 * CBRESidebarMenuSub - A CBRE-styled sidebar submenu
 */
function CBRESidebarMenuSub(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarMenuSub className={cn("pl-6", className)} {...props}/>);
}
/**
 * CBRESidebarMenuSubItem - A CBRE-styled sidebar submenu item
 */
function CBRESidebarMenuSubItem(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarMenuSubItem className={cn("", className)} {...props}/>);
}
/**
 * CBRESidebarMenuSubButton - A CBRE-styled sidebar submenu button
 */
function CBRESidebarMenuSubButton(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<BaseSidebarMenuSubButton className={cn("text-dark-grey hover:bg-lighter-grey", "data-[active=true]:text-cbre-green font-medium", className)} {...props}/>);
}
export { CBRESidebarProvider, CBRESidebar, CBRESidebarTrigger, CBRESidebarRail, CBRESidebarContent, CBRESidebarHeader, CBRESidebarFooter, CBRESidebarSeparator, CBRESidebarGroup, CBRESidebarGroupLabel, CBRESidebarGroupContent, CBRESidebarGroupAction, CBRESidebarMenu, CBRESidebarMenuItem, CBRESidebarMenuButton, CBRESidebarMenuAction, CBRESidebarMenuBadge, CBRESidebarMenuSkeleton, CBRESidebarMenuSub, CBRESidebarMenuSubItem, CBRESidebarMenuSubButton, useSidebar };
// Aliases for convenience
export { CBRESidebarProvider as SidebarProvider, CBRESidebar as Sidebar, CBRESidebarTrigger as SidebarTrigger, CBRESidebarRail as SidebarRail, CBRESidebarContent as SidebarContent, CBRESidebarHeader as SidebarHeader, CBRESidebarFooter as SidebarFooter, CBRESidebarSeparator as SidebarSeparator, CBRESidebarGroup as SidebarGroup, CBRESidebarGroupLabel as SidebarGroupLabel, CBRESidebarGroupContent as SidebarGroupContent, CBRESidebarGroupAction as SidebarGroupAction, CBRESidebarMenu as SidebarMenu, CBRESidebarMenuItem as SidebarMenuItem, CBRESidebarMenuButton as SidebarMenuButton, CBRESidebarMenuAction as SidebarMenuAction, CBRESidebarMenuBadge as SidebarMenuBadge, CBRESidebarMenuSkeleton as SidebarMenuSkeleton, CBRESidebarMenuSub as SidebarMenuSub, CBRESidebarMenuSubItem as SidebarMenuSubItem, CBRESidebarMenuSubButton as SidebarMenuSubButton };
//# sourceMappingURL=CBRESidebar.jsx.map