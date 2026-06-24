# Ledger

A personal expense tracker built with Expo + React Native + TypeScript.
A user signs in, records income and expenses (each with a category, date, note,
and optional receipt photo), sees them in a searchable list, and gets a daily
**push reminder** to log their spending — delivered even when the app is closed.

> The focus is on doing the everyday things cleanly: navigation, server data,
> deliberate state placement, forms, and notifications.

## Tech stack

| Concern | Tool |
| --- | --- |
| App | Expo (SDK 54) · React Native · TypeScript (strict, no `any`) |
| Navigation | Expo Router (groups, tabs, nested stacks, modals, dynamic routes, deep links) |
| Server data | TanStack Query (React Query) |
| App UI state | Redux Toolkit (search + filters) |
| App-wide settings | React Context (theme, session) |
| Forms | React Hook Form + zod |
| Date / photo | `@react-native-community/datetimepicker` · `expo-image-picker` |
| Notifications | `expo-notifications` + `expo-device` on the device · Expo Push API → FCM · a Supabase Edge Function on a `pg_cron` schedule (server-sent reminders) |
| Backend | Supabase (auth + Postgres + storage + RLS + Edge Functions) |

## Prerequisites

- Node.js (LTS) and npm
- A [Supabase](https://supabase.com) project (free tier is fine)
- For most of the app: an iOS/Android emulator or the [Expo Go](https://expo.dev/go) app
- **For push notifications:** a **development build on a real device** — Expo Go
  cannot receive push since SDK 53 — plus a Firebase project (FCM) and the
  [Supabase CLI](https://supabase.com/docs/guides/cli). See
  [Push notifications](#push-notifications-server-sent-reminders) below.

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
   hiding this key. After editing `.env`, restart Metro with `npx expo start -c`
   so the new values are picked up.

3. **Set up the backend (Supabase)**

   In the Supabase dashboard:
   - Enable email sign-in (Authentication → Providers → Email).
   - Run the project SQL to create the `profiles`, `categories`, and
     `transactions` tables, their row-level-security policies, and the
     signup/`updated_at` triggers.
   - The `profiles` table also holds the reminder fields used by push:
     `push_token`, `reminder_enabled`, `reminder_hour`, `reminder_minute`,
     `timezone`, `last_reminder_sent_on`.
   - Create a **private** storage bucket named `receipts` and add its
     per-user access policies.

   See [DECISIONS.md](./DECISIONS.md) for why things are set up this way.

## Running the app

```bash
npx expo start --dev-client   # open in your development build
npx expo start -c             # clears the Metro cache (use after editing .env)
```

> The expense-tracking features run in Expo Go or an emulator, but **push
> notifications require a development build on a real device** (see below).

## Push notifications (server-sent reminders)

The daily reminder is sent from the **backend**, not scheduled on the device, so
it arrives even when the app has been swiped away — on-device alarms are killed
by aggressive Android battery managers, but a server push (Expo → FCM) is not.

Setup, once:

1. **FCM (Firebase):** create a Firebase project, add an Android app with your
   package name, and download `google-services.json` into the repo root
   (`app.json` points at it via `android.googleServicesFile`). Then upload the
   FCM **service-account key** to EAS so Expo can deliver to FCM:
   ```bash
   eas credentials   # Android → Google Service Account → FCM V1 key
   ```
2. **Build & install** a development (or preview) build on a real device:
   ```bash
   eas build --profile development --platform android
   ```
3. **Deploy the Edge Function** (`supabase/functions/send-reminders`) with its
   secrets:
   ```bash
   supabase secrets set CRON_SECRET=<random-string> --project-ref <ref>
   supabase secrets set EXPO_ACCESS_TOKEN=<expo-token> --project-ref <ref>
   supabase functions deploy send-reminders --no-verify-jwt --project-ref <ref>
   ```
4. **Schedule it** in the Supabase SQL editor so it runs every 15 minutes:
   ```sql
   create extension if not exists pg_cron;
   create extension if not exists pg_net;
   select cron.schedule('send-reminders', '*/15 * * * *', $$
     select net.http_post(
       url     := 'https://<ref>.supabase.co/functions/v1/send-reminders',
       headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<random-string>'),
       body    := '{}'::jsonb
     );
   $$);
   ```

How it flows: the app stores the device's Expo push token on the user's profile,
the user picks a reminder time (saved with their timezone), and the cron-driven
function pushes to anyone whose local time has come due (once per day).

## Project structure

```
app/                      Routes (Expo Router) — the "pages"
  (auth)/                 Logged-out: login, signup, forgot-password
  (app)/(tabs)/           Logged-in tab bar
    transactions/         List · [id] detail · [id]/edit
    settings/             index · appearance (theme) · notifications (reminder)
  (modals)/               add-transaction (modal pop-up)
  transaction/[id].tsx    Deep-link target (ledger://transaction/<id>)

components/               Atomic Design layers
  atoms/                  Button, Input, Spinner (+ themed Text/View)
  molecules/              Field, ControlledField, CategoryChip, Brand,
                          Loading, EmptyState, ErrorState
  organisms/              TransactionRow, TransactionForm, CategoryFilter
  templates/              ScreenLayout
hooks/                    useTransactions, useCategories, useTransactionMutations,
                          useReminderSettings, usePushRegistration,
                          useNotificationTapHandler
lib/                      supabase client, React Query client, query keys,
                          types, logger, format, notifications
  api/                    Supabase access: transactions, categories, storage,
                          profiles, reminders
constants/                Theme tokens (colors, spacing, radius)
context/                  React Context: ThemeContext, SessionContext
store/                    Redux Toolkit store + filtersSlice + typed hooks
supabase/
  functions/send-reminders/   Edge Function that sends the daily push (Deno)
```

## State, at a glance

- **React Query** owns server data (transactions, categories, and the reminder
  settings on the profile) — the single source of truth, never copied elsewhere.
- **Redux Toolkit** owns the app's own UI state (search text, active filters).
- **React Context** owns app-wide settings (theme, session).
- Small, local UI state stays in the component with `useState`.

## Scripts

```bash
npm run start     # expo start
npm run ios       # expo start --ios
npm run android   # expo start --android
npm run web       # expo start --web
npx tsc --noEmit  # type-check
```
