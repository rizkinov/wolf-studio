"use client";
import { __rest } from "tslib";
import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";
/**
 * CBREResizablePanelGroup - A styled resizable panel group following CBRE design
 *
 * Features:
 * - CBRE styling with customizable variants
 * - Supports both horizontal and vertical orientations
 */
function CBREResizablePanelGroup(_a) {
    var { className, variant = 'default' } = _a, props = __rest(_a, ["className", "variant"]);
    return (<ResizablePrimitive.PanelGroup data-slot="resizable-panel-group" data-variant={variant} className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", variant === 'bordered' && "border border-light-grey", className)} {...props}/>);
}
/**
 * CBREResizablePanel - A styled resizable panel following CBRE design
 *
 * Features:
 * - CBRE styling with customizable variants
 * - Integrates with CBREResizablePanelGroup
 */
function CBREResizablePanel(_a) {
    var { className, variant = 'default' } = _a, props = __rest(_a, ["className", "variant"]);
    return (<ResizablePrimitive.Panel data-slot="resizable-panel" data-variant={variant} className={cn(variant === 'bordered' && "border border-light-grey", className)} {...props}/>);
}
/**
 * CBREResizableHandle - A styled resize handle following CBRE design
 *
 * Features:
 * - CBRE styling with customizable color options
 * - Optional handle grip for better visual feedback
 */
function CBREResizableHandle(_a) {
    var { withHandle, handleColor = 'light-grey', className } = _a, props = __rest(_a, ["withHandle", "handleColor", "className"]);
    // Define color classes based on the handleColor prop
    const colorClass = {
        'cbre-green': 'bg-cbre-green',
        'accent-green': 'bg-accent-green',
        'dark-grey': 'bg-dark-grey',
        'light-grey': 'bg-light-grey',
    };
    return (<ResizablePrimitive.PanelResizeHandle data-slot="resizable-handle" data-handle-color={handleColor} className={cn("relative flex w-px items-center justify-center bg-light-grey z-50", "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2", "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-green focus-visible:ring-offset-1", "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:!bg-light-grey", "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1", "data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2", "data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90", className)} style={Object.assign({ backgroundColor: 'var(--colors-light-grey) !important', zIndex: '50 !important' }, (props.style || {}))} {...props}>
      {withHandle && (<div className={cn("z-50 flex h-4 w-3 items-center justify-center border border-light-grey rounded-none", colorClass[handleColor] || "bg-light-grey")}>
          <GripVerticalIcon className="size-2.5 text-white"/>
        </div>)}
    </ResizablePrimitive.PanelResizeHandle>);
}
export { CBREResizablePanelGroup, CBREResizablePanel, CBREResizableHandle };
// Re-export with aliases for convenience
export { CBREResizablePanelGroup as ResizablePanelGroup, CBREResizablePanel as ResizablePanel, CBREResizableHandle as ResizableHandle };
//# sourceMappingURL=CBREResizable.jsx.map