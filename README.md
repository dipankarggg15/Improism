# Improism

Improism is a Next.js App Router prototype with Supabase authentication and an
initial PostgreSQL/RLS foundation.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:4000](http://localhost:4000).

## Commands

```bash
npm run dev    # Start the development server on port 4000
npm run build  # Create a production build
npm run start  # Start the production server on port 4000
npm run lint   # Run ESLint
npm run typecheck # Run TypeScript without emitting files
```

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and publishable
   key from **Project Settings → API**. Never put a secret/service-role key in
   a `NEXT_PUBLIC_` variable.
3. In **Authentication → URL Configuration**, set the Site URL to
   `http://localhost:4000` for local development and add these redirect URLs:

```text
http://localhost:4000/auth/callback
http://localhost:4000/auth/update-password
```

4. Link the Supabase CLI and apply the migration:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --remote
```

The migration creates profiles, subjects, subject selections, posts, articles,
and saved posts. It also enables RLS, creates ownership/admin policies, seeds
the initial subjects, and adds the new-user profile trigger.

The Admin CMS migration also creates the public `content-images` Storage bucket
with a 5 MB limit and JPG, PNG, WebP, and GIF allowlist. Public reads are
allowed, while inserts, updates, and deletes require an authenticated profile
whose role is `admin`. No service-role key is used by the application.

Email confirmation is enabled by default on hosted projects. For production,
configure custom SMTP in Supabase; the built-in email service is intended for
limited testing.

To grant the first content administrator, run this in the Supabase SQL editor
after that user has signed up:

```sql
begin;

-- The role guard intentionally blocks ordinary sessions. Disable it only for
-- this one project-owner bootstrap transaction; any error rolls this back.
alter table public.profiles disable trigger profiles_protect_role;

update public.profiles
set role = 'admin'
where id = 'USER_UUID';

alter table public.profiles enable trigger profiles_protect_role;
commit;
```

After promotion, that account can open `/admin`. The route performs a server
authorization check, every mutation repeats the check, and PostgreSQL RLS plus
Storage policies provide the final database boundary. A regular account is
redirected away from `/admin` and cannot write content even by calling the
Supabase API directly.

## Admin CMS workflows

- Dashboard counts posts (excluding article backing rows), articles, drafts,
  published content, and subject assignments.
- Posts support draft, publish, unpublish, archive, subject assignment, optional
  images, search/filter, full preview, and a live mobile preview while editing.
- Articles use a deliberately small rich-text toolbar and the same publication
  and media lifecycle.
- Subjects can be created, edited, activated/deactivated, and given an image.
- Archive is a status transition, so foreign-key relationships are preserved.

Apply all migrations before using the CMS:

```bash
npx supabase db push --remote
```

## Database tests

With Docker running and the Supabase CLI available:

```bash
npx supabase start
npx supabase db reset
npx supabase test db
```

The structural RLS test is in `supabase/tests/backend_foundation_test.sql`.
