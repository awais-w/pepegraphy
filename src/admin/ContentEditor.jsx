// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';

const SECTION_SCHEMA = [
  {
    key: 'navigation',
    title: 'Navigation',
    fields: [{ key: 'brand', label: 'Brand' }],
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
      { key: 'imageUrl', label: 'Image URL' },
      { key: 'imageAlt', label: 'Image alternative text' },
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
    ],
  },
  {
    key: 'booking',
    title: 'Booking',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
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
      { key: 'copyright', label: 'Copyright' },
    ],
  },
];

const fieldId = (sectionKey, fieldKey) => `${sectionKey}-${fieldKey.replaceAll(/([A-Z])/g, '-$1').toLowerCase()}`;

function fieldValue(value, type) {
  if (type === 'number') return value ?? '';
  return value ?? '';
}

export function ContentEditor() {
  const { content, error, saveSection } = useContent();
  const siteContent = content?.siteContent ?? {};
  const [edits, setEdits] = useState({});
  const [savingKey, setSavingKey] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const sectionContent = (sectionKey) => ({ ...siteContent[sectionKey], ...edits[sectionKey] });

  const updateField = (sectionKey, field) => (event) => {
    const value = field.type === 'number' && event.target.value !== ''
      ? Number(event.target.value)
      : event.target.value;

    setEdits((current) => ({
      ...current,
      [sectionKey]: { ...current[sectionKey], [field.key]: value },
    }));
  };

  const save = async (section) => {
    setSavingKey(section.key);
    setFeedback(null);
    try {
      await saveSection(section.key, sectionContent(section.key));
      setFeedback({ type: 'success', message: `${section.title} saved.` });
    } catch (saveError) {
      setFeedback({
        type: 'error',
        message: saveError instanceof Error ? saveError.message : `Unable to save ${section.title.toLowerCase()}.`,
      });
    } finally {
      setSavingKey(null);
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
        <p className={feedback.type === 'error' ? 'admin-message' : undefined} role="status">
          {feedback.message}
        </p>
      )}
      {SECTION_SCHEMA.map((section) => {
        const isSaving = savingKey === section.key;

        return (
          <section className="admin-panel" key={section.key} aria-labelledby={`${section.key}-editor-title`}>
            <h3 id={`${section.key}-editor-title`}>{section.title}</h3>
            <fieldset disabled={isSaving}>
              {section.fields.map((field) => {
                const id = fieldId(section.key, field.key);
                const value = fieldValue(sectionContent(section.key)[field.key], field.type);

                return (
                  <p key={field.key}>
                    <label htmlFor={id}>{section.title} {field.label}</label>
                    {field.type === 'textarea' ? (
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
