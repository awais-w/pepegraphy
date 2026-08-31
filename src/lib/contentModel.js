import { categories as defaultCategories, galleryImages } from '../data/portfolioData';

const defaultNavLinks = [
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Booking', href: '#booking' },
  { label: 'Contact', href: '#contact' },
];

const defaultSpecialities = [
  { icon: '♂', title: 'Male Portraiture', description: 'Sessions that celebrate strength, charisma and individuality — from polished professional headshots to relaxed, character-driven portraits.' },
  { icon: '♀', title: 'Female Portraiture', description: 'Elegant, empowering sessions that celebrate every facet of womanhood — natural beauty, confidence, and personality, captured authentically.' },
  { icon: '✦', title: 'Children', description: 'Joyful, candid images that freeze childhood in its purest form — all the energy, wonder, and laughter that defines those fleeting years.' },
  { icon: '◆', title: 'Parties & Events', description: 'From intimate gatherings to milestone celebrations — birthdays, christenings, anniversaries — every moment of joy, preserved.' },
  { icon: '◈', title: 'Reportage', description: 'Documentary-style photography that captures raw emotion, mood, and the unfiltered truth of a moment — honest and powerful storytelling.' },
  { icon: '❋', title: 'Nature', description: 'Landscapes, flora, fauna — the natural world in all its serene beauty, from sweeping vistas to intimate close-up details.' },
  { icon: '⬡', title: 'Pet Photography', description: 'Personality-packed portraits of your furry companions — playful, tender, and always full of the character that makes them uniquely yours.' },
  { icon: '◇', title: 'Boudoir', description: 'Intimate, empowering sessions designed around confidence and self-celebration. Tasteful, elegant, and entirely on your terms.' },
];

export const defaultContent = {
  siteContent: {
    navigation: { brand: 'PEPEGRAPHY', links: defaultNavLinks },
    hero: {
      eyebrow: 'Natural · Authentic · Timeless',
      title: 'PEPEGRAPHY',
      subtitle: 'Photography by Petra Styasztny',
      ctaLabel: 'View Portfolio',
      ctaHref: '#portfolio',
    },
    about: {
      eyebrow: 'About Me',
      title: 'Real moments. Real people.',
      body: [
        "Hello, I'm Petra Styasztny — the photographer behind Pepegraphy. I believe the most beautiful photographs aren't staged; they're stolen from real life. My approach is relaxed, unhurried, and always guided by authenticity.",
        'Whether I\'m capturing a quiet family afternoon, the electric atmosphere of a party, or the quiet confidence of a portrait session, my goal is the same: to show you — and the world — exactly as you are, at your very best.',
      ],
      imageUrl: '/petra-portrait.png',
      imageAlt: 'Petra Styasztny',
      stats: [
        { value: '8', label: 'Specialities' },
        { value: '∞', label: 'Photos' },
        { value: '100%', label: 'Authentic' },
      ],
    },
    specialities: { eyebrow: 'What I offer', title: 'Specialities', items: defaultSpecialities },
    booking: {
      eyebrow: 'Booking',
      title: 'Ready for your shoot?',
      features: [
        { title: 'No time limits', description: 'Your session runs as long as it needs to — no watching the clock.' },
        { title: 'Unlimited photos', description: 'Every great shot is yours. No artificial limits on your delivered gallery.' },
        { title: 'Tailored sessions', description: 'Each shoot is shaped around you — your personality, your vision, your comfort.' },
        { title: 'Affordable pricing', description: "Premium photography doesn't need a premium price tag. Transparent, fair rates." },
      ],
      ctaLabel: 'Get in touch',
      ctaHref: '#contact',
      backgroundImageUrl: '/hero-bg.png',
    },
    contact: {
      eyebrow: 'Contact',
      title: "Let's create something beautiful.",
      description: "Reach out to discuss your shoot. Whether you have a clear vision or are starting from scratch, I'm here to guide you through every step.",
      email: 'petrastyasztny@gmail.com',
      phone: '+44 7975 605 120',
    },
    footer: {
      brand: 'PEPEGRAPHY',
      tagline: 'Natural · Authentic · Timeless photography by Petra Styasztny',
      links: defaultNavLinks,
      copyright: '© 2026 Pepegraphy. All rights reserved.',
    },
  },
  heroSlides: galleryImages.map((image, index) => ({
    id: String(image.id),
    src: image.src,
    alt: image.alt,
    caption: '',
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
    sortOrder: index,
    isVisible: true,
  })),
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
    if (row?.key && row.content && typeof row.content === 'object') sections[row.key] = row.content;
    return sections;
  }, !Array.isArray(rows.siteContent) && rows.siteContent && typeof rows.siteContent === 'object' ? rows.siteContent : {});

  const heroSlides = (Array.isArray(rows.heroSlides) ? rows.heroSlides : []).filter(visible).map((row, index) => ({
    id: row.id,
    src: row.image_url ?? row.src ?? '',
    alt: row.alt_text ?? row.alt ?? '',
    caption: row.caption ?? '',
    sortOrder: order(row, index),
    isVisible: true,
  }));
  const categories = (Array.isArray(rows.categories) ? rows.categories : []).filter(visible).map((row, index) => ({
    id: row.id,
    slug: row.slug ?? slugify(row.name ?? ''),
    name: row.name ?? '',
    sortOrder: order(row, index),
    isVisible: true,
  }));
  const photos = (Array.isArray(rows.photos) ? rows.photos : []).filter(visible).map((row, index) => ({
    id: row.id,
    categoryId: row.category_id ?? row.categoryId ?? '',
    src: row.image_url ?? row.src ?? '',
    alt: row.alt_text ?? row.alt ?? '',
    sortOrder: order(row, index),
    isVisible: true,
  }));

  return { siteContent, heroSlides: sortByOrder(heroSlides), categories: sortByOrder(categories), photos: sortByOrder(photos) };
}

export function mergeContent(fallback = defaultContent, remote = {}) {
  const normalized = normalizeContent(remote);
  return {
    ...fallback,
    ...normalized,
    siteContent: Object.keys(normalized.siteContent).length
      ? { ...fallback.siteContent, ...normalized.siteContent }
      : fallback.siteContent,
    heroSlides: normalized.heroSlides.length ? normalized.heroSlides : fallback.heroSlides,
    categories: normalized.categories.length ? normalized.categories : fallback.categories,
    photos: normalized.photos.length ? normalized.photos : fallback.photos,
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
