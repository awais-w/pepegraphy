# Pepegraphy

Photography portfolio built with React and Vite. It can run with bundled content by default or use Supabase as its shared CMS.

## Local development

```bash
npm install
npm run dev
```

## Supabase CMS setup

1. Create a project in [Supabase](https://supabase.com/dashboard), then open its SQL Editor.
2. Run [`supabase/migrations/001_cms.sql`](supabase/migrations/001_cms.sql) to create the CMS tables, indexes, policies, and `site-media` Storage bucket.
3. Run [`supabase/seed.sql`](supabase/seed.sql) to add the current site content, categories, gallery photos, and hero slides.
4. In **Authentication → Users**, create the first user. Authenticated users are allowed to manage CMS rows and objects in `site-media`.
5. Copy `.env.example` to `.env.local`, then copy the project URL and anon key from **Project Settings → API** into the corresponding `VITE_` variables.
6. Start the app with `npm run dev`.

The anon key is intended for browser use; do not add the service-role key to a Vite environment file.
