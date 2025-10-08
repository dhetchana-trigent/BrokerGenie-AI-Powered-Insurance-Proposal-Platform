BrokerGenie — AI‑Powered Insurance Proposal Platform

BrokerGenie streamlines the commercial insurance workflow end‑to‑end: client intake, AI‑assisted data extraction, risk profiling, carrier fit analysis, package building & pricing, and professional proposal generation (PDF). The app is built with Next.js and a modern React UI.

Features
- Client Intake and Upload & Preview (ACORDs, SOV, Loss Runs, etc.)
- Extract with AI (parse & prefill) — integrated extraction context for demo data
- Risk Profile Dashboard with CSV‑driven criticality models
- Carrier Fit & Compliance with CSV‑driven appetite rules (Liberty, Zurich, AIG), tie‑break logic, and “Build with {Carrier}” flow
- Carrier‑specific Package Builder & Pricing (dynamic coverages and pricing)
- Proposal Builder with professional 2‑page PDF (jsPDF), actions: Generate PDF, Send Email, Schedule Follow‑up
- In‑app Sample Proposal preview modal on the landing page
- Clean workflow navigation (unnecessary pages removed per requirements)

Tech Stack
- Next.js 15, React 18, TypeScript
- Tailwind CSS 4 + Radix UI primitives + shadcn‑style components
- jsPDF for client‑side PDF generation

Requirements
- Node.js 20.x LTS
- pnpm 9 (recommended, via Corepack). npm works too
- No Python or external services required. No env vars needed

Quick Start (Clone and Run)
```
# Clone
git clone https://github.com/Roshan1917/BrokerGenie-AI-Powered-Insurance-Proposal-Platform.git
cd BrokerGenie-AI-Powered-Insurance-Proposal-Platform

# Enable pnpm (recommended)
corepack enable
corepack prepare pnpm@9 --activate

# Install deps and run
pnpm i
pnpm dev
# App: http://localhost:3000
```

Using npm instead of pnpm
```
npm i
npm run dev
# or production
npm run build
npm run start
```

Production Build
```
pnpm build
pnpm start
```

Project Structure (key folders)
- app/ — Next.js app router pages and layout
- components/ — UI and feature components
- lib/ — app utilities and extraction context
- public/ — static assets and CSV appetite/criticality data

Carrier Appetite (Business Type Mapping)
Appetite rules are configured in CSVs in public/ and parsed at runtime:
- carrier-liberty.csv
- carrier-zurich.csv
- carrier-aig.csv

Business Type is matched against include/conditional/exclude lists. Other factors (TIV, years in business, loss history, sprinklers, construction) can downgrade Fit to Conditional. A tie‑breaker ensures only one carrier is "Fit" when multiple match (Manufacturing → Liberty, Technology → Zurich, Finance → AIG).

License
Proprietary — for demonstration and internal use.


## Local Setup (Step-by-step)

1) Install prerequisites
- Node.js 20.x LTS from `https://nodejs.org/en`
- Git, and optionally pnpm via Corepack

2) Enable pnpm (recommended)
```
corepack enable
corepack prepare pnpm@9 --activate
```

3) Install dependencies (from project root)
```
pnpm i
# or: npm i
```

4) Run locally
```
pnpm dev
# or: npm run dev
# App: http://localhost:3000
```

5) Production build (optional)
```
pnpm build && pnpm start
# or: npm run build && npm run start
```

## Sample Documents & Upload (Acme Manufacturing Inc)

Use the bundled sample files in `Acme Manufacturing Inc docs/` to test Client Intake upload and AI extraction:
- `ACORD_125_Application.pdf` (application form)
- `Loss_Runs_2023.pdf` (claims history)
- `Prior_Policy_Declarations.pdf` (prior coverage)
- `property_SOV.xlsx` (statement of values)

Instructions:
1. Start the app and open `http://localhost:3000`
2. Go to Client Intake (Upload)
3. Click Choose Files (or drag-and-drop)
4. Select files from `Acme Manufacturing Inc docs/`
5. After upload, click Extract with AI and review the parsed fields (e.g., business info, operations, safety controls like "Sprinkler System")

If port 3000 is busy:
```
$env:PORT=3001; pnpm dev    # Windows PowerShell
set PORT=3001 && pnpm dev   # Windows CMD
PORT=3001 pnpm dev          # macOS/Linux
```
