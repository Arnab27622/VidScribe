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
import { componentsStyles } from "./components.styles";

interface TranscriptCardProps {
    transcript: TranscriptSegment[];
    videoId: string;
}

export function TranscriptCard({ transcript, videoId }: TranscriptCardProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedFormat, setCopiedFormat] = useState<"txt" | "md" | null>(null);
    const pageSize = 50;

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
        window.open(`https://youtu.be/${videoId}?t=${Math.floor(start)}s`, "_blank");
    };

    const highlightText = (text: string, term: string) => {
        if (!term || !isHighlightMode) return text;
        const parts = text.split(new RegExp(`(${escapeRegex(term)})`, "gi"));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === term.toLowerCase() ? (
                        <mark key={i} className={componentsStyles.transcriptCard.highlightedText}>
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
        <div className={componentsStyles.transcriptCard.wrapper}>
            <div className={componentsStyles.transcriptCard.header}>
                <div className={componentsStyles.transcriptCard.headerTitleContainer}>
                    <h3 className={componentsStyles.transcriptCard.headerTitle}>Transcript</h3>
                </div>
                <div className={componentsStyles.transcriptCard.headerActionsContainer}>
                    <div className={componentsStyles.transcriptCard.searchInputWrapper}>
                        <input
                            type="text"
                            placeholder="Search..."
                            className={componentsStyles.transcriptCard.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsHighlightMode(!isHighlightMode)}
                        className={`${componentsStyles.transcriptCard.highlightModeBtnBase} ${isHighlightMode ? componentsStyles.transcriptCard.highlightModeBtnActive : componentsStyles.transcriptCard.highlightModeBtnInactive}`}
                        title="Toggle Highlight Mode"
                    >
                        <Highlighter className={componentsStyles.transcriptCard.highlightIcon} />
                    </button>
                </div>
            </div>

            <div className={componentsStyles.transcriptCard.contentWrapper}>
                <div className={componentsStyles.transcriptCard.scrollContainer}>
                    {paginatedTranscript.length > 0 ? (
                        paginatedTranscript.map((segment, index) => (
                            <div key={index} className={componentsStyles.transcriptCard.segmentRow}>
                                <button
                                    onClick={() => handleTimestampClick(segment.start)}
                                    className={componentsStyles.transcriptCard.timestampBtn}
                                >
                                    {formatTime(segment.start)}
                                </button>
                                <div className={componentsStyles.transcriptCard.segmentTextContainer}>
                                    {highlightText(segment.text, searchTerm)}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(`[${formatTime(segment.start)}] ${segment.text}`);
                                        }}
                                        className={componentsStyles.transcriptCard.copySegmentBtn}
                                        title="Copy segment"
                                    >
                                        <Copy className={componentsStyles.transcriptCard.copySegmentIcon} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={componentsStyles.transcriptCard.emptyStateContainer}>
                            <p>No segments found matching &quot;{searchTerm}&quot;</p>
                        </div>
                    )}
                </div>

                <div className={componentsStyles.transcriptCard.footer}>
                    <span className={componentsStyles.transcriptCard.footerText}>
                        Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, displayTranscript.length)} of {displayTranscript.length}
                    </span>
                    <div className={componentsStyles.transcriptCard.paginationContainer}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={componentsStyles.transcriptCard.paginationBtn}
                        >
                            <ChevronLeft className={componentsStyles.transcriptCard.paginationIcon} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={componentsStyles.transcriptCard.paginationBtn}
                        >
                            <ChevronRight className={componentsStyles.transcriptCard.paginationIcon} />
                        </button>
                        <div className={componentsStyles.transcriptCard.divider}></div>

                        <div className={componentsStyles.transcriptCard.exportGroup}>
                            <button
                                onClick={handleCopy}
                                className={`${componentsStyles.transcriptCard.exportBtnBase} ${componentsStyles.transcriptCard.exportBtnLeft}`}
                                title="Copy as Text"
                            >
                                {copiedFormat === "txt" ? <Check className={componentsStyles.transcriptCard.exportIconSuccess} /> : <Copy className={componentsStyles.transcriptCard.exportIconBase} />}
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
                                className={componentsStyles.transcriptCard.exportBtnBase}
                                title="Copy as Markdown"
                            >
                                {copiedFormat === "md" ? <Check className={componentsStyles.transcriptCard.exportIconSuccess} /> : <FileText className={componentsStyles.transcriptCard.exportIconBase} />}
                                MD
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
