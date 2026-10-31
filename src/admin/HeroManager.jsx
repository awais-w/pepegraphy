// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useState, useMemo } from 'react';
import { useContent } from '../context/ContentContext';
import { ConfirmDialog } from './MediaUploader';
import { useToast } from './Toast';
import { moveItem } from '../lib/contentRepository';

const messageFor = (error, fallback) => error instanceof Error ? error.message : fallback;
const ordered = (items) => [...(items ?? [])].sort((first, second) => first.sortOrder - second.sortOrder);

function HeroThumb({ photo }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const imageFailed = failedSrc === photo.src;

  if (imageFailed) {
    return (
      <span className="admin-media-broken admin-hero-thumb" role="img" aria-label="Image unavailable">
        <strong>Broken</strong>
      </span>
    );
  }

  return <img src={photo.src} alt="" className="admin-hero-thumb" onError={() => setFailedSrc(photo.src)} />;
}

export function HeroManager() {
  const { content, error: contentError, createHeroSlide, updateHeroSlide, deleteHeroSlide } = useContent();
  const toast = useToast();
  const slides = ordered(content?.heroSlides);
  const photos = ordered(content?.photos ?? []);
  const [feedback, setFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const photoById = useMemo(() => new Map(photos.map((photo) => [photo.id, photo])), [photos]);
  const slideByPhotoId = useMemo(() => new Map(slides.map((slide) => [slide.photoId, slide])), [slides]);
  const heroPhotoIds = useMemo(() => slides.map((slide) => slide.photoId).filter(Boolean), [slides]);
  const heroPhotos = useMemo(() => heroPhotoIds.map((id) => photoById.get(id)).filter(Boolean), [heroPhotoIds, photoById]);
  const otherPhotos = useMemo(() => photos.filter((photo) => !heroPhotoIds.includes(photo.id)), [photos, heroPhotoIds]);
  const allPhotos = useMemo(() => [...heroPhotos, ...otherPhotos], [heroPhotos, otherPhotos]);
  const standaloneSlides = useMemo(() => slides.filter((slide) => !slide.photoId), [slides]);

  const addSlide = async (photo) => {
    setIsSaving(true);
    try {
      await createHeroSlide({
        photoId: photo.id,
        imageUrl: photo.src,
        storagePath: photo.storagePath,
        altText: photo.altEn || photo.alt,
        altTextEn: photo.altEn || photo.alt,
        altTextHu: photo.altHu || photo.alt,
        caption: '',
        sortOrder: slides.length,
        isVisible: true,
      });
      toast('Added to hero');
      setFeedback({ type: 'success', message: 'Added to hero carousel.' });
    } catch (error) {
      setFeedback({ type: 'error', message: messageFor(error, 'Unable to add to hero.') });
      toast(messageFor(error, 'Unable to add to hero.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteHeroSlide(pendingDelete.item.id);
      toast('Removed from hero');
      setFeedback({ type: 'success', message: 'Removed from hero carousel.' });
      setPendingDelete(null);
    } catch (error) {
      setFeedback({ type: 'error', message: messageFor(error, 'Unable to remove the hero slide.') });
      toast(messageFor(error, 'Unable to remove the hero slide.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const moveHeroSlide = async (photo, direction) => {
    const currentIndex = heroPhotos.findIndex((item) => item.id === photo.id);
    if (currentIndex < 0) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= heroPhotos.length) return;

    setIsSaving(true);
    try {
      const reorderedHeroPhotos = moveItem(heroPhotos, currentIndex, direction);
      const reorderedSlideIds = reorderedHeroPhotos
        .map((item) => slideByPhotoId.get(item.id)?.id)
        .filter(Boolean);

      // Photo-linked slides take the new hero order while slides without a
      // linked photo keep their relative position, then the whole list is
      // renumbered so sort_order stays gapless and unambiguous.
      let heroCursor = 0;
      const reorderedSlides = slides.map((slide) => {
        if (!slide.photoId || !slideByPhotoId.has(slide.photoId)) return slide;
        const nextSlideId = reorderedSlideIds[heroCursor];
        heroCursor += 1;
        return slides.find((candidate) => candidate.id === nextSlideId) ?? slide;
      });

      await Promise.all(
        reorderedSlides
          .map((slide, sortOrder) => ({ slide, sortOrder }))
          .filter(({ slide, sortOrder }) => slide.sortOrder !== sortOrder)
          .map(({ slide, sortOrder }) => updateHeroSlide(slide.id, { sortOrder })),
      );
      toast('Hero order saved');
      setFeedback({ type: 'success', message: 'Hero order saved.' });
    } catch (error) {
      setFeedback({ type: 'error', message: messageFor(error, 'Unable to reorder hero slides.') });
      toast(messageFor(error, 'Unable to reorder hero slides.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-media-manager">
      {contentError && <p className="admin-message" role="alert">The CMS is unavailable. Media changes may not save until it reconnects.</p>}
      {feedback && <p className={feedback.type === 'error' ? 'admin-message' : undefined} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}</p>}

      {photos.length === 0 ? (
        <p className="admin-empty-state" role="status">No gallery images yet. Upload photos in the Gallery section first.</p>
      ) : (
        <table className="admin-hero-table">
          <tbody>
            <tr className="admin-hero-instructions">
              <td colSpan={2}>
                Select the images you want to add to the hero carousel. Use the up and down arrows to reorder them.
              </td>
            </tr>
            {allPhotos.map((photo) => {
              const isInHero = heroPhotoIds.includes(photo.id);
              const displayName = photo.altEn || photo.alt || 'Untitled image';
              const heroIndex = heroPhotos.findIndex((item) => item.id === photo.id);
              const isHeroRow = heroIndex >= 0;

              return (
                <tr
                  key={photo.id}
                  className={`${isHeroRow ? 'admin-hero-row' : ''} ${isInHero ? 'admin-in-hero' : ''}`}
                >
                  <td>
                    <div className="admin-hero-primary">
                      <HeroThumb photo={photo} />
                      <span className="admin-hero-name">{displayName}</span>
                    </div>
                  </td>
                  <td className="admin-hero-actions-cell">
                    <div className="admin-hero-actions">
                      {isHeroRow && (
                        <div className="admin-hero-reorder">
                          <button
                            type="button"
                            onClick={() => moveHeroSlide(photo, -1)}
                            disabled={isSaving || heroIndex === 0}
                            className="admin-icon-button"
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveHeroSlide(photo, 1)}
                            disabled={isSaving || heroIndex === heroPhotos.length - 1}
                            className="admin-icon-button"
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          if (isInHero) {
                            const slide = slideByPhotoId.get(photo.id);
                            if (slide) {
                              setPendingDelete({ item: slide, trigger: event.currentTarget });
                            }
                          } else {
                            addSlide(photo);
                          }
                        }}
                        disabled={isSaving}
                        className={isInHero ? 'admin-button-danger' : 'admin-button-secondary'}
                      >
                        {isInHero ? 'Remove from hero' : 'Add to hero'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {standaloneSlides.length > 0 && (
        <section className="admin-gallery-section" aria-labelledby="hero-standalone-title">
          <h3 id="hero-standalone-title">Slides without a gallery photo</h3>
          <p className="admin-empty-state" role="status">
            These slides are not linked to a gallery photo, so they cannot be reordered or re-selected here. Remove them if their image is no longer available.
          </p>
          <ul className="admin-media-list">
            {standaloneSlides.map((slide) => (
              <li key={slide.id} className="admin-media-card">
                <div className="admin-media-card-body">
                  <p className="admin-media-name">{slide.alt || slide.altEn || 'Untitled slide'}</p>
                  <p className="admin-media-position">{slide.src}</p>
                  <div className="admin-action-row">
                    <button
                      type="button"
                      className="admin-button-danger"
                      onClick={(event) => setPendingDelete({ item: slide, trigger: event.currentTarget })}
                      disabled={isSaving}
                    >
                      Remove from hero
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove hero slide?"
          description="This removes the image from the hero carousel. This action cannot be undone."
          isDeleting={isDeleting}
          restoreFocus={pendingDelete.trigger}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
