/**
 * ModeToggle Component.
 * A simple button to switch between Dark and Light mode.
 */
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-9 h-9" /> // Placeholder to prevent layout shift
    }

    const toggleTheme = () => {
        if (theme === 'dark' || resolvedTheme === 'dark') {
            setTheme('light')
        } else {
            setTheme('dark')
        }
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background border border-border/50 shadow-sm cursor-pointer"
            aria-label="Toggle theme"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute top-2.5 left-2.5 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
