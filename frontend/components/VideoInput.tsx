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
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSubmit} className="relative z-10">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative flex flex-col md:flex-row bg-card rounded-xl shadow-2xl border border-white/10">
                        <input
                            type="text"
                            className="grow bg-transparent px-4 py-4 text-base md:text-lg text-foreground placeholder:text-muted-foreground/50 outline-none rounded-lg"
                            placeholder="Paste YouTube Video URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Analyze"
                            )}
                        </button>
                    </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Supports videos of any length.
                </p>
            </form>
        </div>
    );
}
