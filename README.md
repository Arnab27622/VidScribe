# VidScribe 🎥✨
### AI-Powered YouTube Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-05998b?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?logo=google-gemini)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)](https://www.sqlite.org/)

VidScribe is a state-of-the-art web application that transforms any YouTube video into structured knowledge. Using Google's **Gemini 2.5 Flash AI**, it provides instant summaries, actionable insights, and searchable transcripts for videos in **any language**, all wrapped in a premium, glassmorphic dark-mode user interface.

---

## 🚀 Key Features

- 🌍 **Multi-Language Generation**: Select your preferred output language. The AI natively translates its understanding and generates summaries and insights in Spanish, Hindi, French, Japanese, and more.
- 🔊 **Smart Audio Fallback**: No captions? No problem. If a video lacks a text transcript, VidScribe automatically downloads the audio track via `yt-dlp` and parses it directly through Gemini's native audio understanding.
- 🔗 **Shareable Links**: Every summarized video generates a dedicated URL (`/v/[id]`). Copy and share the link with anyone to give them instant access to the summary and transcript.
- 📜 **Interactive & Searchable Transcript**: A beautifully formatted transcript with clickable timestamps that automatically seek the embedded YouTube player. Includes a sticky floating search bar for instant keyword filtering.
- 💬 **Ask the Video**: A dedicated chat interface allowing you to ask specific, contextual questions about the video content.
- 🗄️ **Smart History & Caching**: 
  - **SQLite History**: Automatically tracks your previously summarized videos, complete with dynamic language badges (e.g., separating your English summary from your Hindi summary of the same video).
  - **Redis Caching**: Video metadata and AI summaries are cached via Redis for lightning-fast retrieval on subsequent visits.

---

## 🛠️ System Architecture

1.  **Frontend (Next.js 16)**: A responsive, React 19 interface styled with Tailwind CSS v4. Features custom scrollbars, glassmorphic cards, and real-time SSE streaming for the chat interface.
2.  **Backend API (FastAPI)**: A high-performance Python backend that orchestrates the data pipeline.
3.  **Extraction Layer**: Uses `youtube-transcript-api` for captions, `yt-dlp` for audio fallback, and the YouTube Data API v3 for high-res thumbnails and metadata.
4.  **AI Engine**: Communicates asynchronously with the `google-generativeai` SDK, passing massive transcripts or audio files securely.
5.  **Data Layer**: Dual-database approach using **Redis (Upstash)** for ephemeral high-speed caching and **SQLite (`aiosqlite`)** for persistent user history tracking.

---

## 🏗️ Project Structure

```text
vidscribe/
├── backend/                # FastAPI Python Application
│   ├── app/                
│   │   ├── api/            # API Endpoints (Summarize, Chat, History)
│   │   ├── core/           # Configuration & Environment Variables
│   │   ├── db/             # SQLite Models, CRUD Operations, and Database logic
│   │   ├── services/       # Gemini AI, YouTube API, and Audio Fallback logic
│   │   ├── utils/          # Helpers (Transcript Formatting, Parsers)
│   │   └── main.py         # FastAPI Entry Point
│   ├── history.db          # SQLite User History Database
│   ├── youtube_cookies.txt # [CRITICAL] Netscape format cookies for auth
│   ├── requirements.txt    # Python Dependencies
│   └── .env                # Secrets & API Keys
├── frontend/               # Next.js 16 Application
│   ├── src/                
│   │   ├── app/            # App Router (Pages, /v/[id] Dynamic Routes)
│   │   ├── components/     # UI Components (VideoPlayer, Chat, Transcript, History)
│   │   ├── lib/            # Utilities (Axios config)
│   │   └── types/          # TypeScript Interfaces
│   └── package.json        # Node Dependencies
└── start.bat               # Windows Quick-Start Script
```

---

## 🚦 Getting Started

### 1. Prerequisites
- **Python 3.9+** & **Node.js 18+**
- **FFmpeg**: Required for the `yt-dlp` audio fallback system. Must be installed and accessible in your system's PATH.
- **Redis Server** (Local or Cloud like Upstash)
- **YouTube Cookies**: Export your YouTube cookies in Netscape format (using an extension like "Get cookies.txt LOCALLY") and save the file as `backend/youtube_cookies.txt`.
- **API Keys**: 
  - `GEMINI_API_KEY` (Google AI Studio)
  - `YOUTUBE_API_KEY` (Google Cloud Console)

### 2. Quick Start (Windows)
If you are on Windows, simply double click the `start.bat` file in the root directory. It will automatically activate the Python virtual environment, start the FastAPI backend, and launch the Next.js frontend in separate terminal windows!

### 3. Manual Setup

**Backend Setup**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY, YOUTUBE_API_KEY, and REDIS_URL

# IMPORTANT: Ensure youtube_cookies.txt is present in the backend/ directory!

# Run the server
uvicorn app.main:app --reload
```

**Frontend Setup**
```bash
cd frontend
npm install

# Create .env.local
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the dev server
npm run dev
```

Visit `http://localhost:3000` to start analyzing!

---

## 🤝 Contributing

1. Fork the repo.
2. Create your branch (`git checkout -b feature/NewFeature`).
3. Commit your changes.
4. Push and open a Pull Request.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ by Arnab*
