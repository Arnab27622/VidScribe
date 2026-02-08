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
    is_embeddable?: boolean;
}

export interface KeyTopic {
    topic: string;
    timestamp: string;
}

export interface VideoAnalysisResult {
    video_id: string;
    language: string;
    full_transcript: TranscriptSegment[];
    total_segments: number;
    metadata: VideoMetadata;
    summary: string;
    key_topics: KeyTopic[];
    actionable_insights?: string[];
    title?: string; // Sometimes at top level
}
