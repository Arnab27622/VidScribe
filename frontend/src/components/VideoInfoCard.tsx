/**
 * VideoInfoCard Component.
 * Displays the core results: Title, AI Summary, Actionable Insights, and Key Topics.
 */
import { Youtube, Copy, Check, Lightbulb, Share2 } from "lucide-react";
import { useState } from "react";
import { VideoAnalysisResult } from "@/types";
import { formatDuration, formatDate } from "@/lib/utils";

interface VideoInfoCardProps {
    data: VideoAnalysisResult;
}

const parseTimestamp = (ts: string): number => {
    if (!ts || typeof ts !== 'string') return 0;
    const parts = ts.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
};

export function VideoInfoCard({ data }: VideoInfoCardProps) {
    const { metadata, summary, key_topics, actionable_insights, video_id, language } = data;
    const [copiedSummary, setCopiedSummary] = useState(false);

    const title = data.title || metadata.title || "Untitled Video";

    const handleCopySummary = () => {
        navigator.clipboard.writeText(summary);
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
    };

    const [copiedLink, setCopiedLink] = useState(false);
    const handleShare = () => {
        const url = `${window.location.origin}/v/${video_id}`;
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };



    return (
        <div className="w-full flex flex-col gap-8">
            <div className="w-full flex flex-col md:flex-row gap-6 items-start md:items-end justify-between pb-6 border-b border-border">
                <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-primary/10 text-primary text-[10px] md:text-xs px-2.5 py-1 rounded-sm font-bold uppercase tracking-widest border border-primary/20">
                            {language}
                        </span>
                        <span className="bg-muted text-foreground text-[10px] md:text-xs px-2.5 py-1 rounded-sm font-medium border border-border">
                            {metadata.duration ? formatDuration(metadata.duration) : 'N/A'}
                        </span>
                        <span className="text-muted-foreground text-xs md:text-sm font-mono flex items-center gap-1">
                            {formatDate(metadata.published_at)}
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
                        {title}
                    </h2>
                    <p className="text-muted-foreground font-mono text-xs md:text-sm">
                        {metadata.channel || "Unknown Channel"}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">

                    <button
                        onClick={handleShare}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors text-xs md:text-sm shadow-sm border border-border"
                    >
                        {copiedLink ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
                        {copiedLink ? "Copied!" : "Share"}
                    </button>
                    <a
                        href={`https://youtu.be/${video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors text-xs md:text-sm shadow-sm"
                    >
                        <Youtube className="w-4 h-4" /> Watch
                    </a>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-foreground">
                                Executive Summary
                            </h3>
                            <button
                                onClick={handleCopySummary}
                                className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                title="Copy Summary"
                            >
                                {copiedSummary ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="text-foreground/90 text-sm md:text-base leading-relaxed whitespace-pre-wrap bg-card p-6 rounded-lg border border-border">
                            {summary || "No summary available."}
                        </div>
                    </section>

                    {actionable_insights && actionable_insights.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-primary" />
                                Actionable Insights
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {actionable_insights.map((insight, index) => (
                                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-card border border-border">
                                        <div className="shrink-0 w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary font-mono text-xs">
                                            {index + 1}
                                        </div>
                                        <p className="text-foreground/90 text-sm md:text-base leading-relaxed">
                                            {insight}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">
                            Key Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {key_topics?.length > 0 ? (
                                key_topics.map((topicData, index) => {
                                    const topic = typeof topicData === 'string' ? topicData : topicData?.topic;
                                    const timestamp = typeof topicData === 'object' ? topicData?.timestamp : null;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => timestamp && window.open(`https://youtu.be/${video_id}?t=${parseTimestamp(timestamp)}s`, '_blank')}
                                            disabled={!timestamp}
                                            className={`bg-card text-foreground text-xs md:text-sm px-3 py-1.5 rounded-md font-medium border border-border flex items-center gap-2 group/topic ${timestamp
                                                ? "hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer"
                                                : "opacity-70 cursor-default"
                                                }`}
                                        >
                                            <span className="text-muted-foreground font-mono">#</span>
                                            <span>{topic}</span>
                                            {timestamp && (
                                                <span className="text-[10px] text-muted-foreground font-mono opacity-80">
                                                    {timestamp}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <span className="text-muted-foreground text-sm italic">No key topics identified</span>
                            )}
                        </div>
                    </section>

            </div>
        </div>
    );
}
