-- For new installations, run this after supabase/migrations/001_cms.sql.
-- For installations created with an earlier 001_cms.sql, run 002 and 003 first.
-- This seeds public CMS records only; create admin users in Supabase Auth.
-- Re-running it updates section/category defaults and adds missing media rows. It
-- deliberately keeps existing media metadata and uploaded Storage objects intact.

insert into public.site_content (key, content) values
  ('navigation', $json${"brand":"PEPEGRAPHY","links":[{"label":{"en":"About","hu":"Rólam"},"href":"#about"},{"label":{"en":"Portfolio","hu":"Portfólió"},"href":"#portfolio"},{"label":{"en":"Booking","hu":"Foglalás"},"href":"#booking"},{"label":{"en":"Contact","hu":"Kapcsolat"},"href":"#contact"}]}$json$::jsonb),
  ('hero', $json${"eyebrow":{"en":"Natural · Authentic · Timeless","hu":"Természetes · Hiteles · Időtlen"},"title":"PEPEGRAPHY","subtitle":{"en":"Photography by Petra Styasztny","hu":"Fotográfia Petra Styasztny részéről"},"ctaLabel":{"en":"View Portfolio","hu":"Portfólió megtekintése"},"ctaHref":"#portfolio"}$json$::jsonb),
  ('about', $json${"eyebrow":{"en":"About Me","hu":"Rólam"},"title":{"en":"Real moments. Real people.","hu":"Valódi pillanatok. Valódi emberek."},"titleLineBreakAfterWords":2,"body":[{"en":"Hello, I'm Petra Styasztny — the photographer behind Pepegraphy. I believe the most beautiful photographs aren't staged; they're stolen from real life. My approach is relaxed, unhurried, and always guided by authenticity.","hu":"Szia, Petra Styasztny vagyok — a Pepegraphy fotósa. Hiszem, hogy a legszebb fotók nem beállítottak; a való életből ellesett pillanatok. A hozzáállásom laza, nyugodt, és mindig a hitelességre épít."},{"en":"Whether I'm capturing a quiet family afternoon, the electric atmosphere of a party, or the quiet confidence of a portrait session, my goal is the same: to show you — and the world — exactly as you are, at your very best.","hu":"Akár egy csendes családi délutánt, akár egy buli pezsdítő hangulatát, akár egy portré magabiztos csendjét örökítem meg, a célom mindig ugyanaz: megmutatni téged — és a világnak — pontosan úgy, ahogy vagy, a legjobb formádban."}],"imageUrl":"/petra-portrait.png","imageAlt":{"en":"Petra Styasztny","hu":"Petra Styasztny portré"},"stats":[{"value":"8","label":{"en":"Specialities","hu":"Specialitások"}},{"value":"∞","label":{"en":"Photos","hu":"Fotók"}},{"value":"100%","label":{"en":"Authentic","hu":"Hiteles"}}]}$json$::jsonb),
  ('portfolio', $json${"eyebrow":{"en":"Work","hu":"Munkák"},"title":{"en":"Portfolio","hu":"Portfólió"},"description":{"en":"Browse by category, or explore the full collection. Every frame tells a story of a moment captured in its most honest form.","hu":"Böngéssz kategóriák szerint, vagy fedezd fel a teljes gyűjteményt. Minden kép egy történetet mesél el a pillanatról, amely a legőszintébb formájában lett megörökítve."}}$json$::jsonb),
  ('specialities', $json${"eyebrow":{"en":"What I offer","hu":"Specialitásaim"},"title":{"en":"Specialities","hu":"Specialitások"},"items":[{"icon":"♂","title":{"en":"Male Portraiture","hu":"Férfi portré"},"description":{"en":"Sessions that celebrate strength, charisma and individuality — from polished professional headshots to relaxed, character-driven portraits.","hu":"Fotózások, amelyek megünneplik az erőt, a karizmát és az egyéniséget — a kifinomult céges portréktól a laza, karakteres képekig."}},{"icon":"♀","title":{"en":"Female Portraiture","hu":"Női portré"},"description":{"en":"Elegant, empowering sessions that celebrate every facet of womanhood — natural beauty, confidence, and personality, captured authentically.","hu":"Elegáns, magabiztos fotózások, amelyek a nőiességet minden oldalról megünneplik — természetes szépség, önbizalom és személyiség, hitelesen megörökítve."}},{"icon":"✦","title":{"en":"Children","hu":"Gyermekek"},"description":{"en":"Joyful, candid images that freeze childhood in its purest form — all the energy, wonder, and laughter that defines those fleeting years.","hu":"Vidám, spontán képek, amelyek a gyermekkort a legtisztább formájában ragadják meg — minden energia, csoda és nevetés, ami ezeket a mulandó éveket meghatározza."}},{"icon":"◆","title":{"en":"Parties & Events","hu":"Bulik és események"},"description":{"en":"From intimate gatherings to milestone celebrations — birthdays, christenings, anniversaries — every moment of joy, preserved.","hu":"Az intim összejövetelektől a mérföldkő ünnepségekig — születésnapok, keresztelők, évfordulók — minden örömteli pillanat megőrizve."}},{"icon":"◈","title":{"en":"Reportage","hu":"Riport"},"description":{"en":"Documentary-style photography that captures raw emotion, mood, and the unfiltered truth of a moment — honest and powerful storytelling.","hu":"Dokumentarista stílusú fotózás, amely a nyers érzelmeket, a hangulatot és a pillanat szűretlen igazságát ragadja meg — őszinte és hatásos történetmesélés."}},{"icon":"❋","title":{"en":"Nature","hu":"Természet"},"description":{"en":"Landscapes, flora, fauna — the natural world in all its serene beauty, from sweeping vistas to intimate close-up details.","hu":"Tájak, növények, állatok — a természet csendes szépsége, a lenyűgöző panorámáktól az intim részletekig."}},{"icon":"⬡","title":{"en":"Pet Photography","hu":"Háziállat fotózás"},"description":{"en":"Personality-packed portraits of your furry companions — playful, tender, and always full of the character that makes them uniquely yours.","hu":"Személyiséggel teli portrék a szőrös társakról — játékos, gyengéd, és mindig tele azzal a karakterrel, ami egyedivé teszi őket."}},{"icon":"◇","title":{"en":"Boudoir","hu":"Boudoir"},"description":{"en":"Intimate, empowering sessions designed around confidence and self-celebration. Tasteful, elegant, and entirely on your terms.","hu":"Intim, önbizalom-erősítő fotózás, amely a magabiztosság és az önmegünneplés köré épül. Ízléses, elegáns, és teljesen a te szabályaid szerint."}}]}$json$::jsonb),
  ('booking', $json${"eyebrow":{"en":"Booking","hu":"Foglalás"},"title":{"en":"Ready for your shoot?","hu":"Készen állsz a fotózásra?"},"features":[{"title":{"en":"No time limits","hu":"Nincs időkorlát"},"description":{"en":"Your session runs as long as it needs to — no watching the clock.","hu":"A fotózás addig tart, ameddig szükséges — nem kell az órát nézni."}},{"title":{"en":"Unlimited photos","hu":"Korlátlan fotók"},"description":{"en":"Every great shot is yours. No artificial limits on your delivered gallery.","hu":"Minden jó kép a tiéd. Nincs mesterséges korlát a kézbesített galériában."}},{"title":{"en":"Tailored sessions","hu":"Személyre szabott fotózás"},"description":{"en":"Each shoot is shaped around you — your personality, your vision, your comfort.","hu":"Minden fotózás köréd épül — a személyiséged, az elképzelésed, a kényelmed köré."}},{"title":{"en":"Affordable pricing","hu":"Megfizethető árak"},"description":{"en":"Premium photography doesn't need a premium price tag. Transparent, fair rates.","hu":"A prémium fotózásnak nem kell prémium árat jelentenie. Átlátható, tisztességes árazás."}}],"ctaLabel":{"en":"Get in touch","hu":"Vedd fel a kapcsolatot"},"ctaHref":"#contact","backgroundImageUrl":"/hero-bg.png"}$json$::jsonb),
  ('contact', $json${"eyebrow":{"en":"Contact","hu":"Kapcsolat"},"title":{"en":"Let's create something beautiful.","hu":"Hozzunk létre valami gyönyörűt."},"titleLineBreakAfterWords":2,"description":{"en":"Reach out to discuss your shoot. Whether you have a clear vision or are starting from scratch, I'm here to guide you through every step.","hu":"Vedd fel velem a kapcsolatot a fotózás megbeszéléséhez. Akár van konkrét elképzelésed, akár a nulláról indulsz, minden lépésben segítek."},"email":"petrastyasztny@gmail.com","phone":"+44 7975 605 120"}$json$::jsonb),
  ('footer', $json${"brand":"PEPEGRAPHY","tagline":{"en":"Natural · Authentic · Timeless photography by Petra Styasztny","hu":"Természetes · Hiteles · Időtlen fotográfia Petra Styasztny részéről"},"links":[{"label":{"en":"About","hu":"Rólam"},"href":"#about"},{"label":{"en":"Portfolio","hu":"Portfólió"},"href":"#portfolio"},{"label":{"en":"Booking","hu":"Foglalás"},"href":"#booking"},{"label":{"en":"Contact","hu":"Kapcsolat"},"href":"#contact"}],"copyright":{"en":"© 2026 Pepegraphy. All rights reserved.","hu":"© 2026 Pepegraphy. Minden jog fenntartva."}}$json$::jsonb)
