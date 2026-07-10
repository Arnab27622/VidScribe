"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { componentsStyles } from "./components.styles";

interface VideoInputProps {
    onAnalyze: (url: string, targetLang: string) => void;
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
        <div className={componentsStyles.videoInput.wrapper}>
            <form onSubmit={handleSubmit} className={componentsStyles.videoInput.form}>
                <div className={componentsStyles.videoInput.inputGroup}>
                    <div className={componentsStyles.videoInput.inputWrapper}>
                        <input
                            type="text"
                            className={componentsStyles.videoInput.input}
                            placeholder="Paste YouTube Video URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !url}
                        className={componentsStyles.videoInput.submitButton}
                    >
                        {isLoading ? (
                            <Loader2 className={componentsStyles.videoInput.spinner} />
                        ) : (
                            "Analyze Video"
                        )}
                    </button>
                </div>
                <div className={componentsStyles.videoInput.footer}>
                    <p className={componentsStyles.videoInput.helperText}>
                        Supports public YouTube videos of any length.
                    </p>
                    <div className={componentsStyles.videoInput.languageGroup}>
                        <label htmlFor="lang-select" className={componentsStyles.videoInput.languageLabel}>Output Language:</label>
                        <select 
                            id="lang-select"
                            className={componentsStyles.videoInput.languageSelect}
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
