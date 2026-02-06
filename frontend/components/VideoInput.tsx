"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoInputProps {
    onAnalyze: (url: string, lang: string) => Promise<void>;
    isLoading: boolean;
}

export function VideoInput({ onAnalyze, isLoading }: VideoInputProps) {
    const [url, setUrl] = useState("");
    const [lang, setLang] = useState("en");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onAnalyze(url, lang);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8 space-y-2">
                            <label
                                htmlFor="videoUrl"
                                className="block text-base font-bold text-gray-700 dark:text-gray-200"
                            >
                                YouTube Video URL:
                            </label>
                            <div className="relative flex">
                                <input
                                    type="text"
                                    id="videoUrl"
                                    className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !url}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-md disabled:bg-blue-400 flex items-center gap-2 transition-colors whitespace-nowrap"
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isLoading ? "Analyzing..." : "Analyze"}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Enter full URL of the YouTube Video</p>
                        </div>

                        <div className="md:col-span-4 space-y-2">
                            <label
                                htmlFor="language"
                                className="block text-base font-bold text-gray-700 dark:text-gray-200"
                            >
                                Language:
                            </label>
                            <select
                                id="language"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={lang}
                                onChange={(e) => setLang(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="hi">Hindi</option>
                                <option value="ja">Japanese</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
