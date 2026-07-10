"use client";

import axios from "axios";
import { Clock, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { componentsStyles } from "./components.styles";

interface HistoryItem {
    id?: number;
    _id?: string;
    video_id: string;
    title: string;
    thumbnail: string;
    language?: string;
    created_at: string;
}

export function RecentHistory({ onSelect }: { onSelect: (url: string) => void }) {
    const { data: history = [], isLoading } = useQuery({
        queryKey: ["recent-history"],
        queryFn: async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const tokenRes = await fetch("/api/auth/token");
            if (!tokenRes.ok) throw new Error("Could not fetch token");
            const { token } = await tokenRes.json();

            const response = await axios.get(`${API_URL}/history`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data as HistoryItem[];
        },
        staleTime: 5 * 60 * 1000 // Cache history for 5 mins to avoid spamming the backend
    });

    if (isLoading || history.length === 0) return null;

    return (
        <div className={componentsStyles.recentHistory.wrapper}>
            <h3 className={componentsStyles.recentHistory.title}>
                <Clock className={componentsStyles.recentHistory.titleIcon} />
                Recently Summarized
            </h3>
            <div className={componentsStyles.recentHistory.listContainer}>
                {history.map((item, index) => (
                    <button
                        key={item._id || item.id || `history-${index}`}
                        onClick={() => onSelect(`https://youtube.com/watch?v=${item.video_id}`)}
                        className={componentsStyles.recentHistory.itemButton}
                    >
                        <div className={componentsStyles.recentHistory.imageWrapper}>
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
                                className={componentsStyles.recentHistory.image}
                            />
                            <div className={componentsStyles.recentHistory.playOverlay}>
                                <div className={componentsStyles.recentHistory.playButton}>
                                    <Play className={componentsStyles.recentHistory.playIcon} fill="currentColor" />
                                </div>
                            </div>
                            {item.language && (
                                <div className={componentsStyles.recentHistory.languageBadge}>
                                    {item.language}
                                </div>
                            )}
                        </div>
                        <h4 className={componentsStyles.recentHistory.itemTitle}>
                            {item.title}
                        </h4>
                    </button>
                ))}
            </div>
        </div>
    );
}
