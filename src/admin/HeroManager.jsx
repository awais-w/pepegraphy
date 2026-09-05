// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useState, useMemo } from 'react';
import { useContent } from '../context/ContentContext';
import { ConfirmDialog } from './MediaUploader';
import { useToast } from './Toast';

const messageFor = (error, fallback) => error instanceof Error ? error.message : fallback;
const ordered = (items) => [...(items ?? [])].sort((first, second) => first.sortOrder - second.sortOrder);

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
      const currentSlide = slideByPhotoId.get(photo.id);
      const targetPhoto = heroPhotos[targetIndex];
      const targetSlide = slideByPhotoId.get(targetPhoto.id);

      await Promise.all([
        updateHeroSlide(currentSlide.id, { sortOrder: targetIndex }),
        updateHeroSlide(targetSlide.id, { sortOrder: currentIndex }),
      ]);
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
              <td colSpan={3}>
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
                    <img src={photo.src} alt="" className="admin-hero-thumb" />
                  </td>
                  <td>{displayName}</td>
                  <td>
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
                      style={{ marginTop: isHeroRow ? '0.5rem' : undefined }}
                    >
                      {isInHero ? 'Remove from hero' : 'Add to hero'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
