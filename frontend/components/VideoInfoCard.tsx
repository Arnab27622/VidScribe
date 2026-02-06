"use client";

import { Download, Youtube } from "lucide-react";
import { VideoAnalysisResult } from "../app/types";
import { formatDuration, formatDate } from "../app/utils";

interface VideoInfoCardProps {
    data: VideoAnalysisResult;
}

export function VideoInfoCard({ data }: VideoInfoCardProps) {
    const { metadata, summary, key_topics, video_id, language } = data;
    const title = data.title || metadata.title || "Untitled Video";
    const thumbnail =
        metadata.thumbnail?.replace("default.jpg", "maxresdefault.jpg") ||
        `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`;

    const handleDownload = () => {
        const topicList =
            key_topics && key_topics.length > 0
                ? key_topics.join("\n- ")
                : "No key topics identified";
        const content = `YouTube Video Summary\n\nTitle: ${title}\nVideo ID: ${video_id}\n\nSummary:\n${summary}\n\nKey Topics:\n- ${topicList}`;

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `summary-${video_id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-blue-600 text-white px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h2 className="text-lg font-medium">{title}</h2>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold uppercase">{language}</span>
                    <button
                        onClick={handleDownload}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                        <Download className="w-3 h-3" /> Download
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div>
                            <p className="font-bold mb-1">Summary:</p>
                            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {summary || "No summary available."}
                            </div>
                        </div>
                        <div>
                            <h5 className="font-bold mb-2 text-base">Key Topics</h5>
                            <div className="flex flex-wrap gap-2">
                                {key_topics?.length > 0 ? (
                                    key_topics.map((topic, index) => (
                                        <span key={index} className="bg-cyan-400 text-black text-xs px-2 py-1 rounded-full font-medium">
                                            {topic}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500 text-sm">No key topics identified</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-full max-w-sm mb-3">
                            <img
                                src={thumbnail}
                                alt="Thumbnail"
                                className="w-full h-auto rounded"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video_id}/hqdefault.jpg`;
                                }}
                            />
                            <div className="absolute bottom-0 left-0 bg-black/75 text-white text-xs px-2 py-1 w-full text-center">
                                {metadata.duration ? `Duration: ${formatDuration(metadata.duration)}` : 'Duration: N/A'}
                            </div>
                        </div>
                        <div className="text-center text-sm space-y-1 w-full relative">
                            <p><strong>Channel:</strong> {metadata.channel || "Unknown"}</p>
                            <p><strong>Published:</strong> {formatDate(metadata.published_at)}</p>
                            <div className="mt-2 flex justify-center">
                                <a
                                    href={`https://youtu.be/${video_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 bg-transparent hover:bg-red-50 rounded px-3 py-1 text-sm transition-colors"
                                >
                                    <Youtube className="w-4 h-4" /> Watch on YouTube
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
