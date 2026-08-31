import { defaultContent } from './contentModel';

const mergeSection = (fallback, section) => ({
  ...fallback,
  ...Object.fromEntries(Object.entries(section || {}).filter(([, value]) => value !== undefined)),
});

export function buildPublicContent(content = defaultContent) {
  const source = {
    ...defaultContent,
    ...content,
    siteContent: { ...defaultContent.siteContent, ...content?.siteContent },
  };
  const siteContent = source.siteContent;
  const categories = source.categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    id: category.id,
  }));
  const publicCategories = categories.map(({ slug, name }) => ({ slug, name }));
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const photos = source.photos.map((photo) => ({
    id: photo.id,
    src: photo.src,
    alt: photo.alt,
    category: categoryById.get(photo.categoryId)?.slug || photo.categoryId,
  }));
  const photoById = new Map(photos.map((photo) => [String(photo.id), photo]));

  return {
    navigation: mergeSection(defaultContent.siteContent.navigation, siteContent.navigation),
    hero: {
      ...mergeSection(defaultContent.siteContent.hero, siteContent.hero),
      slides: source.heroSlides.map((slide) => ({
        id: slide.id,
        src: slide.src,
        alt: slide.alt,
        category: slide.caption || photoById.get(String(slide.id))?.category || '',
      })),
    },
    about: mergeSection(defaultContent.siteContent.about, siteContent.about),
    portfolio: {
      ...mergeSection(defaultContent.siteContent.portfolio, siteContent.portfolio),
      categories: [{ slug: 'all', name: 'All' }, ...publicCategories],
      images: photos,
    },
    specialities: mergeSection(defaultContent.siteContent.specialities, siteContent.specialities),
    booking: mergeSection(defaultContent.siteContent.booking, siteContent.booking),
    contact: mergeSection(defaultContent.siteContent.contact, siteContent.contact),
    footer: mergeSection(defaultContent.siteContent.footer, siteContent.footer),
  };
}
