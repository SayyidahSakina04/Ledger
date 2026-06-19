# Ledger

A personal expense tracker built with Expo + React Native + TypeScript.
A user signs in, records income and expenses (each with a category, date, note,
and optional receipt photo), sees them in a searchable list, and gets a daily
reminder to log their spending.

> This is a course final project. The emphasis is on doing the everyday things
> cleanly — navigation, server data, state placement, forms, and notifications.

## Tech stack

| Concern | Tool |
| --- | --- |
| App | Expo (SDK 54) · React Native · TypeScript (strict, no `any`) |
| Navigation | Expo Router (groups, tabs, nested stacks, modals, dynamic routes, deep links) |
| Server data | TanStack Query (React Query) |
| App UI state | Redux Toolkit (search + filters) |
| App-wide settings | React Context (theme, currency, session) |
| Forms | React Hook Form + zod |
| Date / photo | `@react-native-community/datetimepicker` · `expo-image-picker` |
| Notifications | `expo-notifications` |
| Backend | Supabase (auth + Postgres + storage + row-level security) |

## Prerequisites

- Node.js (LTS) and npm
- The [Expo Go](https://expo.dev/go) app on a phone, or an iOS/Android emulator
- A [Supabase](https://supabase.com) project (free tier is fine)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy the example file and fill in your Supabase values
   (Supabase dashboard → Project Settings → API):

   ```bash
   cp .env.example .env
   ```

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```

   `.env` is git-ignored. Use the **anon / public** key (never the
   `service_role` key) — the app is protected by row-level security, not by
   hiding this key.

3. **Set up the backend (Supabase)**

   In the Supabase dashboard:
   - Enable email sign-in (Authentication → Providers → Email).
   - Run the project SQL to create the `profiles`, `categories`, and
     `transactions` tables, their row-level-security policies, and the
     signup/`updated_at` triggers.
   - Create a **private** storage bucket named `receipts` and add its
     per-user access policies.

   See [DECISIONS.md](./DECISIONS.md) for why things are set up this way.

## Running the app

```bash
npx expo start        # then press i / a, or scan the QR with Expo Go
npx expo start -c     # same, but clears the Metro cache (use after editing .env)
```

## Project structure

```
app/                      Routes (Expo Router). These are the "pages".
  (auth)/                 Logged-out flow: login, signup, forgot-password
  (app)/(tabs)/           Logged-in tab bar
    transactions/         List, [id] detail, [id]/edit
    settings/             index, appearance (theme), notifications
  (modals)/               add-transaction (modal pop-up)
  transaction/[id].tsx    Deep-link target (ledger://transaction/<id>)

components/               Atomic Design layers
  atoms/                  Button, Input, Spinner (+ themed Text/View)
  molecules/              Field, Loading, EmptyState, ErrorState
  templates/              ScreenLayout
constants/                Theme tokens (colors, spacing, radius)
context/                  React Context: ThemeContext, SessionContext
store/                    Redux Toolkit store + slices + typed hooks
lib/                      supabase client, React Query client
```

## State, at a glance

- **React Query** owns server data (transactions, categories) — the single
  source of truth. It is never copied into Redux or Context.
- **Redux Toolkit** owns the app's own UI state (search text, active filters).
- **React Context** owns app-wide settings (theme, currency, session).
- Small, local UI state stays in the component with `useState`.

## Scripts

```bash
npm run start     # expo start
npm run ios       # expo start --ios
npm run android   # expo start --android
npm run web       # expo start --web
npx tsc --noEmit  # type-check
```

## Status / roadmap

- [x] **Step 0** — Supabase backend (auth, tables, RLS, storage)
- [x] **Step 1** — Navigation, state layers, Atomic Design components, theming
- [ ] **Step 2** — Sign-in & login-gated routes
- [ ] **Step 3** — Loading & saving data with React Query
- [ ] **Step 4** — Transactions list (FlatList)
- [ ] **Step 5** — Add / edit form
- [ ] **Step 6** — Push notifications
