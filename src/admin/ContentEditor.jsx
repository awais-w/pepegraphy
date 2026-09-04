// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useMemo, useState } from 'react';
import { useContent } from '../context/ContentContext';
import { validateStructuredField } from '../lib/contentModel';
import { useToast } from './Toast';
import { MarkdownEditor } from './MarkdownEditor';

const LANGUAGE_LABELS = { en: 'EN', hu: 'HU' };

const TRANSLATABLE_FIELDS = {
  navigation: new Set(['brand']),
  hero: new Set(['eyebrow', 'title', 'subtitle', 'ctaLabel']),
  about: new Set(['eyebrow', 'title', 'body', 'imageAlt']),
  portfolio: new Set(['eyebrow', 'title', 'description']),
  specialities: new Set(['eyebrow', 'title', 'items']),
  booking: new Set(['eyebrow', 'title', 'features', 'ctaLabel']),
  contact: new Set(['eyebrow', 'title', 'description']),
  footer: new Set(['brand', 'tagline', 'copyright']),
};

const isTranslatable = (sectionKey, fieldKey) => TRANSLATABLE_FIELDS[sectionKey]?.has(fieldKey) ?? false;

const SECTION_SCHEMA = [
  {
    key: 'navigation',
    title: 'Navigation',
    fields: [
      { key: 'brand', label: 'Brand' },
      { key: 'links', label: 'Links', type: 'navigation-links', description: 'One link per line. Format: label=..., href=...' },
    ],
  },
  {
    key: 'hero',
    title: 'Hero',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'ctaLabel', label: 'Call to action label' },
      { key: 'ctaHref', label: 'Call to action link' },
    ],
  },
  {
    key: 'about',
    title: 'About',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'titleLineBreakAfterWords', label: 'Title line break after words', type: 'number' },
      { key: 'body', label: 'Body', type: 'markdown', description: 'Supports Markdown formatting.' },
      { key: 'imageUrl', label: 'Image URL' },
      { key: 'imageAlt', label: 'Image alternative text' },
      { key: 'stats', label: 'Stats', type: 'stats', description: 'One stat per line. Format: value=..., label=...' },
    ],
  },
  {
    key: 'portfolio',
    title: 'Portfolio',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description', type: 'markdown' },
    ],
  },
  {
    key: 'specialities',
    title: 'Specialities',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'items', label: 'Items', type: 'specialities', description: 'One item per line. Format: icon=..., title=..., description=...' },
    ],
  },
  {
    key: 'booking',
    title: 'Booking',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'features', label: 'Features', type: 'features', description: 'One feature per line. Format: title=..., description=...' },
      { key: 'ctaLabel', label: 'Call to action label' },
      { key: 'ctaHref', label: 'Call to action link' },
      { key: 'backgroundImageUrl', label: 'Background image URL' },
    ],
  },
  {
    key: 'contact',
    title: 'Contact',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'titleLineBreakAfterWords', label: 'Title line break after words', type: 'number' },
      { key: 'description', label: 'Description', type: 'markdown' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'tel' },
    ],
  },
  {
    key: 'footer',
    title: 'Footer',
    fields: [
      { key: 'brand', label: 'Brand' },
      { key: 'tagline', label: 'Tagline' },
      { key: 'links', label: 'Links', type: 'navigation-links', description: 'One link per line. Format: label=..., href=...' },
      { key: 'copyright', label: 'Copyright' },
    ],
  },
];

const fieldId = (sectionKey, fieldKey, suffix = '') => {
  const base = `${sectionKey}-${fieldKey.replaceAll(/([A-Z])/g, '-$1').toLowerCase()}`;
  return suffix ? `${base}-${suffix}` : base;
};

function fieldValue(value) {
  return value ?? '';
}

function readLocalized(value, language) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const localized = value[language];
    if (typeof localized === 'string') return localized;
    const fallback = value.en;
    if (typeof fallback === 'string') return fallback;
  }
  return '';
}

function ensureLocalized(existing, language, nextValue) {
  if (typeof existing === 'string') {
    return { en: existing, [language]: nextValue };
  }
  if (existing && typeof existing === 'object') {
    return { ...existing, [language]: nextValue };
  }
  return { [language]: nextValue };
}

