# Plan — Multi-user sales tracker on Lovable Cloud (Supabase)

Goal: replace the localStorage store with Supabase. Each agent (e.g. אוראל, יפעת) signs up with email + password, owns their own sales rows, and exports only their own monthly Excel report. Strict per-user isolation enforced by RLS.

## 1. Enable Lovable Cloud

Action: call `supabase--enable`. This provisions Postgres + Auth + the generated clients (`@/integrations/supabase/client`, `client.server`, `auth-middleware`, `auth-attacher`) and injects env vars (`VITE_SUPABASE_*`, `SUPABASE_*`). No external account needed.

## 2. Database schema (one migration)

### `profiles` table — Hebrew display name per user
```
id            uuid  PK, FK -> auth.users(id) ON DELETE CASCADE
display_name  text  NOT NULL
created_at    timestamptz default now()
updated_at    timestamptz default now()
```
- RLS ON.
- Policies: `select` = `auth.uid() = id`; `update` = `auth.uid() = id`; `insert` = `auth.uid() = id`.
- Trigger `handle_new_user()` on `auth.users` (AFTER INSERT) creates a profile, defaulting `display_name` from `raw_user_meta_data->>'display_name'` (sent at signup), falling back to the email local-part.
- `updated_at` trigger.

### `sales` table — replaces localStorage
```
id            uuid  PK default gen_random_uuid()
user_id       uuid  NOT NULL, FK -> auth.users(id) ON DELETE CASCADE
sale_date     date  NOT NULL
system_name   text  NOT NULL
system_price  numeric(12,2) NOT NULL CHECK (system_price >= 0)
commission    numeric(12,2) NOT NULL CHECK (commission   >= 0)
created_at    timestamptz default now()
updated_at    timestamptz default now()
```
- Index: `(user_id, sale_date desc)`.
- RLS ON. Four policies, all keyed on `auth.uid() = user_id`: `select`, `insert` (also `WITH CHECK`), `update`, `delete`.
- `updated_at` trigger.

### Naming note
Database uses snake_case (`sale_date`, `system_price`). The TS layer keeps camelCase. Map at the boundary in a small helper (`toSale` / `fromSale`).

## 3. Auth flow (email + password, self sign-up)

New routes (TanStack file-based):
- `src/routes/login.tsx` — public. Email + password. On success → redirect to `/`.
- `src/routes/signup.tsx` — public. Email + password + Hebrew display name. Calls `supabase.auth.signUp({ email, password, options: { data: { display_name }, emailRedirectTo: window.location.origin } })`.
- `src/routes/_authenticated.tsx` — pathless layout. `beforeLoad` redirects to `/login` if not signed in.
- Move `src/routes/index.tsx` → `src/routes/_authenticated/index.tsx` (the entire app lives behind auth).

Auth wiring:
- New `src/hooks/useAuth.ts`: subscribes to `supabase.auth.onAuthStateChange` FIRST, then calls `getSession()`. Exposes `user`, `session`, `loading`, `signOut()`.
- Wire router context so `_authenticated.beforeLoad` can read auth state, OR simply check `supabase.auth.getUser()` inside `beforeLoad` (simpler, no router-context refactor required).
- Header in `_authenticated/index.tsx`: show `שלום, {display_name}` + a "התנתק" button.

Email confirmation: in Lovable Cloud, leave "Confirm email" OFF for the MVP so agents can sign in immediately after signup. Document this for the user in chat (security trade-off).

## 4. Replace `useSales` with Supabase-backed CRUD

Rewrite `src/hooks/useSales.ts` to use TanStack Query against the browser Supabase client (RLS ensures it only ever returns the current user's rows — no `.eq('user_id', ...)` needed but include it as defense-in-depth):

- `useSalesQuery(year, month)` — `useQuery`, fetches sales for that month range (`sale_date >= start AND sale_date < nextMonthStart`).
- `useAddSale()` / `useUpdateSale()` / `useDeleteSale()` — `useMutation`, invalidate the month query on success. `addSale` injects `user_id: (await supabase.auth.getUser()).data.user!.id`.
- All mutations show `sonner` toasts on success/error (replaces the current `alert()` calls).
- Delete `localStorage` code path entirely.

Keep `src/types/sale.ts` types but switch `Sale` to match DB shape (or keep camelCase via mappers).

## 5. Per-user Excel export

`ExportButton.tsx` already exports the filtered month — keep the logic, change two things:
- File name: `מכירות-{display_name}-{YYYY}-{MM}.xlsx` (sanitize whitespace).
- Add a header row at top of the sheet: `דוח מכירות חודשי — {display_name} — {Hebrew month} {year}`.
- Source rows come from the same TanStack Query result, so RLS guarantees only the agent's own data is exportable.

## 6. UI polish that comes for free

- Loading skeleton in the table while the month query is in flight.
- Optimistic update on add/edit/delete (or just refetch on success — simpler and fine for MVP).
- Sign-out button in header.
- `<Toaster />` mounted once in `__root.tsx`.

## 7. Files touched

New:
- `src/routes/login.tsx`
- `src/routes/signup.tsx`
- `src/routes/_authenticated.tsx`
- `src/routes/_authenticated/index.tsx` (moved from `src/routes/index.tsx`)
- `src/hooks/useAuth.ts`
- `src/lib/sales-api.ts` (Supabase queries + DB↔TS mappers)
- One Supabase migration for the schema above.

Edited:
- `src/hooks/useSales.ts` → thin wrapper over TanStack Query mutations, OR delete and inline in `index.tsx`.
- `src/components/sales/ExportButton.tsx` → use display_name in filename + header.
- `src/routes/__root.tsx` → mount `<Toaster />`.

Deleted:
- All localStorage code in `useSales.ts`.

## 8. Out of scope (per your answers)

- No admin role / no admin dashboard.
- No Google sign-in.
- No team/workspace concept.
- No data migration from localStorage (each agent starts fresh; mention in chat if you want a one-time import button later).

## 9. Security checklist before shipping

- RLS enabled on `profiles` and `sales` (confirm via security scan).
- `service_role` key never imported in client code.
- All Supabase mutations called from the browser client — no need for `createServerFn` for this MVP.
- Email confirmation decision documented (off for MVP = faster onboarding, slightly weaker).
- Run `security--run_security_scan` after the migration applies.
