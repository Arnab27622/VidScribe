import {
    formatDuration,
    formatDate,
    escapeHtml,
    formatTime,
    escapeRegExp
} from './utils.js';

export class UIManager {
    constructor(resultsContainer, videoService) {
        this.resultsContainer = resultsContainer;
        this.videoService = videoService;

        this.filterTranscript = this.filterTranscript.bind(this);
        this.toggleHighlight = this.toggleHighlight.bind(this);
        this.resetHighlighting = this.resetHighlighting.bind(this);
    }

    showAlert(message, type) {
        document.querySelectorAll('.alert').forEach(alert => alert.remove());

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

        document.querySelector('.card-body').prepend(alertDiv);

        setTimeout(() => alertDiv.remove(), 5000);
    }

    renderResults(data) {
        this.videoService.cacheTranscript(data.video_id, data.language, data.full_transcript);

        this.renderPage(data, 1);
    }

    renderPage(data, page) {
        try {
            const page_size = 50;
            const start_idx = (page - 1) * page_size;
            const end_idx = start_idx + page_size;
            const paginated_transcript = data.full_transcript.slice(start_idx, end_idx);

            // Create a copy of data with paginated transcript
            const pageData = {
                ...data,
                transcript: paginated_transcript,
                current_page: page,
                page_size: page_size
            };

            this.resultsContainer.innerHTML = this.createVideoInfoCard(pageData) + this.createTranscriptCard(pageData);
            this.setupEventHandlers(pageData);
        } catch (error) {
            console.error("Rendering error:", error);
            this.showAlert('Failed to display results. Please try again.', 'danger');
        }
    }

    createVideoInfoCard(data) {
        const videoId = data.video_id;
        const metadata = data.metadata || {};
        const duration = metadata.duration || 0;
        const safeTitle = escapeHtml(data.title || 'Untitled Video');
        const safeSummary = escapeHtml(data.summary || 'No summary available');
        const safeChannel = escapeHtml(metadata.channel || 'Unknown Channel');
        const publishedAt = formatDate(metadata.published_at);

        let thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        if (metadata.thumbnail) {
            thumbnail = metadata.thumbnail.replace('default.jpg', 'maxresdefault.jpg');
        }

        return `
        <div class="card">
            <div class="card-header bg-primary text-white">
                <div class="d-flex justify-content-between align-items-center">
                    <h2 class="h5 mb-0">${safeTitle}</h2>
                    <div class="header-buttons">
                        <span class="badge bg-light text-dark">${data.language.toUpperCase()}</span>
                        <button class="btn btn-sm btn-success ms-2 download-btn">
                            <i class="fas fa-file-download me-1"></i> Download
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3 dark-mode-text">
                            <p><strong>Summary:</strong> ${safeSummary}</p>
                        </div>
                        
                        <div class="mb-3 dark-mode-text">
                            <h5>Key Topics</h5>
                            <div id="keyTopics">
                                ${data.key_topics?.length > 0
                ? data.key_topics.map(topic =>
                    `<span class="badge bg-info topic-badge">${topic}</span>`
                ).join('')
                : '<p>No key topics identified</p>'}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex flex-column align-items-center">
                            <div class="position-relative mb-3" style="max-width: 480px; width: 100%;">
                                <img src="${thumbnail}" 
                                     onerror="this.onerror=null; this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'"
                                     alt="Video thumbnail" class="video-preview w-100">
                                <div class="position-absolute bottom-0 start-0 bg-dark bg-opacity-75 text-white p-2 w-100">
                                    ${duration ? `Duration: ${formatDuration(duration)}` : 'Duration: N/A'}
                                </div>
                            </div>
                            <div class="text-center w-100">
                                <div class="mb-2">
                                    <p class="mb-1"><strong>Channel:</strong> ${safeChannel}</p>
                                    <p class="mb-1"><strong>Published:</strong> ${publishedAt}</p>
                                </div>
                                <div>
                                    <a href="https://youtu.be/${data.video_id}" target="_blank" 
                                       class="btn btn-sm btn-outline-danger">
                                        <i class="fab fa-youtube me-1"></i> Watch on YouTube
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    createTranscriptCard(data) {
        return `
        <div class="card">
            <div class="card-header bg-info text-white">
                <div class="d-flex justify-content-between align-items-center">
                    <h3 class="h5 mb-0">Transcript</h3>
                    <div>
                        <input type="text" id="transcriptSearch" class="form-control form-control-sm d-inline-block w-auto" placeholder="Search transcript...">
                        <button class="btn btn-sm btn-outline-light ms-2" id="highlightBtn">
                            <i class="fas fa-highlighter"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-body p-0">
                <div id="transcript-container" class="p-3">
                    ${data.transcript.map((segment, index) => `
                        <div class="segment" data-start="${segment.start}">
                            <div class="d-flex">
                                <div class="timestamp-container text-muted me-3">
                                    <a href="#" class="timestamp-link" 
                                        data-start="${Math.floor(segment.start)}">
                                            ${formatTime(segment.start)}
                                    </a>
                                </div>
                                <div class="flex-grow-1" data-original="${segment.text}">${segment.text}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="card-footer">
                <div class="d-flex justify-content-between align-items-center">
                    <small>Showing ${data.current_page * data.page_size - data.page_size + 1} to ${Math.min(data.current_page * data.page_size, data.total_segments)} of ${data.total_segments} segments</small>
                    <div>
                        ${data.current_page > 1
                ? `<button class="btn btn-sm btn-outline-primary me-2" id="prevPage">
                                <i class="fas fa-chevron-left"></i>
                               </button>`
                : ''}
                        ${data.current_page < Math.ceil(data.total_segments / data.page_size)
                ? `<button class="btn btn-sm btn-outline-primary" id="nextPage">
                                <i class="fas fa-chevron-right"></i>
                               </button>`
                : ''}
                        <button class="btn btn-sm btn-outline-secondary ms-2" id="copyTranscript">
                            <i class="fas fa-copy me-1"></i> Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    renderError(error) {
        this.resultsContainer.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <h4>Error Rendering Results</h4>
            <p>${error.message}</p>
            <button class="btn btn-secondary mt-2" onclick="location.reload()">
                <i class="fas fa-sync-alt me-1"></i> Reload Page
            </button>
        `;
        this.resultsContainer.appendChild(errorDiv);
        this.resultsContainer.classList.remove('d-none');
    }

    setupEventHandlers(data) {
        // Download button
        document.querySelector('.download-btn').addEventListener('click', () => this.downloadSummary(data));

        // Copy transcript button
        document.getElementById('copyTranscript').addEventListener('click', () => this.copyTranscript(data));

        // Timestamp links
        document.querySelectorAll('.timestamp-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const startTime = e.target.dataset.start;
                window.open(`https://youtu.be/${data.video_id}?t=${startTime}s`, '_blank');
            });
        });

