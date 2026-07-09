/**
 * TranscriptCard Component.
 * An interactive, searchable display for the full video transcript.
 * Includes pagination to handle very long videos efficiently.
 */
"use client";

import { useState, useMemo } from "react";
import {
    Highlighter,
    ChevronLeft,
    ChevronRight,
    Copy,
    Check,
    FileText,
} from "lucide-react";
import { TranscriptSegment } from "@/types";
import { formatTime, escapeRegex } from "@/lib/utils";

interface TranscriptCardProps {
    transcript: TranscriptSegment[];
    onSeek: (seconds: number) => void;
}

export function TranscriptCard({ transcript, onSeek }: TranscriptCardProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedFormat, setCopiedFormat] = useState<"txt" | "md" | null>(null);
    const pageSize = 50;

    // React Memoization: only recalculates the filtered list when the search term or data changes.
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
        setCopiedFormat("txt");
        setTimeout(() => setCopiedFormat(null), 2000);
    };

    const handleTimestampClick = (start: number) => {
        onSeek(start);
        // Fallback to new tab if requested or as backup
        // window.open(`https://youtu.be/${videoId}?t=${Math.floor(start)}s`, "_blank");
    };

    const highlightText = (text: string, term: string) => {
        if (!term || !isHighlightMode) return text;
        // Escape special regex characters to prevent ReDoS attacks
        const parts = text.split(new RegExp(`(${escapeRegex(term)})`, "gi"));
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
        <div className="bg-card text-card-foreground shadow-sm rounded-lg border border-border flex flex-col h-[600px]">
            <div className="bg-muted/50 border-b border-border px-4 md:px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                    <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-muted-foreground">Transcript</h3>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-3 md:pl-4 pr-3 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground w-24 md:w-32 md:focus:w-48 transition-all placeholder:text-muted-foreground/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsHighlightMode(!isHighlightMode)}
                        className={`p-1.5 md:p-2 rounded-lg border transition-all ${isHighlightMode ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600 dark:text-yellow-400' : 'border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground'} cursor-pointer`}
                        title="Toggle Highlight Mode"
                    >
                        <Highlighter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                </div>
            </div>

            <div className="grow overflow-hidden flex flex-col min-h-0">
                <div className="grow overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-1">
                    {paginatedTranscript.length > 0 ? (
                        paginatedTranscript.map((segment, index) => (
                            <div key={index} className="group md:p-2 hover:bg-muted rounded-md flex gap-4 transition-colors">
                                <button
                                    onClick={() => handleTimestampClick(segment.start)}
                                    className="text-muted-foreground group-hover:text-primary font-mono text-xs pt-1 text-right transition-colors font-medium opacity-80 cursor-pointer"
                                >
                                    {formatTime(segment.start)}
                                </button>
                                <div className="grow text-foreground/90 leading-relaxed pr-8 relative text-sm md:text-base">
                                    {highlightText(segment.text, searchTerm)}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(`[${formatTime(segment.start)}] ${segment.text}`);
                                        }}
                                        className="absolute right-0 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-pointer"
                                        title="Copy segment"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-10 opacity-60">
                            <p>No segments found matching &quot;{searchTerm}&quot;</p>
                        </div>
                    )}
                </div>

                <div className="bg-card border-t border-border px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-sm gap-4 shrink-0">
                    <span className="text-muted-foreground font-mono text-xs">
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

                        <div className="flex bg-muted rounded-lg overflow-hidden border border-border">
                            <button
                                onClick={handleCopy}
                                className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-background transition-all font-medium text-xs uppercase tracking-wide cursor-pointer flex items-center gap-2 border-r border-border"
                                title="Copy as Text"
                            >
                                {copiedFormat === "txt" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                TXT
                            </button>
                            <button
                                onClick={() => {
                                    const md = transcript
                                        .map(seg => `**${formatTime(seg.start)}** ${seg.text}`)
                                        .join("\n\n");
                                    navigator.clipboard.writeText(md);
                                    setCopiedFormat("md");
                                    setTimeout(() => setCopiedFormat(null), 2000);
                                }}
                                className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-background transition-all font-medium text-xs uppercase tracking-wide cursor-pointer flex items-center gap-2"
                                title="Copy as Markdown"
                            >
                                {copiedFormat === "md" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileText className="w-3.5 h-3.5" />}
                                MD
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
