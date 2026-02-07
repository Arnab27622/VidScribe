"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Highlighter,
    ChevronLeft,
    ChevronRight,
    Copy,
    Check,
} from "lucide-react";
import { TranscriptSegment } from "../app/types";
import { formatTime } from "../app/utils";

interface TranscriptCardProps {
    transcript: TranscriptSegment[];
    videoId: string;
}

export function TranscriptCard({ transcript, videoId }: TranscriptCardProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [copied, setCopied] = useState(false);
    const pageSize = 50;

    useEffect(() => {
        setCurrentPage(1);
        setSearchTerm("");
        setIsHighlightMode(false);
    }, [transcript]);

    const filteredTranscript = useMemo(() => {
        if (!searchTerm || isHighlightMode) return transcript;
        return transcript.filter((segment) =>
            segment.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transcript, searchTerm, isHighlightMode]);

    const displayTranscript = isHighlightMode ? transcript : filteredTranscript;
    const totalPages = Math.ceil(displayTranscript.length / pageSize);
    const paginatedTranscript = displayTranscript.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleCopy = () => {
        const text = transcript
            .map(
                (seg) => `[${formatTime(seg.start)}] ${seg.text}`
            )
            .join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTimestampClick = (start: number) => {
        window.open(`https://youtu.be/${videoId}?t=${Math.floor(start)}s`, "_blank");
    };

    const highlightText = (text: string, term: string) => {
        if (!term || !isHighlightMode) return text;
        const parts = text.split(new RegExp(`(${term})`, "gi"));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === term.toLowerCase() ? (
                        <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-gray-100 rounded-sm px-0.5">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    return (
        <div className="bg-card text-card-foreground shadow-xl rounded-2xl border border-border/50 overflow-hidden flex flex-col h-150 transition-all hover:shadow-2xl">
            <div className="bg-muted/30 border-b border-border/50 px-8 py-5 flex justify-between items-center shrink-0 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-xl font-bold tracking-tight">Transcript</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground text-xs">Search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="..."
                            className="pl-12 pr-4 py-2 text-sm rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground w-32 focus:w-48 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsHighlightMode(!isHighlightMode)}
                        className={`p-2 rounded-lg border transition-all ${isHighlightMode ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600 dark:text-yellow-400' : 'border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                        title="Toggle Highlight Mode"
                    >
                        <Highlighter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grow overflow-hidden flex flex-col min-h-0 bg-background/30">
                <div className="grow overflow-y-auto custom-scrollbar p-6 space-y-1">
                    {paginatedTranscript.length > 0 ? (
                        paginatedTranscript.map((segment, index) => (
                            <div key={index} className="group p-3 hover:bg-muted/50 rounded-xl flex gap-4 text-sm transition-all border border-transparent hover:border-border/40">
                                <button
                                    onClick={() => handleTimestampClick(segment.start)}
                                    className="text-primary/70 group-hover:text-primary font-mono text-xs pt-1 min-w-14 text-right transition-colors font-medium opacity-60 group-hover:opacity-100"
                                >
                                    {formatTime(segment.start)}
                                </button>
                                <div className="grow text-foreground/80 group-hover:text-foreground leading-relaxed transition-colors">
                                    {highlightText(segment.text, searchTerm)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-10 opacity-60">
                            <p>No segments found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>

                <div className="bg-muted/30 border-t border-border/50 px-8 py-4 flex flex-col sm:flex-row justify-between items-center text-sm gap-4 shrink-0 backdrop-blur-sm">
                    <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                        Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, displayTranscript.length)} of {displayTranscript.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="h-6 w-px bg-border mx-2"></div>
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground rounded-lg flex items-center gap-2 hover:bg-muted transition-all font-medium text-xs uppercase tracking-wide"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
