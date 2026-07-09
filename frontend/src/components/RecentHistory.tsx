"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, Play } from "lucide-react";

interface HistoryItem {
    id: number;
    video_id: string;
    title: string;
    thumbnail: string;
    language?: string;
    created_at: string;
}

export function RecentHistory({ onSelect }: { onSelect: (url: string) => void }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await axios.get(`${API_URL}/history`);
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (isLoading || history.length === 0) return null;

    return (
        <div className="mt-8">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-4 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Recently Summarized
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(`https://youtube.com/watch?v=${item.video_id}`)}
                        className="group shrink-0 w-64 text-left space-y-2 cursor-pointer"
                    >
                        <div className="relative aspect-video rounded-md overflow-hidden border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.thumbnail || `https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg`}
                                alt={item.title}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.includes('mqdefault.jpg')) {
                                        target.src = `https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg`;
                                    }
                                }}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/20 backdrop-blur-[2px]">
                                <div className="bg-background/80 p-2 rounded-full shadow-sm">
                                    <Play className="w-4 h-4 text-primary" fill="currentColor" />
                                </div>
                            </div>
                            {item.language && (
                                <div className="absolute top-2 right-2 bg-background/90 text-foreground px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm border border-border">
                                    {item.language}
                                </div>
                            )}
                        </div>
                        <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                        </h4>
                    </button>
                ))}
            </div>
        </div>
    );
}
