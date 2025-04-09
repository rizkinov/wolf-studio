import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
export function CBRETooltip({ children, content, delayDuration = 200, side = "top", align = "center", }) {
    return (<Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {content}
      </TooltipContent>
    </Tooltip>);
}
// Export the provider for use at the app level
export { TooltipProvider as CBRETooltipProvider };
//# sourceMappingURL=CBRETooltip.jsx.map