# Placify AI — AI-Powered Placement Readiness Platform

Placify AI helps students evaluate their employability and improve their placement
preparation. It analyzes academic performance, technical skills, projects,
certifications, and resumes to generate a readiness score, company fit estimates,
and a personalized improvement roadmap.

> Scores and recommendations are estimates for self-assessment and guidance.
> They do not guarantee actual recruitment outcomes.

---

## Features

| Feature                    | What it does                                                       |
| -------------------------- | ------------------------------------------------------------------ |
| **Career Readiness Index** | Overall readiness score derived from your full profile             |
| **Company Fit Score**      | Estimated compatibility with Tier 1, Tier 2, and service companies |
| **Skill Gap Map**          | Missing technical and professional skills, ranked by severity      |
| **Resume Analysis**        | Resume and ATS scoring against your uploaded file                  |
| **Learning Roadmaps**      | Suggested focus areas based on your weakest axes                   |
| **AI Coach**               | Guidance chat (currently scripted demo responses)                  |

---

## Tech Stack

- **Framework** — [TanStack Start](https://tanstack.com/start) (full-stack React with SSR) + TanStack Router
- **UI** — React 19, Tailwind CSS v4, shadcn/ui (Radix primitives), Recharts, Lucide icons
- **Backend** — TanStack server functions, deployed as a Nitro serverless function
- **Database & Auth** — Supabase (Postgres, row-level security, storage, email + Google OAuth)
- **AI** — Google Gemini (`gemini-2.5-flash`) via the Generative Language API
- **Build & Hosting** — Vite 8, Nitro (`vercel` preset), Vercel

---

## Getting Started

### 1. Prerequisites

- Node.js 20 or newer
- A [Supabase](https://supabase.com) project (free tier is fine)
- Optionally, a [Google AI Studio](https://aistudio.google.com/apikey) key for real AI analysis

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in the values from your Supabase dashboard (**Project Settings → API**):

| Variable                        | Where it's used | Notes                                                        |
| ------------------------------- | --------------- | ------------------------------------------------------------ |
| `VITE_SUPABASE_URL`             | Browser         | Project URL                                                  |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser         | `anon` public key                                            |
| `SUPABASE_URL`                  | Server          | Same project URL                                             |
| `SUPABASE_PUBLISHABLE_KEY`      | Server          | Same `anon` key                                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server          | Optional; unused today. **Secret** — bypasses RLS if set     |
| `GEMINI_API_KEY`                | Server          | Optional; without it the analysis returns a neutral baseline |

### 4. Set up the database

Paste `supabase/setup.sql` into the Supabase **SQL Editor** and run it. It
creates the `profiles`, `analyses`, and `resumes` tables, the row-level security
policies that scope every row to its owner, the signup trigger, and the private
`resumes` storage bucket.

(It is the files in `supabase/migrations/` combined in order, plus creation of
the storage bucket the migrations reference but never create. If you prefer the
CLI, `supabase db push` applies the migrations — then create the `resumes`
bucket yourself.)

### 5. Enable email sign-in

In the Supabase dashboard, under **Authentication → Sign In / Providers →
Email**, make sure the **Email** provider is switched **on**. For local testing,
also turn **Confirm email** off inside that card — otherwise every sign-up
requires clicking a link in an email before the account can log in.

### 6. Run

```bash
npm run dev
```

The app runs at http://localhost:5173.

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project** and import the repo. Leave the build settings
   at their defaults — Nitro's `vercel` preset writes Vercel's Build Output API
   tree to `.vercel/output`, which Vercel detects automatically.
3. Under **Settings → Environment Variables**, add every variable from
   `.env.example` and redeploy.
4. Back in Supabase, add your Vercel URL under **Authentication → URL
   Configuration** (both Site URL and Redirect URLs), otherwise sign-in
   redirects will fail.

### Optional: Google sign-in

Email and password sign-in works as soon as Supabase is connected. For the
"Continue with Google" button, enable the Google provider under
**Authentication → Providers** in Supabase and add your OAuth credentials. Until
then the button shows a clear message rather than failing silently.

---

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | Production build to `.vercel/output` |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |
| `npm run format`  | Format with Prettier                 |

---

## Project Structure

```
src/
  routes/               File-based routes (TanStack Router)
    index.tsx           Landing page
    auth.tsx            Sign in / sign up
    _authenticated/     Auth-guarded dashboard routes
  components/ui/        shadcn/ui components
  integrations/
    supabase/           Client, admin client, auth middleware, generated types
  lib/
    analyze.functions.ts  Server functions for AI analysis
    mock-data.ts          Demo data for the landing page
supabase/migrations/    Database schema and RLS policies
```

---

## Limitations

The generated scores and recommendations are estimates intended for
self-assessment and guidance purposes. They do not guarantee actual recruitment
outcomes. The AI Coach currently returns scripted responses rather than
model-generated ones.

---

## Future Enhancements

- LinkedIn and GitHub profile analysis
- Live AI career coach
- Mock interview generator
- Resume and cover letter builder
- Placement trend analytics
- Company-specific preparation modules

---

## Author

**Charishma Sai Kurakula**

One-Month Internship & Training Program on AI-Enabled Next-Generation
Connectivity (Wireless & IoT) — GITAM University
