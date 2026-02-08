"use client";

import { useState } from "react";
import axios from "axios";
import { VideoInput } from "../components/VideoInput";
import { VideoInfoCard } from "../components/VideoInfoCard";
import { TranscriptCard } from "../components/TranscriptCard";
import { VideoAnalysisResult } from "./types";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  const [data, setData] = useState<VideoAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string, lang: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const { extractVideoId } = await import("./utils");
      const videoId = extractVideoId(url);

      if (!videoId) {
        throw new Error("Invalid YouTube URL. Please check the link.");
      }

      const response = await axios.get(`${API_URL}/transcript/${videoId}`, {
        params: { lang: "auto" },
      });

      setData(response.data);
    } catch (err: any) {
      console.error(err);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans section-padding transition-colors duration-300 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 dark:opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-200 h-150 bg-blue-500/10 rounded-full blur-[100px] -z-10 opacity-30 pointer-events-none" />

      <main className="container mx-auto px-4 py-5 max-w-5xl relative z-10">
        {/* Header */}
        <div className="relative flex flex-col items-center mb-10">
          <div className="absolute right-0 top-0">
            <ModeToggle />
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="p-2 bg-background/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-white/10 dark:ring-white/5">
                <svg
                  viewBox="0 0 24 24"
                  className="w-16 h-16 text-[#FF0000] fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70 dark:to-foreground/50 drop-shadow-sm">
                VidScribe
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Unlock the power of <span className="text-primary font-bold">AI insights</span> for any YouTube video instantly.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <VideoInput onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/15 text-destructive border border-destructive/20 p-4 rounded-lg mb-8 shadow-sm">
            {error}
          </div>
        )}

        {/* Results Section */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <VideoInfoCard data={data} />
            <TranscriptCard transcript={data.full_transcript} videoId={data.video_id} />
          </div>
        )}
      </main>
    </div>
  );
}
