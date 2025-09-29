# VidScribe - YouTube Video Summarizer

![VidScribe Logo](https://img.shields.io/badge/VidScribe-YouTube%20AI%20Summarizer-blue?style=for-the-badge&logo=youtube)

An intelligent web application that extracts YouTube video transcripts and generates structured AI-powered summaries using Google's Gemini AI. VidScribe helps users quickly understand video content through automated analysis, key topic extraction, and comprehensive summaries.

## ✨ Features

### 🎯 Core Functionality
- **YouTube Video Analysis**: Extract and process video transcripts from YouTube URLs
- **AI-Powered Summaries**: Generate structured summaries using Google Gemini 1.5 Flash
- **Multi-language Support**: Support for English, Spanish, French, German, Hindi, and Japanese
- **Video Metadata Extraction**: Retrieve video title, duration, channel, thumbnail, and publication date
- **Real-time Processing**: Fast transcript extraction and AI analysis

### 🔍 Advanced Features
- **Smart Caching**: Redis-based caching system for improved performance (24-hour TTL)
- **Rate Limiting**: Built-in protection against API abuse (10 requests/minute)
- **Search & Highlight**: Search through transcripts with keyword highlighting
- **Pagination**: Efficient display of long transcripts (50 segments per page)
- **Download Options**: Export summaries as text files
- **Copy to Clipboard**: Easy transcript sharing
- **Responsive Design**: Mobile-friendly interface with dark/light theme toggle

### 🎨 User Interface
- **Modern Bootstrap Design**: Clean, responsive interface
- **Dark/Light Theme**: Toggle between themes for better viewing experience
- **Interactive Elements**: Clickable timestamps, expandable sections
- **Error Handling**: User-friendly error messages and loading states
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🏗️ Project Structure

```
YoutubeVideo-Summerizer-VidScribe/
├── routes/
│   ├── api.py              # FastAPI routes for transcript processing
│   ├── ui.py               # UI route handlers
│   └── services/
│       ├── gemini.py       # Gemini AI integration service
│       └── youtube.py      # YouTube API service
├── static/
│   ├── js/
│   │   ├── main.js         # Main application logic
│   │   ├── themeManager.js # Theme switching functionality
│   │   ├── uiManager.js    # UI state management
│   │   ├── utils.js        # Utility functions
│   │   └── videoService.js # Video processing service
│   ├── index.html          # Main HTML template
│   ├── play.ico            # Favicon
│   └── styles.css          # Custom CSS styles
├── .gitignore              # Git ignore rules
├── cache.py                # Redis caching implementation
├── config.py               # Configuration management
├── exception_handlers.py   # Custom exception handlers
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
└── utils.py                # Utility functions
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Redis Server
- Google Gemini API Key
- YouTube Data API v3 Key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd vidscribe
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
REDIS_URL=redis://localhost:6379/0
```

### 5. Start Redis Server
```bash
# On Windows (if using Redis on Windows)
redis-server

# On macOS with Homebrew
brew services start redis

# On Ubuntu/Debian
sudo systemctl start redis-server
```

### 6. Run the Application
```bash
python main.py
```

The application will be available at `http://localhost:8000`

## 🔧 API Documentation

### Endpoints

#### `GET /transcript/{video_id}`
Extract and analyze YouTube video transcript.

**Parameters:**
- `video_id` (path): YouTube video ID (11 characters)
- `lang` (query, optional): Language code (default: "en")

**Supported Languages:**
- `en` - English
- `es` - Spanish  
- `fr` - French
- `de` - German
- `hi` - Hindi
- `ja` - Japanese

**Response Example:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "language": "en",
  "title": "Rick Astley - Never Gonna Give You Up",
  "summary": "Classic 80s pop song with memorable lyrics...",
  "key_topics": ["music", "80s", "pop", "love song"],
  "full_transcript": [
    {
      "start": 0.0,
      "text": "We're no strangers to love",
      "duration": 2.5
    }
  ],
  "total_segments": 156,
  "metadata": {
    "duration": 213,
    "channel": "Rick Astley",
    "published_at": "2009-10-25T06:57:33Z",
    "title": "Rick Astley - Never Gonna Give You Up",
    "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  }
}
```

### Rate Limits
- 10 requests per minute per IP address
- Cached responses for 24 hours

### Error Handling
- `400`: Invalid video ID format
- `404`: Video not found or transcript unavailable
- `429`: Rate limit exceeded
- `500`: Internal server error

## 🔑 API Keys Setup

### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env` file as `GEMINI_API_KEY`

### YouTube Data API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add to your `.env` file as `YOUTUBE_API_KEY`

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Redis**: Caching and rate limiting
- **Google Gemini AI**: Text analysis and summarization
- **YouTube Transcript API**: Transcript extraction
- **YouTube Data API**: Video metadata
- **Uvicorn**: ASGI server

### Frontend
- **Vanilla JavaScript**: ES6+ modules
- **Bootstrap 5**: Responsive CSS framework
- **Font Awesome**: Icon library
- **Custom CSS**: Theme management and styling

### Development
- **Python 3.8+**: Core language
- **Virtual Environment**: Dependency isolation
- **Environment Variables**: Configuration management

## 🎯 Usage Examples

### Basic Usage
1. Open the application in your browser
2. Paste a YouTube URL in the input field
3. Select your preferred language
4. Click "Analyze" to process the video
5. View the generated summary and transcript

### Advanced Features
- **Search Transcript**: Use the search box to find specific content
- **Highlight Keywords**: Click the highlight button to mark search terms
- **Navigate Timestamps**: Click timestamp links to jump to video moments
- **Download Summary**: Export the analysis as a text file
- **Copy Transcript**: Copy the full transcript to clipboard

## 📊 Performance Features

### Caching Strategy
- **Transcript Cache**: 24-hour TTL for video transcripts
- **Summary Cache**: 24-hour TTL for AI-generated summaries
- **Metadata Cache**: Automatic caching of video information

### Rate Limiting
- **API Protection**: Prevents abuse and ensures fair usage
- **User Feedback**: Clear error messages with retry timing
- **Gradual Backoff**: Automatic retry suggestions

### Optimization
- **Lazy Loading**: Efficient memory usage for large transcripts
- **Pagination**: Improved UI performance for long videos
- **Async Processing**: Non-blocking API requests

## 🔒 Security Features

- **Input Validation**: YouTube video ID format verification
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Secure cross-origin requests
- **Error Sanitization**: Safe error message handling
- **Environment Variables**: Secure API key management

## 🐛 Troubleshooting

### Common Issues

**"No transcript available"**
- Some videos don't have auto-generated transcripts
- Try a different language option
- Ensure the video is publicly accessible

**"Rate limit exceeded"**
- Wait for the specified cooldown period
- Consider implementing user authentication for higher limits

**"Invalid video ID"**
- Ensure you're using a valid YouTube URL
- Check that the video exists and is public

**Redis connection errors**
- Verify the Redis server is running
- Check REDIS_URL in your .env file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful text analysis capabilities
- **YouTube Data API** for video metadata access
- **YouTube Transcript API** for transcript extraction
- **FastAPI** for the excellent web framework
- **Bootstrap** for responsive design components

---

**Made with ❤️ for the YouTube community**

*VidScribe - Transform YouTube videos into structured insights*
