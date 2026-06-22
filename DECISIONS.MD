## Auth: turned off "Confirm email" (dev only)

Turned off Confirm email under Authentication -> Sign In / Providers -> Email in Supabase.

Why: with it on, every signup needs a confirmation link clicked before you can log in, that gets annoying fast when I'm testing the signup/login flow repeatedly during development.

Trade-off: right now anyone can sign up with a fake or unverified email address.
TODO before release: turn Confirm email back ON before shipping a real build.


## Categories & transactions: RLS policy shape

Used a single `for all` policy on both `categories` and `transactions` instead of separate select/update policies like I did on `profiles`.

Why: these tables need full CRUD (create, read, update, delete) by the owner, so one `for all` policy with `using` + `with check` covers it in one line instead of four.

`using` controls which existing rows you can touch; `with check` controls what a row is allowed to look like after an insert/update — together they stop you reading someone else's data and stop you faking a row with someone else's `user_id`.

## Deleting a category doesn't delete its transactions

`transactions.category_id` references `categories.id` with `on delete set null`, not `on delete cascade`.

Why: if I delete a category, I don't want to silently wipe every transaction that used it. With `set null`, those transactions just lose their category tag and become "uncategorized" — history stays intact.

Trade-off: I need to handle a `null` category_id gracefully in the UI (e.g. show "uncategorized" instead of crashing or showing blank).

## Auto-updating `updated_at` with a trigger

Added a `before update` trigger (`transactions_set_updated_at`) that sets `updated_at = now()` on every edit, instead of setting it manually from the app each time.

Why: this way `updated_at` is always correct no matter what — even if I forget to set it in some update call, or update the row directly from the SQL editor while debugging. The database guarantees it instead of relying on me to remember.


## Shipping the anon key in the app is safe

Put the Supabase anon key directly in the app's env config, not treated as a secret.

Why: the anon key is designed to be shipped inside client apps — it's not actually a credential that grants access on its own. It only lets you do whatever your RLS policies allow, nothing more. That's exactly why getting RLS right (Steps 0–above) mattered so much: the database is what protects each user's data, not the key.

Important distinction: the service_role key is completely different — it bypasses RLS entirely and can read/write anything. That one must never go in the app or get committed to Git. Only the anon key belongs in client code.

## Navigation: `unstable_settings` and `initialRouteName`

Set `initialRouteName: 'index'` in `unstable_settings` at the root layout.

Why: if someone opens the app from a deep link (e.g. tapping a notification that goes straight to a transaction screen), there's no navigation history yet. This tells Expo Router to treat `index` as the screen that lives "behind" whatever screen was opened directly — so the back button has somewhere sensible to go instead of just closing the app.

Note: the `unstable_` prefix doesn't mean broken. It just means Expo hasn't committed to the final name for this API yet. It works fine as-is.



## Provider nesting order in `_layout.tsx`

The five providers in `RootLayout` are nested in a specific order because each one depends on what's outside it. A provider can only consume things that wrap it, never things inside it.

```tsx
<SafeAreaProvider>      // 1. measures screen edges — no dependencies
  <ThemeProvider>       // 2. needs safe area for themed components
    <ReduxProvider>     // 3. no dependencies, but React Query needs it for filters
      <QueryClientProvider> // 4. needs Redux (passes filter state into queries)
        <SessionProvider>   // 5. needs all of the above — clears cache on logout,
          <App />           //    redirects based on theme, respects safe area
        </SessionProvider>
      </QueryClientProvider>
    </ReduxProvider>
  </ThemeProvider>
</SafeAreaProvider>
```

**Why this exact order:**

`SafeAreaProvider` is outermost because it has no dependencies of its own — it just measures the screen. Everything else potentially needs those measurements for layout.

`ThemeProvider` comes next because the navigation shell (`RootLayoutNav`) needs it immediately — it reads `isDark` to pass the right theme to React Navigation. If it were inside `ReduxProvider`, that would work too, but theme is the most "global" thing after layout so it sits high.

`ReduxProvider` sits above `QueryClientProvider` because React Query hooks inside screens read Redux state (search text, filters) to build their Supabase queries. Redux has to exist before React Query tries to read from it.

`QueryClientProvider` wraps `SessionProvider` because on logout, `SessionProvider` needs to call `queryClient.clear()` to wipe cached data. That means `SessionProvider` has to be inside `QueryClientProvider` to have access to the client.

`SessionProvider` is the innermost because it depends on everything above it — it reads the theme, dispatches to Redux, clears the React Query cache, and respects safe area. The actual app screens sit inside it so they only render once a session state is known (logged in or logged out).

Trade-off: this nesting means if I ever need to refactor one provider, I have to think about what depends on it from below. The upside is that every screen in the app has access to all five layers without any extra wiring.