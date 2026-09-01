-- Run this after supabase/migrations/001_cms.sql.
-- This seeds public CMS records only; create admin users in Supabase Auth.
-- Re-running it updates section/category defaults and adds missing media rows. It
-- deliberately keeps existing media metadata and uploaded Storage objects intact.

insert into public.site_content (key, content) values
  ('navigation', $json${"brand":"PEPEGRAPHY","links":[{"label":"About","href":"#about"},{"label":"Portfolio","href":"#portfolio"},{"label":"Booking","href":"#booking"},{"label":"Contact","href":"#contact"}]}$json$::jsonb),
  ('hero', $json${"eyebrow":"Natural · Authentic · Timeless","title":"PEPEGRAPHY","subtitle":"Photography by Petra Styasztny","ctaLabel":"View Portfolio","ctaHref":"#portfolio"}$json$::jsonb),
  ('about', $json${"eyebrow":"About Me","title":"Real moments. Real people.","body":["Hello, I'm Petra Styasztny — the photographer behind Pepegraphy. I believe the most beautiful photographs aren't staged; they're stolen from real life. My approach is relaxed, unhurried, and always guided by authenticity.","Whether I'm capturing a quiet family afternoon, the electric atmosphere of a party, or the quiet confidence of a portrait session, my goal is the same: to show you — and the world — exactly as you are, at your very best."],"imageUrl":"/petra-portrait.png","imageAlt":"Petra Styasztny","stats":[{"value":"8","label":"Specialities"},{"value":"∞","label":"Photos"},{"value":"100%","label":"Authentic"}]}$json$::jsonb),
  ('specialities', $json${"eyebrow":"What I offer","title":"Specialities","items":[{"icon":"♂","title":"Male Portraiture","description":"Sessions that celebrate strength, charisma and individuality — from polished professional headshots to relaxed, character-driven portraits."},{"icon":"♀","title":"Female Portraiture","description":"Elegant, empowering sessions that celebrate every facet of womanhood — natural beauty, confidence, and personality, captured authentically."},{"icon":"✦","title":"Children","description":"Joyful, candid images that freeze childhood in its purest form — all the energy, wonder, and laughter that defines those fleeting years."},{"icon":"◆","title":"Parties & Events","description":"From intimate gatherings to milestone celebrations — birthdays, christenings, anniversaries — every moment of joy, preserved."},{"icon":"◈","title":"Reportage","description":"Documentary-style photography that captures raw emotion, mood, and the unfiltered truth of a moment — honest and powerful storytelling."},{"icon":"❋","title":"Nature","description":"Landscapes, flora, fauna — the natural world in all its serene beauty, from sweeping vistas to intimate close-up details."},{"icon":"⬡","title":"Pet Photography","description":"Personality-packed portraits of your furry companions — playful, tender, and always full of the character that makes them uniquely yours."},{"icon":"◇","title":"Boudoir","description":"Intimate, empowering sessions designed around confidence and self-celebration. Tasteful, elegant, and entirely on your terms."}]}$json$::jsonb),
  ('booking', $json${"eyebrow":"Booking","title":"Ready for your shoot?","features":[{"title":"No time limits","description":"Your session runs as long as it needs to — no watching the clock."},{"title":"Unlimited photos","description":"Every great shot is yours. No artificial limits on your delivered gallery."},{"title":"Tailored sessions","description":"Each shoot is shaped around you — your personality, your vision, your comfort."},{"title":"Affordable pricing","description":"Premium photography doesn't need a premium price tag. Transparent, fair rates."}],"ctaLabel":"Get in touch","ctaHref":"#contact","backgroundImageUrl":"/hero-bg.png"}$json$::jsonb),
  ('contact', $json${"eyebrow":"Contact","title":"Let's create something beautiful.","description":"Reach out to discuss your shoot. Whether you have a clear vision or are starting from scratch, I'm here to guide you through every step.","email":"petrastyasztny@gmail.com","phone":"+44 7975 605 120"}$json$::jsonb),
  ('footer', $json${"brand":"PEPEGRAPHY","tagline":"Natural · Authentic · Timeless photography by Petra Styasztny","links":[{"label":"About","href":"#about"},{"label":"Portfolio","href":"#portfolio"},{"label":"Booking","href":"#booking"},{"label":"Contact","href":"#contact"}],"copyright":"© 2026 Pepegraphy. All rights reserved."}$json$::jsonb)