on conflict (key) do update set content = excluded.content, is_visible = true;

insert into public.gallery_categories (id, slug, name, sort_order) values
  ('10000000-0000-4000-8000-000000000001', 'female', 'Női', 0),
  ('10000000-0000-4000-8000-000000000002', 'male', 'Férfi', 1),
  ('10000000-0000-4000-8000-000000000003', 'children', 'Gyermekek', 2),
  ('10000000-0000-4000-8000-000000000004', 'pet', 'Háziállat', 3),
  ('10000000-0000-4000-8000-000000000005', 'events', 'Bulik', 4),
  ('10000000-0000-4000-8000-000000000006', 'reportage', 'Riport', 5),
  ('10000000-0000-4000-8000-000000000007', 'nature', 'Természet', 6),
  ('10000000-0000-4000-8000-000000000008', 'boudoir', 'Boudoir', 7)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, is_visible = true;

insert into public.gallery_photos (category_id, image_url, storage_path, alt_text, sort_order)
select category.id, photo.image_url, photo.storage_path, photo.alt_text, photo.sort_order
from (values
  ('events', '/gallery/img_1.jpg', null::text, 'Stage performance event', 0),
  ('nature', '/gallery/img_2.jpg', null::text, 'Fire salamander in nature', 1),
  ('events', '/gallery/img_3.jpg', null::text, 'Aerial acrobat performance', 2),
  ('pet', '/gallery/img_4.jpg', null::text, 'Pug dog with birthday hat', 3),
  ('reportage', '/gallery/img_5.jpg', null::text, 'DJ event reportage photography', 4),
  ('female', '/gallery/img_6.jpg', null::text, 'Female portrait in sequin dress', 5),
  ('boudoir', '/gallery/img_7.jpg', null::text, 'Boudoir portrait at vanity table', 6),
  ('children', '/gallery/img_8.jpg', null::text, 'Child portrait in winter hood', 7),
  ('male', '/gallery/img_9.jpg', null::text, 'Male portrait', 8),
  ('female', '/gallery/img_10.jpg', null::text, 'Female portrait with hat and gloves', 9),
  ('female', '/gallery/img_12.jpg', null::text, 'Female outdoor portrait', 10),
  ('female', '/gallery/img_13.jpg', null::text, 'Female artistic portrait', 11),
  ('female', '/gallery/img_14.jpg', null::text, 'Redhead female portrait close-up', 12),
  ('female', '/gallery/img_15.jpg', null::text, 'Female portrait with spring blossoms', 13),
  ('female', '/gallery/img_16.jpg', null::text, 'Female full-length portrait', 14),
  ('female', '/gallery/img_18.jpg', null::text, 'Female outdoor portrait (medium close-up)', 15)
) as photo(category_slug, image_url, storage_path, alt_text, sort_order)
join public.gallery_categories as category on category.slug = photo.category_slug
where not exists (select 1 from public.gallery_photos existing where existing.image_url = photo.image_url);

