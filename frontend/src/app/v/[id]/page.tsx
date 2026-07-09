"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { VideoInfoCard } from "@/components/VideoInfoCard";
import { TranscriptCard } from "@/components/TranscriptCard";
import { VideoChat } from "@/components/VideoChat";
import { VideoAnalysisResult } from "@/types";
import { ModeToggle } from "@/components/mode-toggle";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

export default function SharedVideoPage() {
    const params = useParams();
    const videoId = params.id as string;

    const [data, setData] = useState<VideoAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!videoId) return;

        const fetchSummary = async () => {
            setIsLoading(true);
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await axios.get(`${API_URL}/transcript/${videoId}`, {
                    params: { lang: "auto" }
                });
                setData(response.data);
            } catch (err: unknown) {
                console.error(err);
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.detail || "Failed to load shared summary.");
                } else {
                    setError("An unexpected error occurred.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, [videoId]);

    return (
        <div className="min-h-dvh bg-background text-foreground font-sans transition-colors duration-300">
            <main className="container mx-auto px-6 py-8 md:py-16 max-w-7xl">
                <div className="fixed right-4 top-2 md:right-8 md:top-8 z-50 p-1 bg-background/50 backdrop-blur-lg rounded-full border border-white/10 shadow-xl">
                    <ModeToggle />
                </div>

                <div className="mb-8 flex items-center">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                {isLoading && <SkeletonLoader />}

                {error && (
                    <div className="mt-4 p-4 text-sm text-destructive border border-destructive/20 bg-destructive/5 rounded-none">
                        {error}
                    </div>
                )}

                {data && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <VideoInfoCard data={data} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <TranscriptCard key={data.video_id} transcript={data.full_transcript} videoId={data.video_id} />
                            <VideoChat videoId={data.video_id} language={data.language} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
