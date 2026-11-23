# 🚀 Zenith CRM

> **A modern, offline-first CRM and Business Management Desktop Application**

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Electron%20%2B%20TypeScript-61DAFB)

---

## 📋 Overview

Zenith CRM is a powerful desktop business management application built with **React + TypeScript + Vite** and wrapped in **Electron** for native desktop performance. It manages your entire sales pipeline, customer relationships, financials, and tasks — all **offline-first** with local storage.

**Status:** ✅ Production Ready  
**Version:** 1.0.0 (Initial)  
**Last Updated:** May 2026

---

## ✨ Features

### 📊 Dashboard
- **Real-time metrics**: Active deals, won revenue, pending invoices, task counts
- **Pipeline distribution chart**: Visual breakdown of deal stages
- **Quarterly target tracker**: Progress bar with percentage achievement
- **Priority tasks widget**: Quick-access to upcoming deadlines

### 🏷️ Kanban Sales Pipeline
- **Drag-and-drop columns**: Prospecção → Proposta Enviada → Fechados/Ganhos
- **Deal cards**: Title, company, value, and quick-stage transitions
- **Search & filter**: Find deals by name or company
- **Add new deals**: In-modal form with company selection

### 🏢 Customer Management (Accounts)
- **Customer directory**: Searchable list with company details
- **Detailed view**: Company profile, industry, website, contact info
- **CRUD operations**: Add new companies, delete existing ones
- **Empty state guidance**: Helpful prompts when no data exists

### ✅ Task Management
- **Task list**: View all tasks with priority indicators and due dates
- **Toggle completion**: Mark tasks as done/undone
- **Priority badges**: Color-coded (Alta = red, Média/Baixa = gray)

### 💰 Financial Management
- **Invoices**: Track pending and paid invoices
- **Expenses**: Log and monitor business expenses
- **Local persistence**: All data saved to browser local storage

### ⚙️ Settings
- **🌐 Multi-language**: English, Português, Español (i18next)
- **💾 Data management**: Export or clear all data
- **UI customization**: Collapsible sidebar, dark theme

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x

### Run in Development Mode
```bash
# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```
The app will be available at **http://localhost:5173/**.

### Build for Production
```bash
# Build the web app
npm run build

# Build the Electron desktop app
npm run electron:build
```

### Run Electron Desktop App
```bash
npm run electron:dev
```

---

## 🗂️ Project Structure

```
Zenith/
├── src/                       # React source code
│   ├── App.tsx                # Main app component with sidebar & routing
│   ├── main.tsx               # Entry point
│   ├── types.ts               # TypeScript interfaces
│   ├── i18n.ts                # Internationalization setup
│   ├── locales.ts             # Translation strings (en, pt, es)
│   ├── index.css              # Global styles + Tailwind
│   ├── context/
│   │   └── CRMContext.tsx      # Global state (React Context + localStorage)
│   └── components/
│       ├── Dashboard.tsx       # Main dashboard view
│       ├── Kanban.tsx          # Kanban sales pipeline
│       ├── Customers.tsx       # Customer/account management
│       ├── TasksView.tsx       # Task management
│       ├── Financial.tsx       # Invoices & expenses
│       ├── Settings.tsx        # Application settings
│       └── Modal.tsx           # Reusable modal component
├── electron/
│   └── main.js                # Electron main process
├── public/                    # Static assets (favicon, icons)
├── dist/                      # Built web output (gitignored)
├── dist-electron/             # Electron build output
├── @zenith/
│   └── zenith.db            # Local SQLite database (legacy)
├── package.json               # Project configuration
├── vite.config.ts             # Vite bundler configuration
├── index.html                 # HTML entry point
├── tsconfig*.json             # TypeScript configuration
└── eslint.config.js           # ESLint configuration
```

---

## 🧩 Components Overview

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `App.tsx` | Root layout with sidebar navigation | `activeTab`, `isSidebarCollapsed` |
| `Dashboard` | Metrics cards, chart, target meter, tasks | `onNavigate` callback |
| `Kanban` | Three-column deal pipeline (drag-free) | Deals from CRMContext |
| `Customers` | Company list + detail view | Accounts from CRMContext |
| `TasksView` | Task list with completion toggles | Tasks from CRMContext |
| `Financial` | Invoices + expenses management | Invoices/Expenses from CRMContext |
| `Settings` | Language picker, data controls | `i18n`, `clearData` |
| `Modal` | Animated overlay modal | `isOpen`, `onClose`, `title` |

---

## 🌐 Internationalization

Zenith supports **3 languages** via i18next:

| Language | Code | Key |
|----------|------|-----|
| English | `en` | Default |
| Português | `pt` | Brazilian Portuguese |
| Español | `es` | Spanish |

Switch languages in **Settings → Language**.

---

## 💾 Data Architecture

- **Storage**: All CRM data is persisted in the browser's **localStorage**
- **State management**: React Context (`CRMContext.tsx`) with localStorage sync
- **Data entities**:
  - `accounts` — Companies/leads with name, industry, website
  - `deals` — Sales opportunities with title, value, stage, linked account
  - `tasks` — To-do items with title, due date, priority, completion
  - `invoices` — Financial invoices with amount, date, status
  - `expenses` — Business expenses with title, amount, date

