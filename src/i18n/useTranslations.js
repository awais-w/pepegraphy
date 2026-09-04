import { useLanguage } from './LanguageContext';
import { getTranslations, localizeContentTree } from './translations';

export function useTranslations() {
  const { language } = useLanguage();
  return getTranslations(language);
}

export function useContentTranslations(value) {
  const { language } = useLanguage();
  return localizeContentTree(value, language);
}
