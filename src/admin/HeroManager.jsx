// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { moveItem } from '../lib/contentRepository';
import { ConfirmDialog, MediaUploader } from './MediaUploader';
import { useToast } from './Toast';

const messageFor = (error, fallback) => error instanceof Error ? error.message : fallback;
const ordered = (items) => [...(items ?? [])].sort((first, second) => first.sortOrder - second.sortOrder);
const nextSortOrder = (items) => items.reduce((highest, item) => {
  const sortOrder = Number(item.sortOrder);
  return Number.isFinite(sortOrder) ? Math.max(highest, sortOrder) : highest;
}, -1) + 1;

function HeroSlideEditor({ slide, index, total, onSave, onMove, onDelete, onReplace }) {
  const [altText, setAltText] = useState(slide.alt ?? '');
  const [caption, setCaption] = useState(slide.caption ?? '');
  const [isVisible, setIsVisible] = useState(slide.isVisible !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(slide.id, { altText, caption, isVisible });
    } catch (saveError) {
      setError(messageFor(saveError, 'Unable to save the hero slide.'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateVisibility = async (event) => {
    const nextVisibility = event.target.checked;
    setIsVisible(nextVisibility);
    setIsSaving(true);
    setError(null);
    try {
      await onSave(slide.id, { isVisible: nextVisibility });
    } catch (saveError) {
      setIsVisible(!nextVisibility);
      setError(messageFor(saveError, 'Unable to update hero slide visibility.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="admin-media-card" aria-label={`Hero slide ${index + 1}`}>
      <img className="admin-media-card-image" src={slide.src} alt={slide.alt || ''} />
      <div className="admin-media-card-body">
        <p className="admin-media-position">Slide {index + 1} of {total}</p>
        <p>
          <label htmlFor={`hero-${slide.id}-alt`}>Alternative text</label>
          <input id={`hero-${slide.id}-alt`} value={altText} onChange={(event) => setAltText(event.target.value)} disabled={isSaving} />
        </p>
        <p>
          <label htmlFor={`hero-${slide.id}-caption`}>Caption</label>
          <input id={`hero-${slide.id}-caption`} value={caption} onChange={(event) => setCaption(event.target.value)} disabled={isSaving} />
        </p>
        <p>
          <label htmlFor={`hero-${slide.id}-visible`}>
            <input id={`hero-${slide.id}-visible`} type="checkbox" checked={isVisible} onChange={updateVisibility} disabled={isSaving} />
            Show on site
          </label>
        </p>
        {error && <p className="admin-message" role="alert">{error}</p>}
        <div className="admin-action-row">
          <button type="button" className="admin-button-secondary" onClick={save} disabled={isSaving}>Save hero slide</button>
          <button type="button" className="admin-button-secondary" onClick={() => onMove(index, 'up')} disabled={isSaving || index === 0}>Move up</button>
          <button type="button" className="admin-button-secondary" onClick={() => onMove(index, 'down')} disabled={isSaving || index === total - 1}>Move down</button>
          <button type="button" className="admin-button-danger" onClick={(event) => onDelete(slide, event.currentTarget)} disabled={isSaving}>Delete hero slide</button>
        </div>
        <MediaUploader
          id={`hero-${slide.id}-replacement`}
          label="Replace image"
          folder="hero"
          submitLabel="Replace hero image"
          disabled={isSaving}
          onUploaded={(image) => onReplace(slide.id, image)}
        />
      </div>
    </article>
  );
}

export function HeroManager() {
  const { content, error: contentError, createHeroSlide, updateHeroSlide, deleteHeroSlide } = useContent();
  const toast = useToast();
  const slides = ordered(content?.heroSlides);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const addSlide = async (image) => {
    await createHeroSlide({
      imageUrl: image.url,
      storagePath: image.path,
      altText,
      caption,
      sortOrder: nextSortOrder(slides),
      isVisible,
    });
    setAltText('');
    setCaption('');
    setIsVisible(true);
    setFeedback({ type: 'success', message: 'Hero slide added.' });
    toast('Changes published');
  };

  const moveSlide = async (index, direction) => {
    setFeedback(null);
    try {
      const reorderedSlides = moveItem(slides, index, direction);
      await Promise.all(reorderedSlides.map((slide, sortOrder) => updateHeroSlide(slide.id, { sortOrder })));
      setFeedback({ type: 'success', message: 'Hero slide order saved.' });
      toast('Changes published');
    } catch (moveError) {
      setFeedback({ type: 'error', message: messageFor(moveError, 'Unable to reorder hero slides.') });
      toast(messageFor(moveError, 'Unable to reorder hero slides.'), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteHeroSlide(pendingDelete.item.id);
      setFeedback({ type: 'success', message: 'Hero slide deleted.' });
      toast('Changes published');
      setPendingDelete(null);
    } catch (deleteError) {
      setFeedback({ type: 'error', message: messageFor(deleteError, 'Unable to delete the hero slide.') });
      toast(messageFor(deleteError, 'Unable to delete the hero slide.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-media-manager">
      {contentError && <p className="admin-message" role="alert">The CMS is unavailable. Media changes may not save until it reconnects.</p>}
      {feedback && <p className={feedback.type === 'error' ? 'admin-message' : undefined} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}</p>}
      <fieldset className="admin-media-form">
        <legend>Add a hero slide</legend>
        <p>
          <label htmlFor="new-hero-alt-text">Alternative text</label>
          <input id="new-hero-alt-text" value={altText} onChange={(event) => setAltText(event.target.value)} />
        </p>
        <p>
          <label htmlFor="new-hero-caption">Caption</label>
          <input id="new-hero-caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
        </p>
        <p>
          <label htmlFor="new-hero-visible">
            <input id="new-hero-visible" type="checkbox" checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} />
            Show on site
          </label>
        </p>
        <MediaUploader id="new-hero-image" label="Hero slide image" folder="hero" submitLabel="Upload hero slide" onUploaded={addSlide} />
      </fieldset>
      {slides.length === 0 ? (
        <p className="admin-empty-state" role="status">No hero slides yet. Upload an image to start the carousel.</p>
      ) : (
        <div className="admin-media-list">
          {slides.map((slide, index) => (
            <HeroSlideEditor
              key={slide.id}
              slide={slide}
              index={index}
              total={slides.length}
              onSave={updateHeroSlide}
              onMove={moveSlide}
              onDelete={(item, trigger) => setPendingDelete({ item, trigger })}
              onReplace={(id, image) => updateHeroSlide(id, { imageUrl: image.url, storagePath: image.path })}
            />
          ))}
        </div>
      )}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete hero slide?"
          description="This removes the slide from the carousel. This action cannot be undone."
          isDeleting={isDeleting}
          restoreFocus={pendingDelete.trigger}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
