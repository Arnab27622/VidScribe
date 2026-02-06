"use client";

import { useState } from "react";
import axios from "axios";
import { VideoInput } from "../components/VideoInput";
import { VideoInfoCard } from "../components/VideoInfoCard";
import { TranscriptCard } from "../components/TranscriptCard";
import { VideoAnalysisResult } from "./types";
import { PlayCircle } from "lucide-react";
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
      const API_URL = "http://localhost:8000";

      const { extractVideoId } = await import("./utils");
      const videoId = extractVideoId(url);

      if (!videoId) {
        throw new Error("Invalid YouTube URL. Please check the link.");
      }

      const response = await axios.get(`${API_URL}/transcript/${videoId}`, {
        params: { lang },
      });

      setData(response.data);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 429) {
        setError("Too many requests. Please wait a minute before trying again.");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        {/* Header */}
        <div className="relative flex flex-col items-center mb-8">
          <div className="absolute right-0 top-0 md:top-2">
            <ModeToggle />
          </div>
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <PlayCircle className="w-8 h-8 text-red-600 fill-current" />
            VidScribe
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light text-center px-12">
            Get AI-powered insights from YouTube videos
          </p>
        </div>

        {/* Input Section */}
        <VideoInput onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-800 border border-red-200 p-4 rounded mb-6 dark:bg-red-900/30 dark:text-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Results Section */}
        {data && (
          <div className="space-y-6">
            <VideoInfoCard data={data} />
            <TranscriptCard transcript={data.full_transcript} videoId={data.video_id} />
          </div>
        )}
      </main>
    </div>
  );
}
