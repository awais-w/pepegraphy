# Pepegraphy

Photography portfolio built with React and Vite. It can run with bundled content by default or use Supabase as its shared CMS.

## Local development

```bash
npm install
npm run dev
```

## Supabase CMS setup

1. In **Authentication → Configuration → General**, disable **Allow new users to sign up** and **Allow anonymous sign-ins**.
2. Run [`supabase/migrations/001_cms.sql`](supabase/migrations/001_cms.sql), then [`supabase/migrations/002_cms_admin_allowlist.sql`](supabase/migrations/002_cms_admin_allowlist.sql), in the Supabase SQL Editor.
3. Run [`supabase/seed.sql`](supabase/seed.sql) to create the baseline public content and media metadata.
4. Create the single email/password administrator in **Authentication → Users**, then add its `auth.users.id` to `public.admin_users`. Only allowlisted users can administer the CMS.
5. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**.
6. Start the app with `npm run dev` and sign in at `/admin`. See [the CMS setup checklist](docs/cms-setup.md) for the allowlist SQL and release verification.

Only the project URL and anon key belong in `VITE_` variables. Never expose a service-role key in the Vite app, commit it to the repository, or add it to a client-side hosting environment.

See [CMS setup and deployment](docs/cms-setup.md) for the production checklist, storage rules, reseeding behaviour, and verification steps.
