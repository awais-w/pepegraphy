// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { validateStructuredField } from '../lib/contentModel';
import { useToast } from './Toast';

const SECTION_SCHEMA = [
  {
    key: 'navigation',
    title: 'Navigation',
    fields: [
      { key: 'brand', label: 'Brand' },
      { key: 'links', label: 'Links', type: 'json', description: 'A JSON array of link objects with label and href.' },
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
      { key: 'body', label: 'Body', type: 'json', description: 'A JSON array of paragraph strings.' },
      { key: 'imageUrl', label: 'Image URL' },
      { key: 'imageAlt', label: 'Image alternative text' },
      { key: 'stats', label: 'Stats', type: 'json', description: 'A JSON array of statistic objects with value and label.' },
    ],
  },
  {
    key: 'portfolio',
    title: 'Portfolio',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    key: 'specialities',
    title: 'Specialities',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'items', label: 'Items', type: 'json', description: 'A JSON array of speciality objects with icon, title, and description.' },
    ],
  },
  {
    key: 'booking',
    title: 'Booking',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'features', label: 'Features', type: 'json', description: 'A JSON array of feature objects with title and description.' },
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
      { key: 'description', label: 'Description', type: 'textarea' },
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
      { key: 'links', label: 'Links', type: 'json', description: 'A JSON array of link objects with label and href.' },
      { key: 'copyright', label: 'Copyright' },
    ],
  },
];

const fieldId = (sectionKey, fieldKey) => `${sectionKey}-${fieldKey.replaceAll(/([A-Z])/g, '-$1').toLowerCase()}`;

function fieldValue(value) {
  return value ?? '';
}

export function ContentEditor() {
  const { content, error, saveSection } = useContent();
  const siteContent = content?.siteContent ?? {};
  const [edits, setEdits] = useState({});
  const [jsonEdits, setJsonEdits] = useState({});
  const [savingKeys, setSavingKeys] = useState({});
  const [feedback, setFeedback] = useState(null);
  const toast = useToast();

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

  const updateField = (sectionKey, field) => (event) => {
    const value = field.type === 'number' && event.target.value !== ''
      ? Number(event.target.value)
      : event.target.value;

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
                const value = fieldValue(edits[section.key]?.[field.key] ?? siteContent[section.key]?.[field.key]);
                const jsonValue = jsonEdits[section.key]?.[field.key] ?? JSON.stringify(value, null, 2);

                return (
                  <p key={field.key}>
                    <label htmlFor={id}>{section.title} {field.label}</label>
                    {field.type === 'json' ? (
                      <>
                        <textarea id={id} value={jsonValue} onChange={updateJsonField(section.key, field.key)} aria-describedby={`${id}-help`} rows="6" />
                        <small id={`${id}-help`}>{field.description}</small>
                      </>
                    ) : field.type === 'textarea' ? (
                      <textarea id={id} value={value} onChange={updateField(section.key, field)} />
                    ) : (
                      <input id={id} type={field.type ?? 'text'} value={value} onChange={updateField(section.key, field)} />
                    )}
                  </p>
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
