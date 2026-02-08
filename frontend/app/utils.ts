import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Escapes special regex characters to prevent ReDoS attacks
 */
export function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`
        : `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    // const formattedSeconds = seconds.toFixed(2); // Original used floating point?

    const formattedSeconds = Math.floor(seconds).toString().padStart(2, '0'); // Simplification for display

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${formattedSeconds}`;
    } else {
        return `${minutes}:${formattedSeconds}`;
    }
}

export function formatDate(dateStr?: string): string {
    if (!dateStr) return "Unknown Date";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid Date";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export function extractVideoId(url: string): string | null {
    // Pattern for full YouTube URLs (captures in group 2)
    const urlPattern = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
    // Pattern for direct video ID (captures in group 1)
    const directIdPattern = /^([a-zA-Z0-9_-]{11})$/;

    // Try URL pattern first
    const urlMatch = url.match(urlPattern);
    if (urlMatch && urlMatch[2]) {
        return urlMatch[2];
    }

    // Try direct video ID pattern
    const directMatch = url.match(directIdPattern);
    if (directMatch && directMatch[1]) {
        return directMatch[1];
    }

    return null;
}

