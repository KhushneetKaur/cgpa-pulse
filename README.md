<div align="center">

# CGPA Pulse ⚡

**The smartest way to track, predict, and own your academic journey.**
Built for MRSPTU Bathinda students, by one of them.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cgpa--pulse.vercel.app-7c3aed?style=for-the-badge&logo=vercel)](https://cgpa-pulse.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://cgpa-pulse-backend.onrender.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa)](https://cgpa-pulse.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)


</div>

<!-- SCREENSHOTS: save 3 phone screenshots in docs/screenshots/ (leaderboard.png, calculator.png, predictor.png), then uncomment:
<div align="center">
  <img src="docs/screenshots/calculator.png" width="30%" alt="Live SGPA calculator" />
  <img src="docs/screenshots/predictor.png" width="30%" alt="Target CGPA predictor" />
  <img src="docs/screenshots/leaderboard.png" width="30%" alt="Leaderboard" />
</div>
-->

**Jump to:** [Impact](#impact) · [Features](#features) · [Tech Stack](#tech-stack) · [Architecture](#architecture) · [Getting Started](#getting-started) · [API](#api-reference) · [Security](#security) · [Roadmap](#roadmap)

---

## What Is This?

Every MRSPTU student has been there. Exam season ends, results drop, and you're frantically punching numbers into a calculator trying to figure out if your CGPA went up or down. Spreadsheets. WhatsApp forwards. Manual arithmetic at 2am.

The university's result PDFs show an SGPA per semester but never a CGPA, so every student was doing this math by hand.

**CGPA Pulse eliminates all of that.**

It's a full-stack progressive web app for MRSPTU students (B.Tech, B.Pharm, Pharm.D and M.Pharm). Enter your internal and external marks, get a live SGPA preview as you type, track your cumulative CGPA across every semester, predict what you need to hit a target, and compare yourself on a real-time leaderboard, all from your phone, installed like a native app.

---

## Impact

*As of November 2026*

| Registered students | On the leaderboard | Google Search CTR |
|:---:|:---:|:---:|
| **193+** | **70+** | **10.7%** at avg. position 6.5 |

Students found it on their own: the Google Search Console number is organic, with no ads and no promotion behind it.

---

## Features

### Core Calculator Engine
- **Live SGPA preview:** updates in real time as you type each mark, before you save
- **Theory + Lab support:** correct Internal/External split (40+60 for theory, 60+40 for lab)
- **Partial save detection:** marks unfilled subjects as partial, estimates SGPA with a `~` prefix
- **Quick SGPA entry:** already know your SGPA? Skip mark entry entirely with ⚡ Quick SGPA
- **Delete records:** remove any semester's data cleanly

### Scheme-Aware Grading Engine
Different programmes grade differently, and the engine handles all of them from one codebase:

- **Engineering (B.Tech):** numeric 10-point GPA (see [SGPA Calculation](#sgpa-calculation))
- **University Departments (B.Pharm, Pharm.D, M.Pharm):** O/A/B/C/D/F letter grades + percentage system
- **Pharm.D:** supports its 5-year annual structure instead of semesters

### Branch & Syllabus Support
Official subject lists for every supported programme, loaded automatically once you pick your branch:

- **B.Tech:** CSE, CSE (AI & ML), ECE, EE, ME, Civil, Textile
- **University Departments:** B.Pharm, Pharm.D, M.Pharm
- More branches and programmes are being added over time

### Subject Customisation
- **Hide subjects:** remove dropped/obsolete subjects from SGPA calculation
- **Add subjects:** add new subjects with custom credits and type (theory/lab)
- **Elective picker:** dropdown with official elective options per branch per semester
- All customisations persist across sessions in the database

### CGPA Predictor & Target
- **Target CGPA calculator:** enter a target CGPA, get the exact SGPA needed in the remaining semesters
- **Grade predictor:** enter internal marks, see what external score you need for each grade
- **Per-semester credit awareness:** calculations account for hidden/custom subjects automatically

### Leaderboard
- Real-time leaderboard with **Overall** and **Branch** tabs
- Participation is mandatory, so the board reflects everyone
- Branch badges, medal rankings (🥇🥈🥉), CGPA colour coding

### Backlogs Tracker
- Mark any subject as a backlog from the marks panel
- Dedicated Backlogs tab showing all pending subjects across semesters
- ⚠ badge on the navigation tab when backlogs exist

### Mobile-First UX
- **Hybrid marks layout on mobile:** bird's-eye subject grid at the top, sticky input dock at the bottom
- **Tap any subject card** to load it into the dock, no scrolling through rows
- **← Prev / Next →** navigation inside the dock with Enter key support
- **Bottom tab bar** with the core 4 tabs + a "More ⋯" sheet for secondary pages
- **Installable PWA:** works offline, adds to the home screen like a native app

### Authentication
- **Google OAuth only:** one-tap sign in, no passwords to remember or forget
- **JWT + HttpOnly cookies:** access token (15m) + refresh token (7d), cross-domain safe
- **Persistent sessions:** stay logged in across browser restarts
- **New user onboarding:** 4-step flow: username → branch → current semester → quick guide

### Developer Identity
- **Terminal boot sequence** on first visit with a full typewriter effect and system boot messages
- **Floating grade cards** ambient background animation on the login page
- **[ Developer Console ]** glowing button in the login drawer and avatar dropdown
- About modal with terminal aesthetic, tech stack pills, and GitHub/LinkedIn links

---

## Tech Stack

### Frontend
```
React 18              UI framework with hooks
Vite                  build tool, HMR, code splitting
React Hot Toast       notification system
@react-oauth/google   Google OAuth integration
PWA (manifest + SW)   installable, offline-capable
CSS Variables         instant theme switching without flash
```

### Backend
```
Node.js + Express     REST API server
MongoDB + Mongoose    database with compound indexes
JWT (HttpOnly)        stateless auth, XSS-safe
Helmet                security headers
express-rate-limit    brute force protection
Joi                   request validation
```

### Infrastructure
```
Vercel          frontend hosting, edge CDN
Render          backend hosting
MongoDB Atlas   managed database cluster
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                    │
│                                                         │
│   React 18 + Vite PWA                                   │
│     └─ AuthContext ─ AppDataContext ─ API services      │
│        (semester / user / leaderboard)                  │
└────────────────────────┬────────────────────────────────┘
                         │  HTTPS + HttpOnly cookies
┌────────────────────────▼────────────────────────────────┐
│                    Render (Backend)                     │
│                                                         │
│   Express API                                           │
│     ├── /api/auth         Google OAuth, JWT, refresh    │
│     ├── /api/user         profile, branch, username     │
│     ├── /api/semesters    marks, backlogs, electives    │
│     └── /api/leaderboard  ranked entries                │
│                                                         │
│   Middleware: Helmet, CORS, rate limit, JWT protect     │
└────────────────────────┬────────────────────────────────┘
                         │  Mongoose ODM
┌────────────────────────▼────────────────────────────────┐
│                     MongoDB Atlas                       │
│                                                         │
│   users           profile, auth, install tracking       │
│   semesterdatas   marks, SGPA, custom/hidden subjects   │
└─────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Cloud Console project with OAuth 2.0 credentials

### Clone & Install

```bash
git clone https://github.com/KhushneetKaur/cgpa-pulse.git
cd cgpa-pulse

# Install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && npm install
```

### Environment Variables

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/cgpa-pulse
JWT_SECRET=your_64_char_hex_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
COOKIE_SAMESITE=lax
GOOGLE_CLIENT_ID=your_google_client_id
```

### Run Locally

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## Project Structure

```
cgpa-pulse/
├── frontend/
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   ├── sw.js              # Service worker
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── src/
│       ├── components/        # Shared UI components
│       ├── context/           # React context (Auth, Theme, AppData)
│       ├── data/              # Branch/subject/grade data
│       ├── hooks/             # Custom hooks (usePWAInstall)
│       ├── pages/             # Page components
│       │   └── login/         # Login flow (drawer, terminal, about)
│       ├── services/          # Axios API service layers
│       ├── styles/            # Global + responsive CSS
│       └── utils/             # SGPA/CGPA calculations, validators
│
└── backend/
    └── src/
        ├── config/            # DB connection, logger
        ├── controllers/       # Route handlers
        ├── middleware/        # Auth, rate limit, validation
        ├── models/            # Mongoose schemas
        ├── routes/            # Express routers
        ├── services/          # Business logic (auth, email)
        └── utils/             # ApiError, ApiResponse, validators
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Google OAuth sign-in |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Clear cookies |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/branch` | Update branch |
| PUT | `/api/user/username` | Change username (30d cooldown) |
| PUT | `/api/user/current-sem` | Update current semester |
| POST | `/api/user/app-install` | Record PWA install |
| GET | `/api/user/check-username` | Check username availability |

### Semesters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/semesters/:branch` | Get all semesters |
| POST | `/api/semesters/:branch/:sem` | Save detailed marks |
| POST | `/api/semesters/:branch/:sem/quick` | Save quick SGPA |
| DELETE | `/api/semesters/:branch/:sem` | Delete semester record |
| PUT | `/api/semesters/:branch/:sem/backlog` | Toggle backlog |
| PUT | `/api/semesters/:branch/:sem/elective` | Update elective name |
| POST | `/api/semesters/:branch/:sem/custom-subjects` | Add custom subject |
| DELETE | `/api/semesters/:branch/:sem/custom-subjects/:code` | Remove custom subject |
| PATCH | `/api/semesters/:branch/:sem/subjects/:code/visibility` | Hide/restore subject |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Ranked entries (Overall and per-branch) |

---

## Security

- **HttpOnly JWT cookies:** tokens are never accessible from JavaScript, XSS-proof
- **SameSite=None; Secure:** cross-domain cookies work safely on HTTPS
- **Helmet.js:** sets 11 security headers including CSP, HSTS, X-Frame-Options
- **Rate limiting:** auth routes limited to 50 req/15min, save routes limited separately
- **Joi validation:** every request body validated before hitting controllers
- **Google token verification:** tokens verified against Google's userinfo endpoint, not trusted client-side
- **30-day username cooldown:** enforced server-side, prevents username squatting

---

## SGPA Calculation

B.Tech programmes use MRSPTU's 10-point grading system:

| Marks Range | Grade | Grade Points |
|-------------|-------|--------------|
| 91–100 | A+ (Outstanding) | 10 |
| 81–90 | A | 9 |
| 71–80 | B+ | 8 |
| 61–70 | B | 7 |
| 51–60 | C | 6 |
| 46–50 | D | 5 |
| 40–45 | E | 4 |
| Below 40 | F | 0 |

**SGPA formula**
```
SGPA = Σ(Grade Points × Credits) / Σ(Credits)
```

**CGPA formula**
```
CGPA = Σ(SGPA × Semester Credits) / Σ(All Semester Credits)
```

Hidden subjects are excluded from both numerator and denominator. Custom subjects are included with their specified credits.

---

## Engineering Notes

Two things that were harder than they look:

- **Cross-domain auth.** HttpOnly cookies between Vercel and Render needed careful `SameSite`/`Secure` handling, and an iOS login loop had to be tracked down and fixed.
- **Removing dead weight.** Deleted a CSRF middleware that wasn't doing anything and was adding latency, and cleaned up duplicate routes.

---

## Deployment

### Frontend → Vercel
```bash
# Set environment variables in the Vercel dashboard:
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Deploy
vercel --prod
```

### Backend → Render
```
Environment variables on Render:
PORT=10000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_URL=https://your-app.vercel.app
COOKIE_SAMESITE=none
GOOGLE_CLIENT_ID=...
```

**Cold start tip:** add a cron job at `cron-job.org` to ping `https://your-backend.onrender.com/health` every 10 minutes. It keeps Render warm and removes cold start delays for users.

---

## Roadmap

- [ ] Notifications for semester result season
- [ ] Export CGPA report as PDF
- [ ] Share CGPA card as image (Instagram-ready)
- [ ] Dark/light mode scheduled switching
- [ ] Multiple university support (PTU affiliates)
- [ ] Grade improvement suggestions based on current performance

---

## About the Developer

Built with obsession by **Khushneet Kaur**, B.Tech CSE student at GZSCCET, affiliated with MRSPTU Bathinda.

This started as "I just need a quick calculator" and turned into a production application with OAuth, PWA capabilities, a leaderboard, grade prediction, subject customisation, support for multiple grading schemes, and a terminal boot sequence on the login page.

That escalated quickly.

[![GitHub](https://img.shields.io/badge/GitHub-KhushneetKaur-181717?style=flat-square&logo=github)](https://github.com/KhushneetKaur)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Khushneet%20Kaur-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/khushneet)

---

## License

MIT. Use it, fork it, learn from it. Just don't claim you built it.

---

<div align="center">

**Made with ✨ for every MRSPTU student who's ever manually calculated their CGPA at 2am**

[cgpa-pulse.vercel.app](https://cgpa-pulse.vercel.app) · Not affiliated with MRSPTU · Free forever

</div>
