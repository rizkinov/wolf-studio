"use client";
import { __rest } from "tslib";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
/**
 * CBRE Theme Provider
 *
 * This component ensures consistent CBRE theming across the application.
 * We're extending the next-themes provider to ensure proper theming for CBRE's brand.
 */
export function CBREThemeProvider(_a) {
    var { children } = _a, props = __rest(_a, ["children"]);
    // Use a state and effect to prevent hydration mismatch
    const [mounted, setMounted] = React.useState(false);
    // Only render the provider after first client-side render to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);
    // During server rendering or first mount, just render children without theme provider
    if (!mounted) {
        return <>{children}</>;
    }
    // Once mounted on client, use the theme provider
    return (<NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange forcedTheme="light" // Force light theme for CBRE
     {...props}>
      {children}
    </NextThemesProvider>);
}
//# sourceMappingURL=CBREThemeProvider.jsx.map