"use client";
import { __rest } from "tslib";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
const Toaster = (_a) => {
    var props = __rest(_a, []);
    const { theme = "system" } = useTheme();
    return (<Sonner theme={theme} className="toaster group" style={{
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
        }} {...props}/>);
};
export { Toaster };
//# sourceMappingURL=sonner.jsx.map