        // Search and highlight
        document.getElementById('transcriptSearch').addEventListener('input', this.filterTranscript);
        document.getElementById('highlightBtn').addEventListener('click', this.toggleHighlight);

        // Pagination
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                const newPage = data.current_page - 1;
                this.renderPage(data, newPage);
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const newPage = data.current_page + 1;
                this.renderPage(data, newPage);
            });
        }
    }

    downloadSummary(data) {
        const title = data.title || "Untitled Video";
        const videoId = data.video_id || "unknown-id";
        const summary = data.summary || "No summary available";
        const keyTopics = data.key_topics?.length > 0
            ? data.key_topics.join('\n- ')
            : "No key topics identified";

        const content = `YouTube Video Summary\n\nTitle: ${title}\nVideo ID: ${videoId}\n\nSummary:\n${summary}\n\nKey Topics:\n- ${keyTopics}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `summary-${videoId}.txt`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    copyTranscript(data) {
        const transcriptText = data.transcript.map(segment =>
            `[${formatDuration(segment.start)}] ${segment.text}`
        ).join('\n');

        navigator.clipboard.writeText(transcriptText)
            .then(() => this.showAlert('Transcript copied to clipboard!', 'success'))
            .catch(() => this.showAlert('Failed to copy transcript', 'danger'));
    }

    filterTranscript(event) {
        const searchTerm = event.target.value.toLowerCase();
        const segments = document.querySelectorAll('.segment');
        this.resetHighlighting();

        segments.forEach(segment => {
            const textContainer = segment.querySelector('.flex-grow-1');
            const text = textContainer.textContent.toLowerCase();
            segment.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    }

    toggleHighlight() {
        const searchInput = document.getElementById('transcriptSearch');
        const searchTerm = searchInput.value;
        if (!searchTerm) {
            this.showAlert('Please enter a search term first', 'warning');
            return;
        }

        this.resetHighlighting();

        const segments = document.querySelectorAll('.segment .flex-grow-1');
        segments.forEach(segment => {
            const text = segment.textContent;
            const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
            segment.innerHTML = text.replace(regex, '<mark>$1</mark>');
        });
    }

    resetHighlighting() {
        const segments = document.querySelectorAll('.segment .flex-grow-1');
        segments.forEach(segment => {
            if (segment.dataset.original) {
                segment.textContent = segment.dataset.original;
            }
        });
    }
}