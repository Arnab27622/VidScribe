/**
 * VideoInput Component.
 * The search bar where users paste their YouTube links.
 */
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoInputProps {
    onAnalyze: (url: string, targetLang: string) => Promise<void>;
    isLoading: boolean;
}

const LANGUAGES = [
    { code: "English", label: "English" },
    { code: "Spanish", label: "Spanish" },
    { code: "French", label: "French" },
    { code: "German", label: "German" },
    { code: "Hindi", label: "Hindi" },
    { code: "Japanese", label: "Japanese" }
];

export function VideoInput({ onAnalyze, isLoading }: VideoInputProps) {
    const [url, setUrl] = useState("");
    const [lang, setLang] = useState("English");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onAnalyze(url, lang);
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2">
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Supports public YouTube videos of any length.
                    </p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <label htmlFor="lang-select" className="font-medium">Output Language:</label>
                        <select 
                            id="lang-select"
                            className="bg-transparent text-foreground outline-none cursor-pointer hover:text-primary transition-colors font-medium border-b border-dashed border-border pb-0.5"
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            disabled={isLoading}
                        >
                            {LANGUAGES.map(l => (
                                <option key={l.code} value={l.code}>{l.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
}
