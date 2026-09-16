# Semantic Filter

An AI-powered browser extension that semantically filters YouTube videos based on user-selected topics. The project combines a browser extension, a Node.js/Express backend, YouTube transcript extraction, and a Python FastAPI service using sentence embeddings to decide whether a video matches a blocked category.

## What it does

Semantic Filter monitors videos shown on YouTube and analyzes their available text rather than relying only on exact keyword matches.

```text
YouTube
   │
   ▼
Browser Extension
   │  title / video ID / selected tags
   ▼
Node.js + Express Backend (localhost:5000)
   │
   ├── fetch YouTube transcript
   │
   ▼
FastAPI AI Service (localhost:8000)
   │
   ├── SentenceTransformer: all-MiniLM-L6-v2
   ├── cosine similarity against semantic tag descriptions
   └── blocked / matched_tag / confidence
   │
   ▼
Browser Extension hides matching video
```

## Main components

### `extension/`

Manifest V3 browser extension code that runs on YouTube.

- Detects videos on YouTube pages.
- Sends video information to the local backend for analysis.
- Hides videos classified as blocked.
- Stores selected tags, blocked channels, and blocked keywords using browser local storage.
- Uses a `MutationObserver` so dynamically loaded YouTube content can also be processed.

### `backend/`

Node.js + Express service running on port `5000`.

The `/analyze` endpoint receives video information, attempts to fetch the YouTube transcript, combines title/description/transcript text, sends it to the AI service, and returns the classification result.

### `ai-service/`

Python FastAPI service running on port `8000`.

It uses the `all-MiniLM-L6-v2` Sentence Transformers model and cosine similarity to compare the video text with semantic descriptions for selected tags.

Current built-in semantic categories:

- `comedy`
- `politics`
- `war`
- `crime`
- `ragebait`

The current classifier blocks a video when the best similarity score is greater than `0.18`.

## Requirements

- Node.js and npm
- Python 3.10+ recommended
- A browser supporting Manifest V3
- Python packages: `fastapi`, `pydantic`, `sentence-transformers`, `scikit-learn`, and `uvicorn`

## Installation

```bash
git clone https://github.com/jeetshawXX/semantic-filter.git
cd semantic-filter
npm install
```

Install Python dependencies:

```bash
pip install fastapi pydantic sentence-transformers scikit-learn uvicorn
```

## Running the project

Start the AI service:

```bash
cd ai-service
uvicorn main:app --host 127.0.0.1 --port 8000
```

In another terminal, start the Node.js backend:

```bash
cd backend
node server.js
```

Services:

- AI service: `http://127.0.0.1:8000`
- Backend: `http://localhost:5000`

Optional health checks:

```bash
curl http://127.0.0.1:8000/
curl http://localhost:5000/
```

## Loading the extension

1. Open the browser's extension management page.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the repository's `extension/` directory.
5. Open YouTube.
6. Open the Semantic Filter popup.
7. Add the topics/tags you want to filter.
8. Optionally add blocked channels and keywords.

The backend must be running on `localhost:5000`, and the AI service must be running on `127.0.0.1:8000`.

## API

### Backend — `POST /analyze`

Example request:

```json
{
  "videoId": "VIDEO_ID",
  "title": "Example video title",
  "description": "Example description",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "selectedTags": ["politics", "ragebait"]
}
```

Example response:

```json
{
  "success": true,
  "blocked": true,
  "matched_tag": "politics",
  "confidence": 0.32
}
```

### AI service — `POST /classify`

Request:

```json
{
  "text": "Video text to analyze",
  "tags": ["politics", "crime"]
}
```

Response:

```json
{
  "blocked": true,
  "matched_tag": "politics",
  "confidence": 0.32
}
```

## How semantic filtering works

The classifier does not depend only on literal keyword matching. It converts text into vector embeddings and compares the video embedding with semantic descriptions associated with the selected tags.

For example, content discussing elections can be semantically similar to the `politics` category even when the exact category keyword is not present.

For each selected tag, the AI service calculates cosine similarity, keeps the tag with the highest score, and compares that score with the current blocking threshold of `0.18`.

## Current limitations

- Currently focused on YouTube.
- Transcript retrieval may fail when a transcript is unavailable; the backend continues with the other available text.
- Homepage video extraction currently sends an empty description field.
- Semantic categories and the `0.18` threshold are hard-coded in `ai-service/main.py`.
- Services currently use local development endpoints.
- The repository currently contains dependency/cache artifacts such as `node_modules` and Python `__pycache__` files; these should normally be excluded using `.gitignore`.

## Project structure

```text
semantic-filter/
├── ai-service/
│   └── main.py
├── backend/
│   └── server.js
├── extension/
│   ├── content.js
│   ├── manifest.json
│   ├── popup.css
│   ├── popup.html
│   ├── popup.js
│   └── styles.css
├── package.json
└── README.md
```

## Roadmap

- Improve YouTube metadata extraction.
- Add more configurable semantic categories.
- Make the similarity threshold configurable.
- Improve transcript caching and error handling.
- Add automated tests for the backend and AI classifier.
- Add production deployment configuration.
- Clean dependency/cache artifacts from source control.

## License

The project currently declares the **ISC** license in `package.json`.
