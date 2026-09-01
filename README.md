# Pepegraphy

Photography portfolio built with React and Vite. It can run with bundled content by default or use Supabase as its shared CMS.

## Local development

```bash
npm install
npm run dev
```

## Supabase CMS setup

1. Create a Supabase project and run [`supabase/migrations/001_cms.sql`](supabase/migrations/001_cms.sql) in its SQL Editor.
2. Run [`supabase/seed.sql`](supabase/seed.sql) after the migration to create the baseline public content and media metadata.
3. Create an email/password user in **Authentication → Users**. Any authenticated user can administer this first-version CMS.
4. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**.
5. Start the app with `npm run dev` and sign in at `/admin`.

Only the project URL and anon key belong in `VITE_` variables. Never expose a service-role key in the Vite app, commit it to the repository, or add it to a client-side hosting environment.

See [CMS setup and deployment](docs/cms-setup.md) for the production checklist, storage rules, reseeding behaviour, and verification steps.