function parseNavigationText(value) {
  const items = [];
  const lines = String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    const labelMatch = line.match(/label=(.+?)(?:,|\s+href=|$)/i);
    const hrefMatch = line.match(/href=(.+)/i);
    if (!labelMatch && !hrefMatch) continue;

    const label = labelMatch ? labelMatch[1].trim() : '';
    let href = hrefMatch ? hrefMatch[1].trim() : '#';
    if (!href.startsWith('#')) href = `#${href}`;

    if (label || href) {
      items.push({ label, href });
    }
  }

  return items;
}

function serializeNavigationBilingual(enText, huText) {
  const enItems = parseNavigationText(enText);
  const huItems = parseNavigationText(huText);
  const maxLength = Math.max(enItems.length, huItems.length, 1);

  const result = [];
  for (let index = 0; index < maxLength; index++) {
    const enItem = enItems[index] || {};
    const huItem = huItems[index] || {};
    const href = enItem.href || huItem.href || '#';
    const label = { en: enItem.label || '', hu: huItem.label || '' };

    result.push({ label, href });
  }

  return result;
}

function readNavigationText(value, language) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      const label = typeof item?.label === 'string' ? item.label : item?.label?.[language] || '';
      const href = typeof item?.href === 'string' ? item.href : '#';
      return `label=${label}, href=${href}`;
    }).join('\n');
  }

  return String(value ?? '');
}

function parseBodyText(value) {
  const paragraphs = String(value ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  return paragraphs;
}

function serializeBodyBilingual(enText, huText) {
  const enParagraphs = parseBodyText(enText);
  const huParagraphs = parseBodyText(huText);
  const maxLength = Math.max(enParagraphs.length, huParagraphs.length, 1);

  const result = [];
  for (let index = 0; index < maxLength; index++) {
    const enParagraph = enParagraphs[index] || '';
    const huParagraph = huParagraphs[index] || '';
    result.push({ en: enParagraph, hu: huParagraph });
  }

  return result;
}

function readBodyText(value, language) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      const text = typeof item === 'string' ? item : item?.[language] || '';
      return text;
    }).join('\n\n');
  }

  return String(value ?? '');
}

function parseLineFields(text, fieldNames) {
  const items = [];
  const lines = String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    const item = {};
    const regex = /(\w+)=((?:\\.|[^,])+)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const key = match[1].trim().toLowerCase();
      if (fieldNames.includes(key)) {
        let value = match[2].trim();
        value = value.replace(/\\,/g, ',').replace(/\\:/g, ':');
        item[key] = value;
      }
    }
    if (Object.keys(item).length > 0) {
      items.push(item);
    }
  }

  return items;
}

function serializeFieldsBilingual(enText, huText, fieldNames) {
  const enItems = parseLineFields(enText, fieldNames);
  const huItems = parseLineFields(huText, fieldNames);
  const maxLength = Math.max(enItems.length, huItems.length, 1);

  const result = [];
  for (let index = 0; index < maxLength; index++) {
    const enItem = enItems[index] || {};
    const huItem = huItems[index] || {};
    const entry = {};

    for (const key of fieldNames) {
      const enValue = enItem[key] || '';
      const huValue = huItem[key] || '';
      if (enValue || huValue) {
        entry[key] = { en: enValue, hu: huValue };
      }
    }

    result.push(entry);
  }

  return result;
}

function readFieldsText(value, language, fieldNames) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') return item;
      const parts = [];
      for (const key of fieldNames) {
        const raw = item?.[key];
        const text = typeof raw === 'string' ? raw : raw?.[language] || '';
        if (text) parts.push(`${key}=${text}`);
      }
      return parts.join(', ');
    }).join('\n');
  }

  return String(value ?? '');
}

