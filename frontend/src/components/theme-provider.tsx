/**
 * ThemeProvider Component.
 * Wraps the entire application and manages the CSS variables for Dark/Light mode.
 * Powered by the 'next-themes' library.
 */
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
