# AI Agent Guidance for Hallways

## Project overview
- React + TypeScript + Vite desktop application wrapped in Electron.
- All data is stored in the browser's `localStorage` via React Context (`CRMContext.tsx`).
- Built output goes to `dist/` (web) and `dist-electron/` (Electron).

## Key files
- `src/App.tsx`: Main application component with sidebar navigation and tab routing.
- `src/main.tsx`: Entry point, renders App inside CRMProvider.
- `src/types.ts`: TypeScript interfaces (Account, Deal, Task, Invoice, Expense).
- `src/context/CRMContext.tsx`: Global state management using React Context + localStorage persistence.
- `src/components/Dashboard.tsx`: Main dashboard with metrics, chart, and tasks widget.
- `src/components/Kanban.tsx`: Kanban-style sales pipeline with stage columns.
- `src/components/Customers.tsx`: Customer/account management with list and detail view.
- `src/components/TasksView.tsx`: Task list with completion toggles and priority badges.
- `src/components/Financial.tsx`: Invoices and expenses management.
- `src/components/Settings.tsx`: Language selection and data management controls.
- `src/components/Modal.tsx`: Reusable animated modal component.
- `src/i18n.ts`: i18next initialization for multi-language support (en, pt, es).
- `src/locales.ts`: Translation strings for all supported languages.
- `src/index.css`: Global styles with Tailwind CSS 4.
- `electron/main.js`: Electron main process for desktop build.
- `index.html`: HTML entry point.
- `vite.config.ts`: Vite bundler configuration with React and Tailwind plugins.
- `package.json`: Project dependencies and scripts.

## How to run
- Install dependencies: `npm install`
- Start dev server: `npm run dev` (opens at http://localhost:5173/)
- Build for production: `npm run build`
- Build Electron app: `npm run electron:build`
- Run Electron in development: `npm run electron:dev`

## Conventions
- All CRM state is managed through `CRMContext.tsx` using React Context + localStorage.
- Use the `useCRM()` hook to access and modify data.
- Data entities: accounts, deals, tasks, invoices, expenses.
- UI uses Tailwind CSS utility classes with a dark theme (`bg-zinc-950`, `bg-dark-*`).
- Animations use Framer Motion (`motion.div`, `AnimatePresence`).
- Icons come from Lucide React (`lucide-react`).
- New components go in `src/components/`.

## Notes for AI agents
- The original Python FastAPI backend has been replaced with an Electron/React desktop app.
- All backend documentation (EVOLUTION.md, EVOLUTION_SUMMARY.md, QUICKSTART.md) describes the legacy Python server which no longer exists.
- The `@hallways/hallways.db` SQLite file is a legacy artifact; the app now uses localStorage.
- Prefer modifying `src/context/CRMContext.tsx` for data logic, `src/components/` for UI changes.
- When adding new data entities, add TypeScript interfaces in `src/types.ts`, update `CRMContext.tsx`, and add UI components in `src/components/`.