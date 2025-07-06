import { extractVideoId } from './utils.js';

export class VideoService {
    constructor(analyzeBtn, btnText, loader, resultsContainer) {
        this.analyzeBtn = analyzeBtn;
        this.btnText = btnText;
        this.loader = loader;
        this.resultsContainer = resultsContainer;
        this.transcriptCache = {};
    }

    cacheTranscript(videoId, lang, transcript) {
        const cacheKey = `${videoId}_${lang}`;
        this.transcriptCache[cacheKey] = transcript;
    }

    getCachedTranscript(videoId, lang) {
        const cacheKey = `${videoId}_${lang}`;
        return this.transcriptCache[cacheKey];
    }

    async analyzeVideo(videoUrl, lang) {
        try {
            let videoId = extractVideoId(videoUrl);
            if (!videoId) {
                throw new Error('Invalid YouTube URL or ID');
            }

            this.setLoadingState(true);
            this.resultsContainer.innerHTML = '';
            this.resultsContainer.classList.add('d-none');

            const response = await fetch(`/transcript/${videoId}?lang=${lang}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 429) {
                    throw new Error("YouTube is blocking requests. Try again in 60 seconds.");
                }
                throw new Error(errorData.detail || 'Unknown error occurred');
            }

            return await response.json();
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        this.analyzeBtn.disabled = isLoading;
        this.btnText.textContent = isLoading ? 'Processing...' : 'Analyze';
        this.loader.style.display = isLoading ? 'inline-block' : 'none';
        this.resultsContainer.classList.toggle('d-none', isLoading);
    }
}