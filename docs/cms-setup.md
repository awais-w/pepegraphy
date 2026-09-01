# CMS setup and deployment

## One-time Supabase setup

1. Create a Supabase project for the environment.
2. In the SQL Editor, run `supabase/migrations/001_cms.sql` first. It creates the CMS tables, indexes, update-timestamp triggers, Row Level Security policies, and the public `site-media` bucket.
3. Run `supabase/seed.sql` second. It adds the baseline site content, categories, gallery metadata, and hero metadata. It does not create an Auth user or upload the bundled local images to Storage.
4. In **Authentication → Users**, create an email/password account for each CMS administrator. In this first version every authenticated user can write CMS rows and `site-media` objects, so only create accounts for trusted editors.
5. Verify that unauthenticated visitors can read visible content and public media, while anonymous writes are rejected.

The seed is safe to re-run for its intended baseline data: section and category rows are updated, and missing photo/hero rows are inserted. It intentionally does not overwrite existing media metadata or delete content and Storage objects created by editors.

## Local development

Copy `.env.example` to `.env.local` and provide the values from **Project Settings → API**:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run `npm install` and `npm run dev`, then use `/admin` to sign in. Without both variables, the public site continues using bundled fallback content and the admin route explains that the CMS is not configured.

## Production deployment

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting provider's build environment, then rebuild and deploy the Vite app. Configure the host to serve the single-page app at `/admin` as well as `/`.

Only the Supabase project URL and anon key may be exposed through Vite `VITE_` variables. Never place a service-role key, database password, personal access token, or any privileged secret in a Vite environment variable, client bundle, repository, or browser configuration. Use Supabase server-side tooling only for privileged maintenance tasks.

Before release, confirm the production project has the migration applied, the desired baseline seed data, at least one trusted Auth user, and the same RLS and Storage policies as the migration.

## Media and storage rules

The admin accepts browser-recognised image files only, with a maximum file size of 10 MB per file. Images are stored in the public `site-media` bucket under `hero/` or `gallery/`; the CMS stores their URL, alt text, visibility, and order. Keep uploads appropriately sized for web delivery and monitor the project's Supabase Storage quota and bandwidth usage.

Public reads are intentional for this portfolio. Authenticated users can upload, update, and delete objects in `site-media`; removing an editor's Auth account immediately prevents future client-side CMS writes.

## Release verification

Run these commands from the repository root before deployment:

```bash
npm test
npm run lint
npm run build
git diff --check
```

With a non-production test project and a seeded admin account, manually verify `/admin`: edit each content section; upload, reorder, and delete hero slides; create, rename, and delete a category; upload, edit, and delete a photo; refresh; and confirm the public route shows the saved changes. Also test keyboard-only controls and focus styles, a narrow viewport, empty hero/gallery states, and invalid or over-10-MB image uploads.
