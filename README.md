# VidScribe 🎥✨
### AI-Powered YouTube Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-05998b?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?logo=google-gemini)](https://ai.google.dev/)

VidScribe is a state-of-the-art web application that transforms YouTube videos into structured knowledge. Using Google's Gemini AI, it provides instant summaries, actionable insights, and searchable transcripts, all wrapped in a premium, glassmorphic user interface.

---

## 🚀 Why VidScribe?

- **Save Time**: Turn a 30-minute video into a 2-minute read.
- **Deep Insights**: Don't just get a summary; get practical, actionable steps.
- **Searchable Knowledge**: Find exactly what was said with a high-speed, paginated transcript.

---

## 🛠️ How it Works (The Flow)

1.  **User Input**: User pastes a YouTube URL into the Next.js frontend.
2.  **ID Extraction**: The frontend cleans the URL and sends the 11-character Video ID to the FastAPI backend.
3.  **Data Gathering**: 
    - The backend fetches the **Transcript** using `youtube-transcript-api`.
    - It gathers **Metadata** (Title, Channel, Thumbnail) via the Google YouTube Data API v3.
4.  **AI Analysis**: The gathered text is sent to **Gemini 2.5 Flash** with a specialized prompt to generate a structured JSON summary.
5.  **Smart Caching**: Results are stored in **Redis** for 24 hours to ensure blazing-fast performance for popular videos.
6.  **Presentation**: The frontend renders a beautiful, interactive dashboard with synced seeking.

---

## 🏗️ Project Structure

The codebase is built with a **modular architecture**, making it easy to read, test, and scale.

```text
vidscribe/
├── backend/                # FastAPI Python Logic
│   ├── app/                # Package root
│   │   ├── api/            # Route endpoints (The "Doors" to our API)
│   │   ├── core/           # Security, Cache, and Config (The "Engine")
│   │   ├── services/       # AI & YouTube logic (The "Brain")
│   │   ├── utils/          # Helpers (The "Toolbox")
│   │   └── main.py         # Entry point (running as `python -m app.main`)
│   ├── .env.example        # Secrets template
│   └── requirements.txt    # Python dependencies
└── frontend/               # Next.js React Application
    ├── public/             # Static assets (Favicons, images)
    ├── src/                
    │   ├── app/            # App Router (Pages, Layouts, Styles)
    │   ├── components/     # UI Building Blocks (Cards, Buttons, Inputs)
    │   ├── lib/            # Shared logic & formatters
    │   └── types/          # TypeScript contracts (The "Blueprint")
    ├── .env.example        # API URL configuration
    └── tsconfig.json       # TypeScript configuration
```

---


## 🚦 Getting Started

### 1. Prerequisites
- **Python 3.9+** & **Node.js 18+**
- **Redis Server** (Local or [Upstash](https://upstash.com/))
- **API Keys**: Google Gemini (Free) & YouTube Data API v3.

### 2. Backend Installation
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Now fill in your API keys!
python -m app.main
```

### 3. Frontend Installation
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000` to start summarizing!

---

## 🧪 Technology Stack

| Layer        | Technologies                                       |
| :----------- | :------------------------------------------------- |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend**  | FastAPI, Redis, Httpx (Async HTTP)                 |
| **AI**       | Google Gemini 2.5 Flash                            |
| **Styling**  | Shadcn/UI (Inspired), Framer Motion (Animations)   |

---

## 🤝 Contributing

I love contributions! Whether it's a bug fix or a new feature:
1. Fork the repo.
2. Create your branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add NewFeature'`).
4. Push and open a Pull Request.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ by Arnab*


