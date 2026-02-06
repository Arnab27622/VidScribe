export interface TranscriptSegment {
    text: string;
    start: number;
    duration: number;
}

export interface VideoMetadata {
    title?: string;
    description?: string;
    videoId?: string;
    thumbnail?: string;
    channel?: string;
    published_at?: string;
    duration?: number;
}

export interface VideoAnalysisResult {
    video_id: string;
    language: string;
    full_transcript: TranscriptSegment[];
    total_segments: number;
    metadata: VideoMetadata;
    summary: string;
    key_topics: string[];
    title?: string; // Sometimes at top level
}
