# Project Structure Map - AI-OS v2

This document provides a directory index mapping the root workspace and backend folders of the **AI-OS v2** project.

---

## 📂 Complete Workspace Layout

```
all-in-one-ai-solution/
├── .env.example                # Root environment variable documentation
├── README.md                  # Project overview documentation
├── index.html                 # Main website entry point (landing page/timeline)
├── aios_buisness.html         # Onboarding/Business launchpad workspace page
├── intro.html                 # App overview and user guide page
├── policy.html                # Privacy policy documentation
├── terms.html                 # Terms & conditions documentation
├── style.css                  # Core CSS variables, transitions & animations
├── business.css               # Special CSS stylesheets for AI-OS Business Hub
├── app.js                     # Root bootstrap module (warmups, lazy loaders)
├── business.js                # Core Business Hub controller
├── video-player.js            # Custom HTML5 media video player engine
├── ad-manager.js              # Inline advertisement loader
├── toolsData.js               # Static directory dataset of mapped tools
├── exploringAIData.js         # Static timeline roadmap chapters dataset
├── legalData.js               # Static terms/privacy policy drawer content
├── sw.js                      # Service worker template (offline caching)
├── manifest.json              # Web app installation manifest configurations
│
├── modules/                   # Client-side dynamic feature modules
│   ├── core.js                # Main state context registry
│   ├── auth.js                # Mock logins, coupon unlocks, OTP triggers
│   ├── explore.js             # SVG winding path, timeline renderer
│   ├── businessUI.js          # Tab selectors and workspace layouts
│   ├── learn.js               # Curriculum modules dashboard bindings
│   ├── build.js               # Launchpad playbooks compiler
│   ├── expand.js              # Mock strategist chatbot and metric dashboards
│   ├── premium.js             # Lock toggles, prompts limit counting
│   ├── ui.js                  # Global modals, theme switches, and drawer stubs
│   ├── video.js               # Audio/video launch parameters
│   └── utils.js               # Global toast triggers and event helper methods
│
├── backend/                   # Fresh Node.js Express server space
│   ├── src/
│   │   ├── controllers/      # Route request handler logic functions
│   │   ├── routes/           # REST endpoints paths registers
│   │   ├── services/         # Database/third-party API query functions
│   │   ├── middleware/       # Jwt gates and CORS configurations
│   │   ├── models/           # Data entity representations
│   │   ├── config/           # Server configs parses & variables tests
│   │   ├── utils/            # Utility helpers (formatting, dates)
│   │   ├── validators/       # Request body schemas validators
│   │   ├── constants/        # Fixed enums and constant key maps
│   │   ├── lib/              # Client loaders (Supabase, Razorpay instances)
│   │   ├── app.js            # Express application instantiation
│   │   └── server.js         # Port listener start point
│   ├── package.json          # Node dependency configurations
│   └── README.md             # Developer local setup instructions
│
├── docs/                      # Technical specification workspace documents
│   ├── DATABASE.md           # PostgreSQL schema DDL and ER diagrams
│   ├── API_SPEC.md           # Unified REST API parameters schemas
│   └── BACKEND_ARCHITECTURE.md # Architectural layers and global traps spec
│
└── temp-backend/              # Archived old backend codebase (Original backup)
    ├── .env                   # Original database and third-party API credentials
    ├── app_backup.js          # Pre-refactored monolithic app.js code
    ├── business_backup.js     # Pre-refactored monolithic business.js code
    ├── package.json           # Original backend dependencies backup
    └── server/                # Original server router/prisma code
```
