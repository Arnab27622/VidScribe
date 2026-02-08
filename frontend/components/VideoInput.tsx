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
        if (url.trim()) {
            onAnalyze(url, "auto");
            setUrl("");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSubmit} className="relative z-10">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative flex flex-row items-stretch bg-card rounded-xl shadow-2xl border border-white/10 overflow-hidden min-h-13">
                        <input
                            type="text"
                            className="grow bg-transparent px-4 md:px-6 py-2 md:py-4 text-sm md:text-lg text-foreground placeholder:text-muted-foreground/50 outline-none border-none focus:ring-0 min-w-0"
                            placeholder="Paste YouTube Video URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isLoading}
                        />

                        <div className="w-px bg-white/10" />

                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="px-4 md:px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer active:brightness-110 m-0 rounded-none border-none text-xs md:text-sm"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                            ) : (
                                "Analyze"
                            )}
                        </button>
                    </div>
                </div>
                <p className="text-center text-xs md:text-sm text-muted-foreground mt-4">
                    Supports videos of any length.
                </p>
            </form>
        </div>
    );
}
