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