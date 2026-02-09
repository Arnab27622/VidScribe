# VidScribe 🎥✨
### AI-Powered YouTube Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-05998b?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?logo=google-gemini)](https://ai.google.dev/)

VidScribe is a state-of-the-art web application that transforms any YouTube video into structured knowledge. Using Google's Gemini 2.5 Flash AI, it provides instant **English summaries**, actionable insights, and searchable transcripts for videos in **any language**, all wrapped in a premium, glassmorphic user interface.

---

## 🚀 Key Features

- **Universal Translator**: Automatically generates **English summaries** acting as a universal translator for videos in Japanese, Spanish, Hindi, or any other language.
- **Smart Cookie Auth**: Bypasses YouTube's bot detection and age restrictions using a robust cookie management system (supports `youtube_cookies.txt`).
- **Deep Insights**: Extracts practical, actionable steps alongside the summary.
- **Time-Synced Transcript**: Interactive transcript that seeks the video player when clicked.
- **Blazing Fast**: Uses Redis caching to serve popular videos instantly.

---

## 🛠️ How it Works (The Flow)

1.  **User Input**: User pastes a YouTube URL into the Next.js frontend.
2.  **Smart Extraction**: The backend uses a headless browser-like session with **injected cookies** to bypass YouTube's 429 errors and bot checks.
3.  **Data Gathering**: 
    - Fetches the **Transcript** (prioritizing English, falling back to auto-generated).
    - Fetches **Metadata** (Title, Channel, Thumbnail) via YouTube Data API v3.
4.  **AI Analysis**: The content is sent to **Gemini 2.5 Flash** with a strict prompt to:
    - Translate non-English content.
    - Structure the output into Title, Summary, Key Topics, and Insights.
5.  **caching**: Results are stored in **Redis** (TTL 24h) for high performance.
6.  **Presentation**: The frontend renders the data in a responsive, dark-mode optimised dashboard.

---

## 🏗️ Project Structure

The codebase follows a modular Monorepo-like structure.

```text
vidscribe/
├── backend/                # FastAPI Python Application
│   ├── app/                
│   │   ├── api/            # Endpoints (Transcript & Summary)
│   │   ├── core/           # Config, Cache, Security
│   │   ├── services/       # Gemini AI & YouTube Logic
│   │   ├── utils/          # Helpers (Parsers, Validators)
│   │   └── main.py         # App Entry Point
│   ├── youtube_cookies.txt # [CRITICAL] Netscape format cookies for auth
│   ├── requirements.txt    # Python Dependencies
│   └── .env                # Secrets
└── frontend/               # Next.js 16 Application
    ├── src/                
    │   ├── app/            # App Router (Pages & Layouts)
    │   ├── components/     # UI Components (Shadcn/UI + Lucide)
    │   ├── lib/            # Utilities (Axios, Types)
    │   └── types/          # TypeScript Interfaces
    └── package.json        # Node Dependencies
```

---

## 🚦 Getting Started

### 1. Prerequisites
- **Python 3.9+** & **Node.js 18+**
- **Redis Server** (Local or Cloud like Upstash)
- **YouTube Cookies**: You MUST export your YouTube cookies in Netscape format (using an extension like "Get cookies.txt LOCALLY") and save the file as `backend/youtube_cookies.txt`.
- **API Keys**: 
  - `GEMINI_API_KEY` (Google AI Studio)
  - `YOUTUBE_API_KEY` (Google Cloud Console)

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your API Keys and Redis URL

# IMPORTANT: Ensure youtube_cookies.txt is present in the backend/ directory!

# Run the server
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the dev server
npm run dev
```

Visit `http://localhost:3000` to start summarizing!

---

## 🧪 Technology Stack

| Layer        | Technologies                                          |
| :----------- | :---------------------------------------------------- |
| **Frontend** | Next.js 16.1, React 19, Tailwind CSS v4, Lucide Icons |
| **Backend**  | FastAPI, Redis (Upstash), Httpx (Async HTTP)          |
| **AI**       | Google Gemini 2.5 Flash                               |
| **Scraping** | Youtube-Transcript-API + Requests (Custom Session)    |

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