on conflict (key) do update set content = excluded.content, is_visible = true;

insert into public.gallery_categories (id, slug, name, sort_order) values
  ('10000000-0000-4000-8000-000000000001', 'female', 'female', 0),
  ('10000000-0000-4000-8000-000000000002', 'male', 'male', 1),
  ('10000000-0000-4000-8000-000000000003', 'children', 'children', 2),
  ('10000000-0000-4000-8000-000000000004', 'pet', 'Pets', 3),
  ('10000000-0000-4000-8000-000000000005', 'events', 'events', 4),
  ('10000000-0000-4000-8000-000000000006', 'reportage', 'reportage', 5),
  ('10000000-0000-4000-8000-000000000007', 'nature', 'nature', 6),
  ('10000000-0000-4000-8000-000000000008', 'boudoir', 'boudoir', 7)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, is_visible = true;

insert into public.gallery_photos (category_id, image_url, alt_text, sort_order)
select category.id, photo.image_url, photo.alt_text, photo.sort_order
from (values
  ('events', '/gallery/img_1.jpg', 'Stage performance event', 0),
  ('nature', '/gallery/img_2.jpg', 'Fire salamander in nature', 1),
  ('events', '/gallery/img_3.jpg', 'Aerial acrobat performance', 2),
  ('pet', '/gallery/img_4.jpg', 'Pug dog with birthday hat', 3),
  ('reportage', '/gallery/img_5.jpg', 'DJ event reportage photography', 4),
  ('female', '/gallery/img_6.jpg', 'Female portrait in sequin dress', 5),
  ('boudoir', '/gallery/img_7.jpg', 'Boudoir portrait at vanity table', 6),
  ('children', '/gallery/img_8.jpg', 'Child portrait in winter hood', 7),
  ('male', '/gallery/img_9.jpg', 'Male portrait', 8),
  ('female', '/gallery/img_10.jpg', 'Female portrait with hat and gloves', 9),
  ('female', '/gallery/img_12.jpg', 'Female outdoor portrait', 10),
  ('female', '/gallery/img_13.jpg', 'Female artistic portrait', 11),
  ('female', '/gallery/img_14.jpg', 'Redhead female portrait close-up', 12),
  ('female', '/gallery/img_15.jpg', 'Female portrait with spring blossoms', 13),
  ('female', '/gallery/img_16.jpg', 'Female full-length portrait', 14),
  ('female', '/gallery/img_18.jpg', 'Female outdoor portrait (medium close-up)', 15)
) as photo(category_slug, image_url, alt_text, sort_order)
join public.gallery_categories as category on category.slug = photo.category_slug
where not exists (select 1 from public.gallery_photos existing where existing.image_url = photo.image_url);

insert into public.hero_slides (image_url, alt_text, sort_order)
select photo.image_url, photo.alt_text, photo.sort_order
from (values
  ('/gallery/img_1.jpg', 'Stage performance event', 0),
  ('/gallery/img_2.jpg', 'Fire salamander in nature', 1),
  ('/gallery/img_3.jpg', 'Aerial acrobat performance', 2),
  ('/gallery/img_4.jpg', 'Pug dog with birthday hat', 3),
  ('/gallery/img_5.jpg', 'DJ event reportage photography', 4),
  ('/gallery/img_6.jpg', 'Female portrait in sequin dress', 5),
  ('/gallery/img_7.jpg', 'Boudoir portrait at vanity table', 6),
  ('/gallery/img_8.jpg', 'Child portrait in winter hood', 7),
  ('/gallery/img_9.jpg', 'Male portrait', 8),
  ('/gallery/img_10.jpg', 'Female portrait with hat and gloves', 9),
  ('/gallery/img_12.jpg', 'Female outdoor portrait', 10),
  ('/gallery/img_13.jpg', 'Female artistic portrait', 11),
  ('/gallery/img_14.jpg', 'Redhead female portrait close-up', 12),
  ('/gallery/img_15.jpg', 'Female portrait with spring blossoms', 13),
  ('/gallery/img_16.jpg', 'Female full-length portrait', 14),
  ('/gallery/img_18.jpg', 'Female outdoor portrait (medium close-up)', 15)
) as photo(image_url, alt_text, sort_order)
where not exists (select 1 from public.hero_slides existing where existing.image_url = photo.image_url);
