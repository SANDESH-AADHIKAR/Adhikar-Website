# 🏛️ Adhikar — National Citizen Schemes AI & Verification Portal

Adhikar is a modern Civic Tech platform designed for Indian citizens to discover government welfare schemes, get tailored multilingual guidance, and detect fraudulent messages/subsidies in real-time.

---

## ✨ Features & Upgraded Civic Tech UI

- **🇮🇳 Modern Civic Tech Aesthetics**: Clean national palette (Ashoka Indigo, Saffron, and India Green micro-accents), frosted-glass navbar, responsive cards with smooth elevation, and refined typography.
- **📚 Verified Scheme Directory (`/schemes`)**: Comprehensive database across Agriculture, Healthcare, Education, Finance, Housing, and Social welfare with live search, category counts, and direct links to official `.gov.in` portals.
- **🤖 Sarkari Sahayak AI (`/assistant`)**: Natural citizen assistant supporting English, Hindi, and Marathi with 1-click prompt starters and tailored guidance on eligibility, documents, and schemes like PM-KISAN, Ayushman Bharat, and Mudra loans.
- **🛡️ SchemeGuard Scam Scanner (`/guard`)**: Fraud detection engine with an interactive Trust Score gauge (0–100%), safe advice, and pre-configured sample test scenarios (fake laptop scam vs. genuine PM-KISAN notice).
- **📋 Citizen Feedback (`/feedback`) & Activity Trail (`/history`)**: Private on-device audit logging and feedback submission.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Set up environment variables
cp .env.example .env.local

# 3. Start development server
npm run dev
# Open http://localhost:3000 in your browser
```

> **Note:** The app works 100% out-of-the-box in smart heuristic/mock mode without requiring any API keys.

---

## 🌐 Deploying to Vercel (Step-by-Step)

Because Adhikar is built on **Next.js 14 (App Router)**, Vercel provides zero-configuration, native serverless deployment.

### Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: modern civic tech UI upgrade for Adhikar"
   git branch -M main
   git remote add origin https://github.com/<your-username>/adhikar.git
   git push -u origin main
   ```
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** → **"Project"**.
   - Select your GitHub repository (`adhikar`).
   - Framework Preset will automatically detect **Next.js**.
   - Root Directory: `./` (leave default).
3. **Environment Variables (Optional)**:
   - If you have an LLM API key, expand the **Environment Variables** section and add:
     - `GEMINI_API_KEY` (Google AI Studio) or `OPENROUTER_API_KEY`
     - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if using Supabase)
4. Click **Deploy**. Within 60 seconds, your site is live with a free SSL `.vercel.app` domain!

---

### Option 2: Deploy via Vercel CLI

You can also deploy directly from your local terminal:

```bash
# 1. Run Vercel CLI (no installation required)
npx vercel

# Follow the interactive prompts:
# - Set up and deploy? [Y]
# - Which scope? [Your Account]
# - Link to existing project? [N]
# - Project name? [adhikar]
# - Directory? [./]
# - Override settings? [N]

# 2. Deploy to Production
npx vercel --prod
```

---

## 🔑 Environment Variables Reference

| Variable | Description | Required? |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for live AI assistant & scam scans | Optional (heuristic fallback provided) |
| `OPENROUTER_API_KEY` | Alternative OpenRouter API key | Optional |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL for feedback storage | Optional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key | Optional |
