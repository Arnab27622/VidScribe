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
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-cyan-500 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="text-lg font-medium mb-0">Transcript</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search transcript..."
                        className="px-2 py-1 text-sm rounded border-none focus:ring-0 text-gray-900 w-40 placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={() => setIsHighlightMode(!isHighlightMode)}
                        className={`p-1.5 rounded border ${isHighlightMode ? 'bg-yellow-300 border-yellow-400 text-black shadow-inner' : 'border-white/50 text-white hover:bg-white/20'}`}
                        title="Toggle Highlight"
                    >
                        <Highlighter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-0">
                <div className="h-[400px] overflow-y-auto custom-scrollbar p-3">
                    {paginatedTranscript.length > 0 ? (
                        paginatedTranscript.map((segment, index) => (
                            <div key={index} className="p-1 mb-1 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded flex gap-2 text-sm border-b border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                <button
                                    onClick={() => handleTimestampClick(segment.start)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-mono text-xs pt-0.5 min-w-[3.5rem] text-right"
                                >
                                    {formatTime(segment.start)}
                                </button>
                                <div className="flex-grow text-gray-800 dark:text-gray-200 leading-relaxed">
                                    {highlightText(segment.text, searchTerm)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                            <p>No segments found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-sm gap-2">
                    <span className="text-gray-600 dark:text-gray-400">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayTranscript.length)} of {displayTranscript.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="ml-2 px-3 py-1 border border-gray-400 text-gray-600 dark:text-gray-300 rounded flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
