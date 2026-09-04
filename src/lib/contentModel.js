import { categories as defaultCategories, galleryImages } from '../data/portfolioData';

const bil = (en, hu) => ({ en, hu });

const defaultNavLinks = [
  { label: bil('About', 'Rólam'), href: '#about' },
  { label: bil('Portfolio', 'Portfólió'), href: '#portfolio' },
  { label: bil('Booking', 'Foglalás'), href: '#booking' },
  { label: bil('Contact', 'Kapcsolat'), href: '#contact' },
];

const defaultSpecialities = [
  { icon: '♂', title: bil('Male Portraiture', 'Férfi portré'), description: bil('Sessions that celebrate strength, charisma and individuality — from polished professional headshots to relaxed, character-driven portraits.', 'Fotózások, amelyek megünneplik az erőt, a karizmát és az egyéniséget — a kifinomult céges portréktól a laza, karakteres képekig.') },
  { icon: '♀', title: bil('Female Portraiture', 'Női portré'), description: bil('Elegant, empowering sessions that celebrate every facet of womanhood — natural beauty, confidence, and personality, captured authentically.', 'Elegáns, magabiztos fotózások, amelyek a nőiességet minden oldalról megünneplik — természetes szépség, önbizalom és személyiség, hitelesen megörökítve.') },
  { icon: '✦', title: bil('Children', 'Gyermekek'), description: bil('Joyful, candid images that freeze childhood in its purest form — all the energy, wonder, and laughter that defines those fleeting years.', 'Vidám, spontán képek, amelyek a gyermekkort a legtisztább formájában ragadják meg — minden energia, csoda és nevetés, ami ezeket a mulandó éveket meghatározza.') },
  { icon: '◆', title: bil('Parties & Events', 'Bulik és események'), description: bil('From intimate gatherings to milestone celebrations — birthdays, christenings, anniversaries — every moment of joy, preserved.', 'Az intim összejövetelektől a mérföldkő ünnepségekig — születésnapok, keresztelők, évfordulók — minden örömteli pillanat megőrizve.') },
  { icon: '◈', title: bil('Reportage', 'Riport'), description: bil('Documentary-style photography that captures raw emotion, mood, and the unfiltered truth of a moment — honest and powerful storytelling.', 'Dokumentarista stílusú fotózás, amely a nyers érzelmeket, a hangulatot és a pillanat szűretlen igazságát ragadja meg — őszinte és hatásos történetmesélés.') },
  { icon: '❋', title: bil('Nature', 'Természet'), description: bil('Landscapes, flora, fauna — the natural world in all its serene beauty, from sweeping vistas to intimate close-up details.', 'Tájak, növények, állatok — a természet csendes szépsége, a lenyűgöző panorámáktól az intim részletekig.') },
  { icon: '⬡', title: bil('Pet Photography', 'Háziállat fotózás'), description: bil('Personality-packed portraits of your furry companions — playful, tender, and always full of the character that makes them uniquely yours.', 'Személyiséggel teli portrék a szőrös társakról — játékos, gyengéd, és mindig tele azzal a karakterrel, ami egyedivé teszi őket.') },
  { icon: '◇', title: bil('Boudoir', 'Boudoir'), description: bil('Intimate, empowering sessions designed around confidence and self-celebration. Tasteful, elegant, and entirely on your terms.', 'Intim, önbizalom-erősítő fotózás, amely a magabiztosság és az önmegünneplés köré épül. Ízléses, elegáns, és teljesen a te szabályaid szerint.') },
];

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = (value) => typeof value === 'string';
const isBilingualOrString = (value) => {
  if (typeof value === 'string') return true;
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((key) => (key === 'en' || key === 'hu') && isString(value[key]));
};
const isArrayOf = (value, itemValidator) => Array.isArray(value) && value.every(itemValidator);
const isLink = (value) => isRecord(value) && isBilingualOrString(value.label) && isString(value.href);
const isStat = (value) => isRecord(value) && isString(value.value) && isBilingualOrString(value.label);
const isSpeciality = (value) => isRecord(value) && isString(value.icon) && isBilingualOrString(value.title) && isBilingualOrString(value.description);
const isFeature = (value) => isRecord(value) && isBilingualOrString(value.title) && isBilingualOrString(value.description);

