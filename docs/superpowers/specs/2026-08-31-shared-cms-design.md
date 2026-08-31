# Shared CMS for Pepegraphy

## Goal

Add a browser-based admin interface backed by Supabase so an authenticated administrator can update the public photography site without editing source code. Changes must be shared across visitors and must cover site text, photo categories and photos, and the hero carousel images.

## Scope

### In scope

- An `/admin` route with email/password authentication.
- Editable structured content for the existing public sections: navigation, hero, about, specialities, booking, contact, and footer.
- Hero carousel image management: upload, replace, remove, reorder, alt text, and caption.
- Gallery category management: create, rename, delete, and reorder categories.
- Gallery photo management: upload into a category, replace, remove, reorder, and edit alt text.
- Public read access to published content and private write access to authenticated administrators through Supabase Row Level Security.
- Image files stored in Supabase Storage; metadata and ordering stored in Postgres.
- A local bundled-content fallback so the public site still renders if Supabase is unavailable.

### Out of scope for the first version

- Multiple editorial roles or approval workflows.
- Draft/preview/publish history.
- Rich text editing, beyond the text fields already needed by the site.
- Image transformations or external CDN configuration.
- Automated migration of future arbitrary site sections.

## Architecture

The Vite React app will initialize a small content service layer. The public components consume a normalized content model rather than importing gallery data directly. The service loads Supabase content at startup and merges it with the existing bundled data as a fallback. Admin mutations write through the same service layer and update local React state after successful persistence.

Supabase will provide:

- Auth: email/password sign-in for the admin route.
- Postgres: `site_content`, `gallery_categories`, `gallery_photos`, and `hero_slides` tables.
- Storage: a private-to-writes, public-read `site-media` bucket for uploaded images.
- RLS: anonymous users can select published/public rows; only authenticated users can insert, update, delete, or reorder content.

The app will use environment variables for the Supabase URL and anon key. No service-role key will be shipped to the browser.

## Data model

`site_content`

- `key` (text primary key): stable section identifier such as `hero` or `about`.
- `content` (jsonb): field values for the section.
- `updated_at` (timestamptz).

`hero_slides`

- `id` (uuid primary key).
- `image_url` (text).
- `alt_text` (text).
- `caption` (text, nullable).
- `sort_order` (integer).
- `is_visible` (boolean).
- `created_at`, `updated_at`.

`gallery_categories`

- `id` (uuid primary key).
- `slug` (text unique).
- `name` (text).
- `sort_order` (integer).
- `is_visible` (boolean).
- `created_at`, `updated_at`.

`gallery_photos`

- `id` (uuid primary key).
- `category_id` (uuid foreign key).
- `image_url` (text).
- `alt_text` (text).
- `sort_order` (integer).
- `is_visible` (boolean).
- `created_at`, `updated_at`.

The existing `all` gallery filter remains a UI-only aggregate and is not stored as a category.

## Admin experience

The admin is a dedicated route with a sign-in screen and a simple sidebar/tab navigation for Content, Hero carousel, and Gallery. Content uses labeled inputs grouped by public section. Hero and gallery use image cards with preview, alt text, visibility, ordering controls, and destructive actions that require confirmation. Uploads show progress and validation errors; supported formats are common browser image types and oversized files are rejected with an actionable message.

All interactive controls have visible labels, keyboard access, focus states, and status feedback. Reordering will use explicit move controls rather than relying only on drag-and-drop.

## Public data flow

1. App starts with the current bundled data as an immediate renderable fallback.
2. Content service requests public Supabase rows.
3. Successful responses replace the fallback values and normalize ordering/category relationships.
4. Failed requests keep the fallback and expose a non-blocking warning only in the admin surface.
5. Admin saves write to Supabase, then refresh the normalized content state so the public route reflects the change immediately.

## Error and security handling

- Unauthenticated users are redirected from `/admin` to sign-in.
- Supabase credentials are read only from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- RLS policies protect every table; browser auth is not treated as authorization by itself.
- Upload failures do not create a metadata row; failed metadata writes attempt to remove the newly uploaded file.
- Delete actions are confirmed and remove both metadata and the associated storage object where possible.
- Empty states are provided for no categories, no photos, and no hero slides.
- Public rendering handles missing or malformed remote content by using normalized fallback values.

## Testing and verification

- Unit tests cover content normalization, fallback merging, slug generation, and ordering mutations.
- Component tests cover admin authentication gating, editable content save behavior, category/photo creation, and hero slide management.
- Manual browser verification covers sign-in, upload, reorder, delete, refresh persistence, public rendering, keyboard navigation, and mobile layout.
- `npm run lint` and `npm run build` must pass before completion.

## Implementation boundaries

The implementation will add a Supabase client and content service, adapt public components to consume the normalized model, add the admin route and admin components, and include a SQL migration/seed script plus environment-variable documentation. Existing visual styling and bundled image assets remain intact as the fallback baseline.
