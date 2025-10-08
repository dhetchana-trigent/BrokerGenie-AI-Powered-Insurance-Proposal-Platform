## BrokerGenie Setup Guide (Windows, macOS, Linux)

### Prerequisites
- Node.js 20 LTS (recommended)
- pnpm 9 (via Corepack) — npm also works
- Git

This project uses Next.js 15, React 18, and TypeScript. No Python packages or external services are required.

### 1) Install Node.js (v20 LTS)
- Windows/macOS: Download the LTS installer from `https://nodejs.org/en` (choose 20.x LTS)
- Verify:
```bash
node -v  # should be v20.x
npm -v
```

### 2) Enable pnpm via Corepack (recommended)
Corepack ships with Node 20 and manages package managers.
```bash
corepack enable
corepack prepare pnpm@9 --activate
pnpm -v  # should show 9.x
```
If `corepack` is not found, ensure Node 20+ is installed and restart your shell.

Alternatively, you can use npm instead of pnpm.

### 3) Install dependencies
From the project root (`brokergenie`):
```bash
pnpm i
```
Using npm instead:
```bash
npm i
```

### 4) Run the app (development)
```bash
pnpm dev
```
App will be available at `http://localhost:3000`.

Using npm instead:
```bash
npm run dev
```

### 5) Production build & start
```bash
pnpm build
pnpm start
```
Using npm instead:
```bash
npm run build
npm run start
```

### Environment Variables
No environment variables are required for local development or production.

### Python Requirements
None. This project does not require Python or a `requirements.txt`.

### Troubleshooting
- If ports are busy, stop the existing process using port 3000 or change the port:
```bash
set PORT=3001 && pnpm dev   # Windows PowerShell
PORT=3001 pnpm dev          # macOS/Linux
```
- If `corepack` is missing, reinstall Node 20 LTS and reopen your terminal.
- If installation fails on Windows, run your terminal as Administrator, then retry `pnpm i`.

---

## Sample Documents for Testing (Acme Manufacturing Inc)

Use these included files (folder: `Acme Manufacturing Inc docs/`) to test upload and AI extraction:
- `ACORD_125_Application.pdf` — application form
- `Loss_Runs_2023.pdf` — loss history
- `Prior_Policy_Declarations.pdf` — prior policy dec page
- `property_SOV.xlsx` — statement of values (property)

### Upload Instructions
1. Start the dev server (`pnpm dev`) and open `http://localhost:3000`.
2. Go to Client Intake (Upload).
3. Click Choose Files (or drag-and-drop).
4. Select one or more files from `Acme Manufacturing Inc docs/`.
5. Click Extract with AI and review parsed fields (e.g., business info, safety controls such as "Sprinkler System").