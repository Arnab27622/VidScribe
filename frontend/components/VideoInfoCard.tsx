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
        <div className="bg-card text-card-foreground shadow-xl rounded-2xl border border-border/50 overflow-hidden transition-all hover:shadow-2xl">
            <div className="relative w-full overflow-hidden group">
                {/* Background Blur Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 dark:opacity-30 scale-110"
                    style={{ backgroundImage: `url(${thumbnail})` }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

                <div className="relative py-9 px-8 w-full z-10 flex flex-col md:flex-row gap-6 items-end justify-between">
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="bg-primary/90 text-primary-foreground text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide shadow-lg backdrop-blur-md">
                                {language}
                            </span>
                            <span className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-md border border-white/10">
                                {metadata.duration ? formatDuration(metadata.duration) : 'N/A'}
                            </span>
                            <span className="text-white/80 text-sm font-medium flex items-center gap-1 shadow-black/50 drop-shadow-md">
                                {formatDate(metadata.published_at)}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-lg">
                            {title}
                        </h2>
                        <p className="text-white/90 font-medium text-lg drop-shadow-md">
                            {metadata.channel || "Unknown Channel"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <a
                            href={`https://youtu.be/${video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-red-600/40 hover:-translate-y-0.5"
                        >
                            <Youtube className="w-5 h-5" /> Watch
                        </a>
                        <button
                            onClick={handleDownload}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-600/40 hover:-translate-y-0.5 cursor-pointer"
                        >
                            <Download className="w-5 h-5" /> Save
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            Executive Summary
                        </h3>
                        <div className="text-foreground/90 text-base leading-8 whitespace-pre-wrap bg-muted/30 p-8 rounded-2xl border border-border/50 shadow-inner">
                            {summary || "No summary available."}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground/80">
                            <div className="w-1.5 h-6 bg-muted-foreground/30 rounded-full" />
                            Key Topics
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {key_topics?.length > 0 ? (
                                key_topics.map((topic, index) => (
                                    <span key={index} className="bg-primary/5 hover:bg-primary/15 text-foreground/90 text-sm px-4 py-2 rounded-xl font-semibold transition-all cursor-default border border-primary/10 hover:border-primary/30 hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center">
                                        <span className="text-primary font-bold mr-1.5">#</span>
                                        {topic}
                                    </span>
                                ))
                            ) : (
                                <span className="text-muted-foreground text-sm italic">No key topics identified</span>
                            )}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <a
                        href={`https://youtu.be/${video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-muted/20 rounded-2xl p-4 border border-border/50 aspect-video relative group overflow-hidden shadow-2xl hover:border-primary/30 transition-colors"
                    >
                        <img
                            src={thumbnail}
                            alt="Thumbnail"
                            className="w-full h-full object-cover rounded-xl opacity-90 group-hover:opacity-100 transition-all duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/60 p-4 rounded-full backdrop-blur-md group-hover:scale-110 transition-all duration-300 shadow-xl border border-white/10">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-10 h-10 text-[#FF0000] fill-current"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                            </div>
                        </div>
                    </a>

                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Video Stats</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Language</span>
                                <span className="font-semibold">{language}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-semibold">{metadata.duration ? formatDuration(metadata.duration) : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Published</span>
                                <span className="font-semibold">{formatDate(metadata.published_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