export const structuredFieldDescriptions = {
  navigation: { links: 'a JSON array of link objects with label and href' },
  about: {
    body: 'a markdown string or bilingual markdown string',
    stats: 'a JSON array of statistic objects with value and label',
  },
  specialities: { items: 'a JSON array of speciality objects with icon, title, and description' },
  booking: { features: 'a JSON array of feature objects with title and description' },
  footer: { links: 'a JSON array of link objects with label and href' },
};

const structuredFieldValidators = {
  navigation: { links: (value) => isArrayOf(value, isLink) },
  about: {
    body: (value) => isBilingualOrString(value),
    stats: (value) => isArrayOf(value, isStat),
  },
  specialities: { items: (value) => isArrayOf(value, isSpeciality) },
  booking: { features: (value) => isArrayOf(value, isFeature) },
  footer: { links: (value) => isArrayOf(value, isLink) },
};

export function validateStructuredField(sectionKey, fieldKey, value) {
  const validator = structuredFieldValidators[sectionKey]?.[fieldKey];
  if (!validator || validator(value)) return;
  throw new Error(`Enter ${structuredFieldDescriptions[sectionKey][fieldKey]}.`);
}

const defaultPortfolioSection = {
  eyebrow: bil('Work', 'Munkák'),
  title: bil('Portfolio', 'Portfólió'),
  description: bil('Browse by category, or explore the full collection. Every frame tells a story of a moment captured in its most honest form.', 'Böngéssz kategóriák szerint, vagy fedezd fel a teljes gyűjteményt. Minden kép egy történetet mesél el a pillanatról, amely a legőszintébb formájában lett megörökítve.'),
};