### Available Actions (via `useCRM()` hook)

```typescript
const {
  accounts, deals, tasks, invoices, expenses,
  addAccount, deleteAccount,
  addDeal, updateDealStatus,
  addTask, toggleTask,
  addInvoice, deleteInvoice,
  addExpense, deleteExpense,
  loadDemoData, clearData
} = useCRM();
```

### Demo Data
Click **Settings → Load Demo Data** to populate with sample companies and deals. The built-in demo creates:
- 2 sample companies (Acme Corp, Globex Inc)
- 2 sample deals with values
- 3 sample tasks with priorities
- 2 invoices + 2 expenses

---

## 💻 Development

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite 8** | Build tool & dev server |
| **Electron** | Desktop wrapper |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion 12** | Animations |
| **Lucide React** | Icon library |
| **i18next** | Internationalization |

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run electron:dev` | Start Electron + Vite in development |
| `npm run electron:build` | Build Electron desktop installer |

### Key Dependencies

```json
{
  "react": "^19.2.6",
  "framer-motion": "^12.40.0",
  "i18next": "^26.2.0",
  "lucide-react": "^1.16.0",
  "tailwindcss": "^4.3.0",
  "electron": "^42.2.0",
  "vite": "^8.0.12"
}
```

---

## 🔧 Configuration

### `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',  // Important for Electron file:// loading
})
```

### `configuration_settings.json`
```json
{
  "settings": {
    "appName": "Hallways",
    "version": "1.0.0",
    "themeColor": "#007bff"
  },
  "database": {
    "connectionString": "sqlite:///hallways.db",
    "autoMigrate": true
  }
}
```

---

## 🧪 Demo Credentials (Legacy Backend)

> ⚠️ The original Python FastAPI authentication backend has been replaced with an offline-first architecture. These credentials are kept for reference.

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Sales Manager | `sales_manager` | `password123` |
| Sales Rep 1 | `sales_rep1` | `password123` |
| Sales Rep 2 | `sales_rep2` | `password123` |

---

## 📚 Legacy API Reference

> The following API endpoints existed in the original Python FastAPI backend. The current Electron app uses localStorage instead.

### Authentication
```bash
POST /api/auth/register    # Create new user
POST /api/auth/login       # Login
GET /api/users             # List users
```

### Tags & Segmentation
```bash
POST /api/tags                   # Create tag
GET /api/tags                    # List tags
POST /api/accounts/{id}/tags/{id} # Tag account
GET /api/tags/{id}/accounts      # Get tagged accounts
```

### Documents/Attachments
```bash
POST /api/attachments       # Upload file
GET /api/attachments        # List files
DELETE /api/attachments/{id} # Delete file
```

### Workflows & Automation
```bash
POST /api/workflows              # Create workflow
GET /api/workflows               # List workflows
POST /api/workflows/{id}/execute # Execute workflow
GET /api/workflows/{id}/logs     # View logs
```

### Legacy Database Tables
- `users`, `tags`, `account_tags`, `contact_tags`, `deal_tags`
- `attachments`, `workflows`, `workflow_rules`, `workflow_logs`
- Original tables: `accounts`, `contacts`, `deals`, `tasks`, `products`, `invoices`, `expenses`, `notes`, `events`

---

## 🔮 Roadmap

### Short-term
- [ ] Email integration and templates
- [ ] Import/export (CSV, JSON)
- [ ] Advanced reporting with custom filters
- [ ] Real-time dashboard updates

### Medium-term
- [ ] Mobile app support (PWA)
- [ ] Third-party integrations (Zapier, Make)
- [ ] AI-powered lead scoring
- [ ] Custom field definitions

### Long-term
- [ ] Calendar sync (Google, Outlook)
- [ ] Payment processing integration
- [ ] Multi-user synchronization
- [ ] Predictive analytics

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| App doesn't start | Run `npm install` to ensure dependencies |
| No data showing | Go to Settings → Load Demo Data |
| Language not changing | Check `i18n.ts` configuration |
| Electron app blank | Ensure `vite.config.ts` has `base: './'` |
| Build fails | Delete `node_modules` and `package-lock.json`, re-run `npm install` |

---

## 📄 License

**Zenith CRM** — All rights reserved.

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev), [Vite](https://vitejs.dev), and [Electron](https://www.electronjs.org/)
- UI powered by [Tailwind CSS](https://tailwindcss.com/) and [Framer Motion](https://www.framer.com/motion/)
- Icons by [Lucide](https://lucide.dev/)
- i18n by [i18next](https://www.i18next.com/)

---

<div align="center">
  <p><strong>Hallways CRM</strong> — Manage your business, anywhere.</p>
  <p>
    <a href="http://localhost:5173/">Local Dev Server</a> ·
    <a href="https://github.com/yourusername/zenith">GitHub</a>
  </p>
</div>