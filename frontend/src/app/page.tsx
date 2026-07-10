"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { VideoInput } from "@/components/VideoInput";
import { VideoInfoCard } from "@/components/VideoInfoCard";
import { TranscriptCard } from "@/components/TranscriptCard";
import { VideoChat } from "@/components/VideoChat";
import { RecentHistory } from "@/components/RecentHistory";
import { VideoAnalysisResult } from "@/types";
import { ModeToggle } from "@/components/mode-toggle";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useMutation } from "@tanstack/react-query";
import { pageStyles } from "./page.styles";
import { analyzeVideo } from "@/lib/api";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Local state for the successful result, so we can keep displaying it
  // even if the mutation resets or if we want to clear it
  const [currentResult, setCurrentResult] = useState<VideoAnalysisResult | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const analyzeMutation = useMutation({
    mutationFn: analyzeVideo,
    onSuccess: (data) => {
      setCurrentResult(data);
    }
  });

  const handleAnalyze = (url: string, targetLang: string = "English") => {
    analyzeMutation.mutate({ url, targetLang });
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className={pageStyles.loadingWrapper}>
        <div className={pageStyles.loadingInner}>
          <div className={pageStyles.loadingSpinner} />
          <p className={pageStyles.loadingText}>Loading VidScribe...</p>
        </div>
      </div>
    );
  }

  // Determine error message safely
  let errorMessage: string | null = null;
  if (analyzeMutation.isError) {
    const err = analyzeMutation.error;
    if (axios.isAxiosError(err)) {
      if (err.response && err.response.status === 429) {
        const retryAfter = err.response.headers?.['retry-after'] || '60';
        errorMessage = `Too many requests. Please wait ${retryAfter} seconds before trying again.`;
      } else {
        errorMessage = err.response?.data?.detail || err.message || "An error occurred while analyzing the video.";
      }
    } else {
      errorMessage = (err as Error).message || "An unexpected error occurred.";
    }
  }

  return (
    <div className={pageStyles.pageWrapper}>
      <main className={pageStyles.main}>
        {/* Floating Header */}
        <div className={pageStyles.headerFloating}>
          {session?.user && (
            <div className={pageStyles.headerUserContainer}>
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  className={pageStyles.headerUserImage} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`${pageStyles.headerUserPlaceholder} ${session.user.image ? 'hidden' : ''}`}>
                <User className={pageStyles.headerUserIcon} />
              </div>
              <span className={pageStyles.headerUserName}>{session.user.name?.split(" ")[0]}</span>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={pageStyles.signOutButton}
            title="Sign Out"
          >
            <LogOut className={pageStyles.signOutIcon} />
          </button>
          <ModeToggle />
        </div>

        {/* Hero & Input Section */}
        <div className={pageStyles.heroGrid}>
          <div className={pageStyles.heroTextCol}>
            <h1 className={pageStyles.heroTitle}>
              Instant AI insights for YouTube.
            </h1>
            <p className={pageStyles.heroSubtitle}>
              Paste any video link below. We extract the transcript, generate an executive summary, and highlight the key actionable insights.
            </p>
          </div>

          <div className={pageStyles.heroInputCol}>
            <VideoInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} />

            {/* Error Message */}
            {errorMessage && (
              <div className={pageStyles.errorMessage}>
                {errorMessage}
              </div>
            )}
            
            <RecentHistory onSelect={handleAnalyze} />
          </div>
        </div>

        {/* Loading Skeleton */}
        {analyzeMutation.isPending && <SkeletonLoader />}

        {/* Results Section */}
        {currentResult && !analyzeMutation.isPending && (
          <div className={pageStyles.resultsWrapper}>
            <VideoInfoCard data={currentResult} />
            <div className={pageStyles.resultsGrid}>
              <TranscriptCard key={currentResult.video_id} transcript={currentResult.full_transcript} videoId={currentResult.video_id} />
              <VideoChat videoId={currentResult.video_id} language={currentResult.language} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