export function ContentEditor({ editingLanguage = 'en', onLanguageChange }) {
  const { content, error, saveSection } = useContent();
  const siteContent = content?.siteContent ?? {};
  const [edits, setEdits] = useState({});
  const [jsonEdits, setJsonEdits] = useState({});
  const [savingKeys, setSavingKeys] = useState({});
  const [feedback, setFeedback] = useState(null);
  const toast = useToast();

  const supportedLanguages = useMemo(() => ['en', 'hu'], []);

  const sectionContent = (section) => {
    const jsonValues = jsonEdits[section.key] ?? {};
    const parsedJson = Object.fromEntries(section.fields
      .filter((field) => field.type === 'json' && jsonValues[field.key] !== undefined)
      .map((field) => {
        try {
          const value = JSON.parse(jsonValues[field.key]);
          validateStructuredField(section.key, field.key, value);
          return [field.key, value];
        } catch {
          throw new Error(`Enter valid JSON matching ${field.description} for ${section.title} ${field.label}.`);
        }
      }));

    return { ...siteContent[section.key], ...edits[section.key], ...parsedJson };
  };

  const updateField = (sectionKey, field, value) => {
    setEdits((current) => ({
      ...current,
      [sectionKey]: { ...current[sectionKey], [field.key]: value },
    }));
  };

  const updateJsonField = (sectionKey, fieldKey) => (event) => {
    const value = event.target.value;
    setJsonEdits((current) => ({
      ...current,
      [sectionKey]: { ...current[sectionKey], [fieldKey]: value },
    }));
  };

  const save = async (section) => {
    setSavingKeys((current) => ({ ...current, [section.key]: true }));
    setFeedback(null);
    try {
      await saveSection(section.key, sectionContent(section));
      setFeedback({ type: 'success', message: `${section.title} saved.` });
      toast('Changes published');
    } catch (saveError) {
      setFeedback({
        type: 'error',
        message: saveError instanceof Error ? saveError.message : `Unable to save ${section.title.toLowerCase()}.`,
      });
      toast(saveError instanceof Error ? saveError.message : `Unable to save ${section.title.toLowerCase()}.`, 'error');
    } finally {
      setSavingKeys((current) => {
        const remaining = { ...current };
        delete remaining[section.key];
        return remaining;
      });
    }
  };

  const renderFieldEditor = (section, field) => {
    const id = fieldId(section.key, field.key);
    const storedValue = siteContent[section.key]?.[field.key];
    const editedValue = edits[section.key]?.[field.key];
    const translatable = isTranslatable(section.key, field.key);

    if (field.type === 'navigation-links' || field.type === 'footer-links') {
      const currentValue = readNavigationText(editedValue ?? storedValue, editingLanguage);
      const otherValue = readNavigationText(editedValue ?? storedValue, editingLanguage === 'en' ? 'hu' : 'en');
      const updateCurrent = (text) => {
        const nextOther = readNavigationText(editedValue ?? storedValue, editingLanguage === 'en' ? 'hu' : 'en');
        if (editingLanguage === 'en') {
          updateField(section.key, field, serializeNavigationBilingual(text, nextOther));
        } else {
          updateField(section.key, field, serializeNavigationBilingual(nextOther, text));
        }
      };
      return (
        <div className="admin-bilingual-field">
          <div>
            <textarea
              id={fieldId(section.key, field.key, editingLanguage)}
              value={currentValue}
              onChange={(event) => updateCurrent(event.target.value)}
              rows="6"
            />
          </div>
        </div>
      );
    }

    if (field.type === 'markdown') {
      const currentValue = typeof (editedValue ?? storedValue) === 'string' ? editedValue ?? storedValue : readLocalized(editedValue ?? storedValue, editingLanguage);
      const updateCurrent = (text) => updateField(section.key, field, ensureLocalized(editedValue ?? storedValue, editingLanguage, text));
      return (
        <MarkdownEditor
          id={fieldId(section.key, field.key, editingLanguage)}
          value={currentValue}
          onChange={updateCurrent}
        />
      );
    }

    if (field.type === 'stats') {
      const currentValue = readFieldsText(editedValue ?? storedValue, editingLanguage, ['value', 'label']);
      const otherValue = readFieldsText(editedValue ?? storedValue, editingLanguage === 'en' ? 'hu' : 'en', ['value', 'label']);
      const updateCurrent = (text) => {
        const nextOther = readFieldsText(editedValue ?? storedValue, editingLanguage === 'en' ? 'hu' : 'en', ['value', 'label']);
        if (editingLanguage === 'en') {
          updateField(section.key, field, serializeFieldsBilingual(text, nextOther, ['value', 'label']));
        } else {
          updateField(section.key, field, serializeFieldsBilingual(nextOther, text, ['value', 'label']));
        }
      };
      return (
        <div className="admin-bilingual-field">
          <div>
            <textarea
              id={fieldId(section.key, field.key, editingLanguage)}
              value={currentValue}
              onChange={(event) => updateCurrent(event.target.value)}
              rows="6"
            />
          </div>
        </div>
      );
    }

    if (field.type === 'specialities') {
      const currentValue = readFieldsText(editedValue ?? storedValue, editingLanguage, ['icon', 'title', 'description']);
      const otherValue = readFieldsText(editedValue ?? storedValue, editingLanguage === 'en' ? 'hu' : 'en', ['icon', 'title', 'description']);
      const updateCurrent = (text) => {
        const nextOther = readFieldsText(editedValue ?? storedValue, editingLanguage === 'en' ? 'hu' : 'en', ['icon', 'title', 'description']);
        if (editingLanguage === 'en') {
          updateField(section.key, field, serializeFieldsBilingual(text, nextOther, ['icon', 'title', 'description']));
        } else {
          updateField(section.key, field, serializeFieldsBilingual(nextOther, text, ['icon', 'title', 'description']));
        }
      };
      return (
        <div className="admin-bilingual-field">
          <div>
            <textarea
              id={fieldId(section.key, field.key, editingLanguage)}
              value={currentValue}
              onChange={(event) => updateCurrent(event.target.value)}
              rows="10"
            />
          </div>
        </div>
      );
    }

    if (field.type === 'features') {
      const currentValue = readFieldsText(editedValue ?? storedValue, editingLanguage, ['title', 'description']);
      const otherValue = readFieldsText(editedValue ?? storedValue, editingLanguage === 'en' ? 'hu' : 'en', ['title', 'description']);
      const updateCurrent = (text) => {
        const nextOther = readFieldsText(editedValue ?? storedValue, editingLanguage === 'en' ? 'hu' : 'en', ['title', 'description']);
        if (editingLanguage === 'en') {
          updateField(section.key, field, serializeFieldsBilingual(text, nextOther, ['title', 'description']));
        } else {
          updateField(section.key, field, serializeFieldsBilingual(nextOther, text, ['title', 'description']));
        }
      };
      return (
        <div className="admin-bilingual-field">
          <div>
            <textarea
              id={fieldId(section.key, field.key, editingLanguage)}
              value={currentValue}
              onChange={(event) => updateCurrent(event.target.value)}
              rows="10"
            />
          </div>
        </div>
      );
    }

    if (field.type === 'json') {
      const jsonValue = jsonEdits[section.key]?.[field.key] ?? JSON.stringify(editedValue ?? storedValue ?? '', null, 2);
      return (
        <>
          <textarea id={id} value={jsonValue} onChange={updateJsonField(section.key, field.key)} aria-describedby={`${id}-help`} rows="8" />
          <small id={`${id}-help`}>{field.description}</small>
        </>
      );
    }

    const localizedValue = fieldValue(readLocalized(editedValue ?? storedValue, editingLanguage));

    if (field.type === 'textarea') {
      return (
        <textarea
          id={id}
          value={localizedValue}
          onChange={(event) => updateField(section.key, field, ensureLocalized(editedValue ?? storedValue, editingLanguage, event.target.value))}
          rows="4"
        />
      );
    }

  const numberCoerce = (event) => {
    const value = event.target.value;
    return field.type === 'number' && value !== '' ? Number(value) : value;
  };
  return (
    <input
      id={id}
      type={field.type ?? 'text'}
      value={localizedValue}
      onChange={(event) => updateField(section.key, field, ensureLocalized(editedValue ?? storedValue, editingLanguage, numberCoerce(event)))}
    />
  );
  };

  return (
    <div className="admin-content-editor">
      {error && (
        <p className="admin-message" role="alert">
          The CMS is unavailable, so you are editing fallback content. Changes will save when the CMS is available.
        </p>
      )}
      {feedback && (
        <p className={feedback.type === 'error' ? 'admin-message' : undefined} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.message}
        </p>
      )}
      {SECTION_SCHEMA.map((section) => {
        const isSaving = Boolean(savingKeys[section.key]);
        return (
          <section className="admin-panel" key={section.key} aria-labelledby={`${section.key}-editor-title`}>
            <h3 id={`${section.key}-editor-title`}>{section.title}</h3>
            <fieldset disabled={isSaving}>
              {section.fields.map((field) => {
                const id = fieldId(section.key, field.key);
                const translatable = isTranslatable(section.key, field.key);
                return (
                  <div key={field.key} className="admin-field">
                    <label htmlFor={id}>{section.title} {field.label}</label>
                    {renderFieldEditor(section, field)}
                  </div>
                );
              })}
              <button type="button" className="admin-button-secondary" onClick={() => save(section)}>
                {isSaving ? `Saving ${section.key}…` : `Save ${section.key}`}
              </button>
            </fieldset>
          </section>
        );
      })}
    </div>
  );
}