export const defaultContent = {
  siteContent: {
    navigation: { brand: 'PEPEGRAPHY', links: defaultNavLinks },
    hero: {
      eyebrow: bil('Natural · Authentic · Timeless', 'Természetes · Hiteles · Időtlen'),
      title: 'PEPEGRAPHY',
      subtitle: bil('Photography by Petra Styasztny', 'Fotográfia Petra Styasztny részéről'),
      ctaLabel: bil('View Portfolio', 'Portfólió megtekintése'),
      ctaHref: '#portfolio',
    },
    about: {
      eyebrow: bil('About Me', 'Rólam'),
      title: bil('Real moments. Real people.', 'Valódi pillanatok. Valódi emberek.'),
      titleLineBreakAfterWords: 2,
      body: bil("Hello, I'm Petra Styasztny — the photographer behind Pepegraphy. I believe the most beautiful photographs aren't staged; they're stolen from real life. My approach is relaxed, unhurried, and always guided by authenticity.\n\nWhether I'm capturing a quiet family afternoon, the electric atmosphere of a party, or the quiet confidence of a portrait session, my goal is the same: to show you — and the world — exactly as you are, at your very best.", 'Szia, Petra Styasztny vagyok — a Pepegraphy fotósa. Hiszem, hogy a legszebb fotók nem beállítottak; a való életből ellesett pillanatok. A hozzáállásom laza, nyugodt, és mindig a hitelességre épít.\n\nAkár egy csendes családi délutánt, akár egy buli pezsdítő hangulatát, akár egy portré magabiztos csendjét örökítem meg, a célom mindig ugyanaz: megmutatni téged — és a világnak — pontosan úgy, ahogy vagy, a legjobb formádban.'),
      imageUrl: '/petra-portrait.png',
      imageAlt: bil('Petra Styasztny', 'Petra Styasztny portré'),
      stats: [
        { value: '8', label: bil('Specialities', 'Specialitások') },
        { value: '∞', label: bil('Photos', 'Fotók') },
        { value: '100%', label: bil('Authentic', 'Hiteles') },
      ],
    },
    portfolio: defaultPortfolioSection,
    specialities: { eyebrow: bil('What I offer', 'Specialitásaim'), title: bil('Specialities', 'Specialitások'), items: defaultSpecialities },
    booking: {
      eyebrow: bil('Booking', 'Foglalás'),
      title: bil('Ready for your shoot?', 'Készen állsz a fotózásra?'),
      features: [
        { title: bil('No time limits', 'Nincs időkorlát'), description: bil('Your session runs as long as it needs to — no watching the clock.', 'A fotózás addig tart, ameddig szükséges — nem kell az órát nézni.') },
        { title: bil('Unlimited photos', 'Korlátlan fotók'), description: bil('Every great shot is yours. No artificial limits on your delivered gallery.', 'Minden jó kép a tiéd. Nincs mesterséges korlát a kézbesített galériában.') },
        { title: bil('Tailored sessions', 'Személyre szabott fotózás'), description: bil('Each shoot is shaped around you — your personality, your vision, your comfort.', 'Minden fotózás köréd épül — a személyiséged, az elképzelésed, a kényelmed köré.') },
        { title: bil('Affordable pricing', 'Megfizethető árak'), description: bil("Premium photography doesn't need a premium price tag. Transparent, fair rates.", 'A prémium fotózásnak nem kell prémium árat jelentenie. Átlátható, tisztességes árazás.') },
      ],
      ctaLabel: bil('Get in touch', 'Vedd fel a kapcsolatot'),
      ctaHref: '#contact',
      backgroundImageUrl: '/hero-bg.png',
    },
    contact: {
      eyebrow: bil('Contact', 'Kapcsolat'),
      title: bil("Let's create something beautiful.", 'Hozzunk létre valami gyönyörűt.'),
      titleLineBreakAfterWords: 2,
      description: bil("Reach out to discuss your shoot. Whether you have a clear vision or are starting from scratch, I'm here to guide you through every step.", 'Vedd fel velem a kapcsolatot a fotózás megbeszéléséhez. Akár van konkrét elképzelésed, akár a nulláról indulsz, minden lépésben segítek. '),
      email: 'petrastyasztny@gmail.com',
      phone: '+44 7975 605 120',
    },
    footer: {
      brand: 'PEPEGRAPHY',
      tagline: bil('Natural · Authentic · Timeless photography by Petra Styasztny', 'Természetes · Hiteles · Időtlen fotográfia Petra Styasztny részéről'),
      links: defaultNavLinks,
      copyright: bil('© 2026 Pepegraphy. All rights reserved.', '© 2026 Pepegraphy. Minden jog fenntartva.'),
    },
  },
  heroSlides: galleryImages.map((image, index) => ({
    id: String(image.id),
    src: image.src,
    alt: image.alt,
    caption: '',
    storagePath: null,
    sortOrder: index,
    isVisible: true,
  })),
  categories: defaultCategories.filter((category) => category !== 'all').map((name, index) => ({
    id: name,
    slug: name,
    name: name === 'pet' ? 'Pets' : name,
    sortOrder: index,
    isVisible: true,
  })),
  photos: galleryImages.map((image, index) => ({
    id: String(image.id),
    categoryId: image.category,
    src: image.src,
    alt: image.alt,
    storagePath: null,
    sortOrder: index,
    isVisible: true,
  })),
};

