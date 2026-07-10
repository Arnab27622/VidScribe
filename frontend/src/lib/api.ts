import axios from "axios";
import { VideoAnalysisResult } from "@/types";
import { extractVideoId } from "@/lib/utils";

export async function analyzeVideo({ url, targetLang }: { url: string, targetLang: string }): Promise<VideoAnalysisResult> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    const videoId = extractVideoId(url);

    if (!videoId) {
        throw new Error("Invalid YouTube URL. Please check the link.");
    }

    // Fetch the FastAPI-compatible JWT token
    const tokenRes = await fetch("/api/auth/token");
    if (!tokenRes.ok) throw new Error("Authentication failed");
    const { token } = await tokenRes.json();

    const response = await axios.get(`${API_URL}/transcript/${videoId}`, {
        params: { lang: "auto", target_lang: targetLang },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    return response.data as VideoAnalysisResult;
}
