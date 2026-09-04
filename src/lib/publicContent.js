import { defaultContent, mergeContent } from './contentModel';
import { getDefaultLanguage, localizeContentTree, pickLocalized } from '../i18n/translations';

const mergeSection = (fallback, section) => ({
  ...fallback,
  ...Object.fromEntries(Object.entries(section || {}).filter(([, value]) => value !== undefined)),
});

const splitTitle = (title, lineBreakAfterWords) => {
  const words = String(title || '').trim().split(/\s+/).filter(Boolean);
  const breakAfter = Number(lineBreakAfterWords);

  if (!Number.isInteger(breakAfter) || breakAfter <= 0 || breakAfter >= words.length) return [title];

  return [
    words.slice(0, breakAfter).join(' '),
    words.slice(breakAfter).join(' '),
  ];
};

const withTitleLines = (section) => ({
  ...section,
  titleLines: splitTitle(section.title, section.titleLineBreakAfterWords),
});

const isVisible = (item) => item?.isVisible !== false && item?.is_visible !== false;

export function buildPublicContent(content = defaultContent, language = getDefaultLanguage()) {
  const source = mergeContent(defaultContent, content);
  const siteContent = source.siteContent;
  const categories = source.categories.filter(isVisible).map((category) => ({
    slug: category.slug,
    name: category.name,
    id: category.id,
  }));
  const publicCategories = categories.map(({ slug, name }) => ({ slug, name }));
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const photos = source.photos
    .filter(isVisible)
    .filter((photo) => categoryById.has(photo.categoryId))
    .map((photo) => ({
    id: photo.id,
    src: photo.src,
    alt: photo.alt,
    category: categoryById.get(photo.categoryId)?.slug || photo.categoryId,
    }));
  const photoById = new Map(photos.map((photo) => [String(photo.id), photo]));

  const localize = (value) => localizeContentTree(value, language);

  return {
    navigation: localize(mergeSection(defaultContent.siteContent.navigation, siteContent.navigation)),
    hero: {
      ...localize(mergeSection(defaultContent.siteContent.hero, siteContent.hero)),
      slides: source.heroSlides.filter(isVisible).map((slide) => ({
        id: slide.id,
        src: slide.src,
        alt: slide.alt,
        category: slide.caption || photoById.get(String(slide.id))?.category || '',
      })),
    },
    about: withTitleLines(localize(mergeSection(defaultContent.siteContent.about, siteContent.about))),
    portfolio: {
      ...localize(mergeSection(defaultContent.siteContent.portfolio, siteContent.portfolio)),
      categories: [{ slug: 'all', name: pickLocalized({ en: 'All', hu: 'Összes' }, language) }, ...publicCategories],
      images: photos,
    },
    specialities: localize(mergeSection(defaultContent.siteContent.specialities, siteContent.specialities)),
    booking: localize(mergeSection(defaultContent.siteContent.booking, siteContent.booking)),
    contact: withTitleLines(localize(mergeSection(defaultContent.siteContent.contact, siteContent.contact))),
    footer: localize(mergeSection(defaultContent.siteContent.footer, siteContent.footer)),
  };
}
