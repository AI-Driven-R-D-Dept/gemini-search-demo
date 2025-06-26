# Gemini Google Search Demo

A Next.js application that demonstrates Google Search integration with Gemini AI using the `@google/genai` SDK.

## Features

- Google Search grounding with Gemini 2.5 Flash
- Clean, responsive UI with Tailwind CSS
- Real-time search results with source attribution
- TypeScript support

## Prerequisites

- Node.js 20+
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-search-demo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Enter a search query and get AI-powered responses with Google Search grounding

## API Endpoint

The application provides a search API endpoint at `/api/search`:

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Who won the 2024 UEFA European Championship?"}'
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v3
- **AI**: Google Gemini 2.5 Flash with Google Search grounding
- **SDK**: `@google/genai` v1.7.0

## Project Structure

```
├── app/
│   ├── api/search/
│   │   └── route.ts          # Search API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   └── ui/                   # UI components
├── lib/
│   └── utils.ts              # Utility functions
└── .env.example              # Environment variables template
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT License