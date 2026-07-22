<div align="center">

# 💰 Varo — Personal Finance Tracker

**Clear finances, smarter decisions.**

Built with Next.js 16, React 19, Supabase and Tailwind CSS v4.

</div>

---

## Overview

Varo is a personal finance web app for tracking income, expenses, recurring transactions, and savings goals. It's built as an installable PWA with a polished, animated UI, light/dark/system theming, and Google sign-in via Supabase.

## ✨ Features

- **Google authentication** — secure sign-in powered by Supabase Auth (OAuth).
- **Transactions** — add, edit, and delete income/expense entries with categories, custom colors, and icons.
- **Recurring transactions** — daily/weekly/monthly recurrence with flexible end conditions (date, number of occurrences, or never), plus scoped edits/deletes (*this one*, *this and following*, *all*).
- **Savings boxes** — dedicated savings goals with initial amount, growth rate, optional limit, and the option to include/exclude them from your total balance.
- **Monthly overview** — balance, income, and expense summary cards with a month/year selector.
- **Multi-currency support** with automatic detection of your most-used currency.
- **Light / Dark / System theme** with automatic OS preference detection.
- **Installable PWA** with manifest, app icons, and standalone display mode.
- **Mobile-first UX** — pull-to-refresh gesture, safe-area aware layout, and animated UI (GSAP, OGL/WebGL backgrounds).

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) |
| Backend / Auth / DB | [Supabase](https://supabase.com) (`@supabase/ssr`, `@supabase/supabase-js`) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| UI Primitives | [Radix UI](https://www.radix-ui.com), [shadcn](https://ui.shadcn.com) |
| Icons | [Phosphor Icons](https://phosphoricons.com) |
| Charts | [Recharts](https://recharts.org) |
| Animation / Graphics | [GSAP](https://gsap.com), [OGL](https://github.com/oframe/ogl), [Three.js](https://threejs.org) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) |
| Dates | [date-fns](https://date-fns.org), [react-day-picker](https://daypicker.dev) |

> ⚠️ **Note:** This project uses a customized/experimental version of Next.js. Check `node_modules/next/dist/docs/` for framework-specific conventions before making changes to routing, data fetching, or build configuration.

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router (pages, layout, PWA manifest, auth callback)
├── components/
│   ├── features/         # App-specific components (FinanceApp, LoginPage, modals, etc.)
│   └── ui/               # Reusable UI primitives and visual effects (Beams, DarkVeil, buttons...)
├── hooks/                # Custom React hooks (reveal-on-mount, modal motion)
├── lib/
│   ├── supabase/         # Supabase client/server/middleware setup
│   └── motion.js         # Animation helpers
└── utils/                # Formatting helpers, constants, category config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ (recommended: latest LTS)
- A [Supabase](https://supabase.com) project with **Google OAuth** enabled

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the app for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |

## 📄 License

This project is private and not licensed for public distribution.
