import { ThemeManager } from './themeManager.js';
import { VideoService } from './videoService.js';
import { UIManager } from './uiManager.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const videoUrlInput = document.getElementById('videoUrl');
        const languageSelect = document.getElementById('language');
        const resultsContainer = document.getElementById('results');
        const btnText = document.getElementById('btnText');
        const loader = document.querySelector('.loader');
        const themeToggle = document.getElementById('themeToggle');

        // Initialize services and managers
        const videoService = new VideoService(analyzeBtn, btnText, loader, resultsContainer);
        const uiManager = new UIManager(resultsContainer, videoService);
        new ThemeManager(themeToggle);

        // Event listeners
        analyzeBtn.addEventListener('click', async () => {
            const videoUrl = videoUrlInput.value.trim();
            videoUrlInput.value = '';

            if (!videoUrl) {
                uiManager.showAlert('Please enter a YouTube URL', 'danger');
                return;
            }

            try {
                const lang = languageSelect.value;
                const data = await videoService.analyzeVideo(videoUrl, lang);
                uiManager.renderResults(data);
            } catch (error) {
                if (error.message.includes("Too many requests")) {
                    const match = error.message.match(/(\d+) seconds/);
                    const retrySeconds = match ? parseInt(match[1]) : 60;

                    uiManager.showAlert(`Too many requests. Please try again in ${retrySeconds} seconds.`, 'warning');

                    let remaining = retrySeconds;
                    analyzeBtn.disabled = true;
                    const interval = setInterval(() => {
                        btnText.textContent = `Try in ${remaining}s`;
                        if (remaining <= 0) {
                            clearInterval(interval);
                            btnText.textContent = 'Analyze';
                            analyzeBtn.disabled = false;
                        }
                        remaining--;
                    }, 1000);
                } else {
                    uiManager.showAlert(`Error: ${error.message}`, 'danger');
                }
            }
        });
    } catch (error) {
        console.error("Initialization error:", error);
        alert("JavaScript failed to load. Check console for errors.");
    }
});