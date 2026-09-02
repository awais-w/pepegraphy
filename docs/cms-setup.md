# CMS setup and deployment

## One-time Supabase setup

1. Create a Supabase project for the environment.
2. In **Authentication → Configuration → General**, turn off **Allow new users to sign up** and **Allow anonymous sign-ins**. This CMS has no public account-registration flow; create administrators only from the Supabase dashboard or trusted server-side tooling.
3. In the SQL Editor, run `supabase/migrations/001_cms.sql` and then `supabase/migrations/002_cms_admin_allowlist.sql`. The second migration is required for an existing project that previously ran `001_cms.sql`; it replaces the original broad authenticated policies.
4. Run `supabase/seed.sql`. It adds the baseline site content, categories, gallery metadata, and hero metadata. It does not create an Auth user or upload the bundled local images to Storage.
5. In **Authentication → Users**, create an email/password account for the single CMS administrator. Then allowlist that account in the SQL Editor, replacing the example address:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users
   where email = 'admin@example.com'
   on conflict (user_id) do nothing;
   ```

   `admin_users` is intentionally RLS-protected with no browser policies. Only project owners or trusted server-side maintenance tooling may change the allowlist.
6. Verify while signed out that visitors can read only visible content and public media. Verify that the allowlisted administrator can read hidden rows and change `is_visible`, while a non-allowlisted authenticated account cannot read or write CMS rows or `site-media` objects.

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

Before release, confirm the production project has both migrations applied, the desired baseline seed data, exactly the intended administrator in `public.admin_users`, and the same RLS and Storage policies as the migrations. Re-check that **Allow new users to sign up** and **Allow anonymous sign-ins** are disabled.

## Media and storage rules

The admin accepts browser-recognised image files only, with a maximum file size of 10 MB per file. Images are stored in the public `site-media` bucket under `hero/` or `gallery/`; the CMS stores their URL, alt text, visibility, and order. Keep uploads appropriately sized for web delivery and monitor the project's Supabase Storage quota and bandwidth usage.

Public reads are intentional for this portfolio. Only an authenticated user whose `auth.uid()` is listed in `public.admin_users` can read through the authenticated Storage API or upload, update, and delete objects in `site-media`. Removing an allowlist row immediately prevents future client-side CMS reads and writes; removing the Auth account also removes its allowlist row through the foreign key.

## Release verification

Run these commands from the repository root before deployment:

```bash
npm test
npm run lint
npm run build
git diff --check
```

With a non-production test project and a seeded admin account, manually verify `/admin`: edit each content section; upload, reorder, and delete hero slides; create, rename, and delete a category; upload, edit, and delete a photo; refresh; and confirm the public route shows the saved changes. Also test keyboard-only controls and focus styles, a narrow viewport, empty hero/gallery states, and invalid or over-10-MB image uploads.
