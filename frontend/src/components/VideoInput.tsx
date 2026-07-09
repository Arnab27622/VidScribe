/**
 * VideoInput Component.
 * The search bar where users paste their YouTube links.
 */
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoInputProps {
    onAnalyze: (url: string, lang: string) => Promise<void>;
    isLoading: boolean;
}

export function VideoInput({ onAnalyze, isLoading }: VideoInputProps) {
    const [url, setUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Verifies the URL isn't empty before triggering analysis
        if (url.trim()) {
            onAnalyze(url, "auto");
            setUrl("");
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="relative z-10">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                    <div className="relative grow">
                        <input
                            type="text"
                            className="w-full bg-card px-4 md:px-5 py-3 md:py-4 text-sm md:text-base text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors rounded-lg shadow-sm"
                            placeholder="Paste YouTube Video URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !url}
                        className="px-6 md:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] rounded-lg border border-transparent shadow-sm text-sm md:text-base"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                        ) : (
                            "Analyze Video"
                        )}
                    </button>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-3">
                    Supports public YouTube videos of any length.
                </p>
            </form>
        </div>
    );
}