insert into public.hero_slides (image_url, storage_path, alt_text, sort_order)
select photo.image_url, photo.storage_path, photo.alt_text, photo.sort_order
from (values
  ('/gallery/img_1.jpg', null::text, 'Stage performance event', 0),
  ('/gallery/img_2.jpg', null::text, 'Fire salamander in nature', 1),
  ('/gallery/img_3.jpg', null::text, 'Aerial acrobat performance', 2),
  ('/gallery/img_4.jpg', null::text, 'Pug dog with birthday hat', 3),
  ('/gallery/img_5.jpg', null::text, 'DJ event reportage photography', 4),
  ('/gallery/img_6.jpg', null::text, 'Female portrait in sequin dress', 5),
  ('/gallery/img_7.jpg', null::text, 'Boudoir portrait at vanity table', 6),
  ('/gallery/img_8.jpg', null::text, 'Child portrait in winter hood', 7),
  ('/gallery/img_9.jpg', null::text, 'Male portrait', 8),
  ('/gallery/img_10.jpg', null::text, 'Female portrait with hat and gloves', 9),
  ('/gallery/img_12.jpg', null::text, 'Female outdoor portrait', 10),
  ('/gallery/img_13.jpg', null::text, 'Female artistic portrait', 11),
  ('/gallery/img_14.jpg', null::text, 'Redhead female portrait close-up', 12),
  ('/gallery/img_15.jpg', null::text, 'Female portrait with spring blossoms', 13),
  ('/gallery/img_16.jpg', null::text, 'Female full-length portrait', 14),
  ('/gallery/img_18.jpg', null::text, 'Female outdoor portrait (medium close-up)', 15)
) as photo(image_url, storage_path, alt_text, sort_order)
where not exists (select 1 from public.hero_slides existing where existing.image_url = photo.image_url);
