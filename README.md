# DecorLeads — MERN + Tailwind

AI-assisted buyer discovery for home decor businesses: search for retailers, boutiques and designers, send a pitch email, and track it through **Sent Pitches → Proposals → Accepted Deals**.

**Stack:** React + Vite + Tailwind · Node + Express 5 · MongoDB/Mongoose (optional) · JWT auth · optional Google sign-in, Gemini and Resend.

## Run it locally (works with zero API keys)
```bash
cp server/.env.example server/.env     # then set JWT_SECRET to a long random string
npm run install-all
npm run dev
```
Client: http://localhost:5173 · API: http://localhost:5000

With nothing else configured the app runs in **Demo Mode**: sample buyers (fake `.example` addresses, never emailed) and in-memory storage (resets when the server restarts). Create an account on the sign-in page.

## Optional services
| Feature | Env var(s) | Notes |
|---|---|---|
| Persistent data | `MONGODB_URI` | MongoDB Atlas free cluster. If set, the app always uses it. |
| Real AI results | `GEMINI_API_KEY` | Google AI Studio free tier (rate-limited). Results are *suggestions*; contact details can be wrong. |
| Continue with Google | `GOOGLE_CLIENT_ID` | OAuth "Web" client ID. Add your site URL (e.g. http://localhost:5173) under *Authorized JavaScript origins*. |
| Real pitch emails | `RESEND_API_KEY`, `FROM_EMAIL` | `onboarding@resend.dev` only delivers to your own Resend account email; verify a domain to email anyone. Replies go to the signed-in user's email. |
| Spam guard | `DAILY_PITCH_LIMIT` | Max pitches per user per 24h (default 30). |

## Deploy on Render
`render.yaml` builds the client and serves it from Express as one web service. Set `MONGODB_URI` and any optional keys in the Render dashboard (`JWT_SECRET` is generated for you).

## What was fixed in this version
**Bugs**
- `JWT_SECRET` fallback mismatch (signed with `dev-secret`, verified with `undefined`) made every authenticated request fail when the env var was unset.
- Register/login hung without MongoDB although Demo Mode was promised. There is now an in-memory store.
- State chips (California, Texas…) searched the *previous* query, and searching from another tab never switched back to results.
- Resend returns `{ error }` instead of throwing, so failed emails were recorded as "sent". Now handled (502 + message).
- Express 5 `req.body` could be `undefined`; guarded. `dotenv` now loads before anything reads env vars. Unknown `/api/*` routes return JSON 404 instead of the HTML page.
- AI-supplied website URLs were rendered as links without checking the protocol (`javascript:` risk). Only http(s) is allowed, on server and client.
- Gemini now runs in JSON mode with tolerant parsing and field validation; invalid emails are blanked, not shown.
- Expired sessions now return to the sign-in page instead of failing silently.

**UI (original design)**
Forest-green / sand / terracotta palette, Fraunces + DM Sans fonts, a sidebar layout (bottom nav on mobile), buyer results as list rows, a "how it works" sign-in page, and four views: Discover, Outbox, Proposals, Won deals. The product name lives in `client/src/brand.js` (plus `<title>` in `client/index.html`).

**New**
Proposal pipeline (move a pitch to Proposals, mark Accepted, undo, clear), Google sign-in, per-user daily pitch limit, Reply-To set to the sender.
