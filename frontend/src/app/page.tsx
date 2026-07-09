/**
 * Main Application Page Component.
 * This is the 'Home' of VidScribe where everything comes together.
 * It manages the state for video data, loading status, and error messages.
 */
"use client";

import { useState } from "react";
import axios from "axios";
import { VideoInput } from "@/components/VideoInput";
import { VideoInfoCard } from "@/components/VideoInfoCard";
import { TranscriptCard } from "@/components/TranscriptCard";
import { VideoChat } from "@/components/VideoChat";
import { RecentHistory } from "@/components/RecentHistory";
import { VideoAnalysisResult } from "@/types";
import { ModeToggle } from "@/components/mode-toggle";

import { useRef } from "react";
import { SkeletonLoader } from "@/components/SkeletonLoader";

export default function Home() {
  const [data, setData] = useState<VideoAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // handleAnalyze is the 'Brain' of the frontend.
  // It calls our FastAPI backend and handles the response.
  const handleAnalyze = async (url: string, targetLang: string = "English") => {
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const { extractVideoId } = await import("@/lib/utils");
      const videoId = extractVideoId(url);

      if (!videoId) {
        throw new Error("Invalid YouTube URL. Please check the link.");
      }

      const response = await axios.get(`${API_URL}/transcript/${videoId}`, {
        params: { lang: "auto", target_lang: targetLang },
        signal: abortControllerRef.current.signal
      });

      setData(response.data);
    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        console.log("Request cancelled");
        return;
      }

      console.error(err);
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.status === 429) {
          const retryAfter = err.response.headers?.['retry-after'] || '60';
          setError(`Too many requests. Please wait ${retryAfter} seconds before trying again.`);
        } else {
          setError(
            err.response?.data?.detail ||
            err.message ||
            "An error occurred while analyzing the video."
          );
        }
      } else {
        setError("An unexpected error occurred while analyzing the video.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground font-sans transition-colors duration-300">
      <main className="container mx-auto px-6 py-8 md:py-16 max-w-7xl">
        {/* Floating Theme Toggle */}
        <div className="fixed right-4 top-2 md:right-8 md:top-8 z-50 p-1 bg-background/50 backdrop-blur-lg rounded-full border border-white/10 shadow-xl">
          <ModeToggle />
        </div>

        {/* Hero & Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-16 pt-12">

          <div className="lg:col-span-6 flex flex-col gap-6">
            <h1 className="text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.1] text-foreground">
              Instant AI insights for YouTube.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[45ch]">
              Paste any video link below. We extract the transcript, generate an executive summary, and highlight the key actionable insights.
            </p>
          </div>

          <div className="lg:col-span-6 lg:pl-12">
            <VideoInput onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 text-sm text-destructive border border-destructive/20 bg-destructive/5 rounded-none">
                {error}
              </div>
            )}
            
            <RecentHistory onSelect={handleAnalyze} />
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && <SkeletonLoader />}

        {/* Results Section */}
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
