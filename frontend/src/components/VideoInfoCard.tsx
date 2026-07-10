import { Youtube, Copy, Check, Lightbulb, Share2 } from "lucide-react";
import { useState } from "react";
import { VideoAnalysisResult } from "@/types";
import { formatDuration, formatDate } from "@/lib/utils";
import { componentsStyles } from "./components.styles";

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
        <div className={componentsStyles.videoInfoCard.wrapper}>
            <div className={componentsStyles.videoInfoCard.header}>
                <div className={componentsStyles.videoInfoCard.metaWrapper}>
                    <div className={componentsStyles.videoInfoCard.metaTagsGroup}>
                        <span className={componentsStyles.videoInfoCard.languageBadge}>
                            {language}
                        </span>
                        <span className={componentsStyles.videoInfoCard.durationBadge}>
                            {metadata.duration ? formatDuration(metadata.duration) : 'N/A'}
                        </span>
                        <span className={componentsStyles.videoInfoCard.dateText}>
                            {formatDate(metadata.published_at)}
                        </span>
                    </div>
                    <h2 className={componentsStyles.videoInfoCard.title}>
                        {title}
                    </h2>
                    <p className={componentsStyles.videoInfoCard.channelText}>
                        {metadata.channel || "Unknown Channel"}
                    </p>
                </div>

                <div className={componentsStyles.videoInfoCard.actionsGroup}>
                    <button
                        onClick={handleShare}
                        className={componentsStyles.videoInfoCard.shareButton}
                    >
                        {copiedLink ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
                        {copiedLink ? "Copied!" : "Share"}
                    </button>
                    <a
                        href={`https://youtu.be/${video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={componentsStyles.videoInfoCard.watchButton}
                    >
                        <Youtube className="w-4 h-4" /> Watch
                    </a>
                </div>
            </div>

            <div className={componentsStyles.videoInfoCard.contentWrapper}>
                <section>
                    <div className={componentsStyles.videoInfoCard.sectionHeader}>
                        <h3 className={componentsStyles.videoInfoCard.sectionTitle}>
                            Executive Summary
                        </h3>
                        <button
                            onClick={handleCopySummary}
                            className={componentsStyles.videoInfoCard.copyButton}
                            title="Copy Summary"
                        >
                            {copiedSummary ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className={componentsStyles.videoInfoCard.summaryText}>
                        {summary || "No summary available."}
                    </div>
                </section>

                {actionable_insights && actionable_insights.length > 0 && (
                    <section>
                        <h3 className={componentsStyles.videoInfoCard.sectionTitleWithIcon}>
                            <Lightbulb className={componentsStyles.videoInfoCard.sectionIcon} />
                            Actionable Insights
                        </h3>
                        <div className={componentsStyles.videoInfoCard.insightsGrid}>
                            {actionable_insights.map((insight, index) => (
                                <div key={index} className={componentsStyles.videoInfoCard.insightItem}>
                                    <div className={componentsStyles.videoInfoCard.insightNumber}>
                                        {index + 1}
                                    </div>
                                    <p className={componentsStyles.videoInfoCard.insightText}>
                                        {insight}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h3 className={componentsStyles.videoInfoCard.sectionTitle}>
                        Key Topics
                    </h3>
                    <div className={componentsStyles.videoInfoCard.topicsGroup}>
                        {key_topics?.length > 0 ? (
                            key_topics.map((topicData, index) => {
                                const topic = typeof topicData === 'string' ? topicData : topicData?.topic;
                                const timestamp = typeof topicData === 'object' ? topicData?.timestamp : null;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => timestamp && window.open(`https://youtu.be/${video_id}?t=${parseTimestamp(timestamp)}s`, '_blank')}
                                        disabled={!timestamp}
                                        className={`${componentsStyles.videoInfoCard.topicButtonBase} ${timestamp
                                            ? componentsStyles.videoInfoCard.topicButtonHover
                                            : componentsStyles.videoInfoCard.topicButtonDisabled
                                            }`}
                                    >
                                        <span className={componentsStyles.videoInfoCard.topicHash}>#</span>
                                        <span>{topic}</span>
                                        {timestamp && (
                                            <span className={componentsStyles.videoInfoCard.topicTimestamp}>
                                                {timestamp}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <span className={componentsStyles.videoInfoCard.topicsEmpty}>No key topics identified</span>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
