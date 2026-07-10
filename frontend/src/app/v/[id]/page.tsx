"use client";

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
import { useQuery } from "@tanstack/react-query";
import { sharedVideoStyles } from "./shared-video.styles";

export default function SharedVideoPage() {
    const params = useParams();
    const videoId = params.id as string;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["shared-video", videoId],
        queryFn: async () => {
            if (!videoId) throw new Error("No video ID provided");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await axios.get(`${API_URL}/transcript/${videoId}`, {
                params: { lang: "auto" }
            });
            return response.data as VideoAnalysisResult;
        },
        enabled: !!videoId,
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });

    let errorMessage: string | null = null;
    if (isError) {
        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.detail || "Failed to load shared summary.";
        } else {
            errorMessage = (error as Error).message || "An unexpected error occurred.";
        }
    }

    return (
        <div className={sharedVideoStyles.pageWrapper}>
            <main className={sharedVideoStyles.main}>
                <div className={sharedVideoStyles.headerFloating}>
                    <ModeToggle />
                </div>

                <div className={sharedVideoStyles.backLinkContainer}>
                    <Link href="/" className={sharedVideoStyles.backLink}>
                        <ArrowLeft className={sharedVideoStyles.backIcon} />
                        Back to Home
                    </Link>
                </div>

                {isLoading && <SkeletonLoader />}

                {errorMessage && (
                    <div className={sharedVideoStyles.errorMessage}>
                        {errorMessage}
                    </div>
                )}

                {data && (
                    <div className={sharedVideoStyles.resultsWrapper}>
                        <VideoInfoCard data={data} />
                        <div className={sharedVideoStyles.resultsGrid}>
                            <TranscriptCard key={data.video_id} transcript={data.full_transcript} videoId={data.video_id} />
                            <VideoChat videoId={data.video_id} language={data.language} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