const isCompatibleFieldValue = (fallbackValue, value) => {
  if (typeof fallbackValue === 'string') return isString(value) || isBilingualOrString(value);
  if (typeof fallbackValue === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (isRecord(fallbackValue)) {
    if (isString(value) || isBilingualOrString(value)) return true;
    if (!isRecord(value)) return false;
    return Object.keys(fallbackValue).every((key) => {
      if (!(key in value)) return true;
      return isCompatibleFieldValue(fallbackValue[key], value[key]);
    });
  }
  if (Array.isArray(fallbackValue)) {
    if (!Array.isArray(value)) return false;
    if (fallbackValue.length === 0) return true;
    const sample = fallbackValue[0];
    return value.every((entry) => isCompatibleFieldValue(sample, entry));
  }
  return true;
};

const mergeSectionContent = (sectionKey, fallback, remote) => {
  if (!isRecord(remote)) return fallback;

  return Object.entries(remote).reduce((section, [fieldKey, value]) => {
    if (value === undefined) return section;
    const validator = structuredFieldValidators[sectionKey]?.[fieldKey];
    if ((validator && !validator(value)) || !isCompatibleFieldValue(fallback[fieldKey], value)) return section;
    return { ...section, [fieldKey]: value };
  }, { ...fallback });
};

const mergeSiteContent = (fallback, remote) => {
  if (!isRecord(remote)) return fallback;
  return Object.entries(remote).reduce((sections, [sectionKey, section]) => ({
    ...sections,
    [sectionKey]: fallback[sectionKey]
      ? mergeSectionContent(sectionKey, fallback[sectionKey], section)
      : section,
  }), { ...fallback });
};

const sortByOrder = (items) => items
  .map((item, index) => ({ item, index }))
  .sort((a, b) => (a.item.sortOrder - b.item.sortOrder) || (a.index - b.index))
  .map(({ item }) => item);

const visible = (row) => row && row.is_visible !== false && row.isVisible !== false;
const numericOrder = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const order = (row, index) => numericOrder(row?.sort_order) ?? numericOrder(row?.sortOrder) ?? index;

export function normalizeContent(remoteRows = {}) {
  const rows = remoteRows || {};
  const siteContentRows = Array.isArray(rows.siteContent) ? rows.siteContent : [];
  const siteContent = siteContentRows.reduce((sections, row) => {
    if (row?.key && isRecord(row.content)) sections[row.key] = row.content;
    return sections;
  }, !Array.isArray(rows.siteContent) && isRecord(rows.siteContent) ? rows.siteContent : {});

  const heroSlides = (Array.isArray(rows.heroSlides) ? rows.heroSlides : []).map((row, index) => ({
    id: row.id,
    src: row.image_url ?? row.src ?? '',
    alt: row.alt_text ?? row.alt ?? '',
    caption: row.caption ?? '',
    storagePath: row.storage_path ?? row.storagePath ?? null,
    sortOrder: order(row, index),
    isVisible: visible(row),
  }));
  const categories = (Array.isArray(rows.categories) ? rows.categories : []).map((row, index) => ({
    id: row.id,
    slug: row.slug ?? slugify(row.name ?? ''),
    name: row.name ?? '',
    sortOrder: order(row, index),
    isVisible: visible(row),
  }));
  const photos = (Array.isArray(rows.photos) ? rows.photos : []).map((row, index) => ({
    id: row.id,
    categoryId: row.category_id ?? row.categoryId ?? '',
    src: row.image_url ?? row.src ?? '',
    alt: row.alt_text ?? row.alt ?? '',
    storagePath: row.storage_path ?? row.storagePath ?? null,
    sortOrder: order(row, index),
    isVisible: visible(row),
  }));

  return { siteContent, heroSlides: sortByOrder(heroSlides), categories: sortByOrder(categories), photos: sortByOrder(photos) };
}

export function mergeContent(fallback = defaultContent, remote = {}) {
  const normalized = normalizeContent(remote);
  return {
    ...fallback,
    ...normalized,
    siteContent: mergeSiteContent(fallback.siteContent, normalized.siteContent),
    heroSlides: Array.isArray(remote?.heroSlides) ? normalized.heroSlides : fallback.heroSlides,
    categories: Array.isArray(remote?.categories) ? normalized.categories : fallback.categories,
    photos: Array.isArray(remote?.photos) ? normalized.photos : fallback.photos,
  };
}

export function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function moveItem(items, index, direction) {
  const nextIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || index >= items.length || nextIndex < 0 || nextIndex >= items.length) return [...items];
  const result = [...items];
  [result[index], result[nextIndex]] = [result[nextIndex], result[index]];
  return result;
}
