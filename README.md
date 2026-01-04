
# AstraWrite One AI - Advanced Content Generation Platform

AstraWrite One AI is a high-performance, enterprise-grade article generation and SEO optimization platform. Powered by Google Gemini 3 and 2.5 Flash models, it provides tools for high-perplexity writing, search-grounded links, and programmatic SEO.

## 🚀 Key Features
- **1-Click Blog Writer**: Generate 2000-5000 word articles with real external sources and internal linking.
- **Bulk Scheduler**: Batch generate up to 100 articles and auto-post them to WordPress.
- **SEO Intelligence**: Real-time keyword metrics (Volume, KD, CPC) and on-page optimization scores.
- **Stealth Humanizer**: Transform AI text into human-like writing to bypass detection.
- **Topic Clusters**: Plan and execute entire topical authority maps (Pillar-and-Spoke model).
- **Media Hub**: AI Image generation via Gemini 2.5 Flash Image.
- **WordPress Sync**: Full integration with WP REST API for seamless publishing.

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **AI Models**: Google Gemini 3 Flash (Text/Search), Gemini 2.5 Flash Image (Visuals)
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Setup & Deployment

### 1. Backend Setup
1.  Navigate to the `server` directory: `cd astrawrite-one-ai/server`
2.  Install dependencies: `npm install`
3.  Create a `.env` file and add the following variables:
    ```
    PORT=3001
    GEMINI_API_KEY=your_gemini_api_key_here
    WORDPRESS_URL=your_wordpress_url_here
    WORDPRESS_USERNAME=your_wordpress_username_here
    WORDPRESS_PASSWORD=your_wordpress_password_here
    SESSION_SECRET=a-very-secret-key-that-you-should-change
    DEMO_USER=demo@astrawrite.ai
    DEMO_PASS=password
    ```
4.  Start the backend server: `npm start`

### 2. Frontend Setup
1.  In a new terminal, navigate to the project root: `cd astrawrite-one-ai`
2.  Install dependencies: `npm install`
3.  Start the frontend development server: `npm run dev`

The application will be available at `http://localhost:3000`.

## 📄 License
MIT License.
