// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { moveItem } from '../lib/contentRepository';
import { slugify } from '../lib/contentModel';
import { ConfirmDialog, MediaUploader } from './MediaUploader';
import { useToast } from './Toast';

const messageFor = (error, fallback) => error instanceof Error ? error.message : fallback;
const ordered = (items) => [...(items ?? [])].sort((first, second) => first.sortOrder - second.sortOrder);
const nextSortOrder = (items) => items.reduce((highest, item) => {
  const sortOrder = Number(item.sortOrder);
  return Number.isFinite(sortOrder) ? Math.max(highest, sortOrder) : highest;
}, -1) + 1;

function CategoryEditor({ category, index, total, onSave, onMove, onDelete }) {
  const [name, setName] = useState(category.name);
  const [isVisible, setIsVisible] = useState(category.isVisible !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setIsSaving(true);
    setError(null);
    const categoryName = name.trim();
    if (!categoryName) {
      setError('Enter a category name.');
      setIsSaving(false);
      return;
    }
    try {
      await onSave(category.id, { name: categoryName, slug: slugify(categoryName) });
    } catch (saveError) {
      setError(messageFor(saveError, 'Unable to save the category.'));
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
      await onSave(category.id, { isVisible: nextVisibility });
    } catch (saveError) {
      setIsVisible(!nextVisibility);
      setError(messageFor(saveError, 'Unable to update category visibility.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <li className="admin-category-item">
      <label htmlFor={`category-${category.id}-name`}>Category name</label>
      <input id={`category-${category.id}-name`} value={name} onChange={(event) => setName(event.target.value)} disabled={isSaving} />
      <label htmlFor={`category-${category.id}-visible`}>
        <input id={`category-${category.id}-visible`} type="checkbox" checked={isVisible} onChange={updateVisibility} disabled={isSaving} />
        Show on site
      </label>
      {error && <p className="admin-message" role="alert">{error}</p>}
      <div className="admin-action-row">
        <button type="button" className="admin-button-secondary" onClick={save} disabled={isSaving}>Save category</button>
        <button type="button" className="admin-button-secondary" onClick={() => onMove(index, 'up')} disabled={isSaving || index === 0}>Move up</button>
        <button type="button" className="admin-button-secondary" onClick={() => onMove(index, 'down')} disabled={isSaving || index === total - 1}>Move down</button>
        <button type="button" className="admin-button-danger" onClick={(event) => onDelete(category, event.currentTarget)} disabled={isSaving}>Delete category</button>
      </div>
    </li>
  );
}

function PhotoEditor({ photo, index, total, onSave, onMove, onDelete, onReplace }) {
  const [altText, setAltText] = useState(photo.alt ?? '');
  const [isVisible, setIsVisible] = useState(photo.isVisible !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(photo.id, { altText, isVisible });
    } catch (saveError) {
      setError(messageFor(saveError, 'Unable to save the photo.'));
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
      await onSave(photo.id, { isVisible: nextVisibility });
    } catch (saveError) {
      setIsVisible(!nextVisibility);
      setError(messageFor(saveError, 'Unable to update photo visibility.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="admin-media-card" aria-label={`Gallery photo ${index + 1}`}>
      <img className="admin-media-card-image" src={photo.src} alt={photo.alt || ''} />
      <div className="admin-media-card-body">
        <p className="admin-media-position">Photo {index + 1} of {total}</p>
        <p>
          <label htmlFor={`photo-${photo.id}-alt`}>Alternative text</label>
          <input id={`photo-${photo.id}-alt`} value={altText} onChange={(event) => setAltText(event.target.value)} disabled={isSaving} />
        </p>
        <p>
          <label htmlFor={`photo-${photo.id}-visible`}>
            <input id={`photo-${photo.id}-visible`} type="checkbox" checked={isVisible} onChange={updateVisibility} disabled={isSaving} />
            Show on site
          </label>
        </p>
        {error && <p className="admin-message" role="alert">{error}</p>}
        <div className="admin-action-row">
          <button type="button" className="admin-button-secondary" onClick={save} disabled={isSaving}>Save photo</button>
          <button type="button" className="admin-button-secondary" onClick={() => onMove(index, 'up')} disabled={isSaving || index === 0}>Move up</button>
          <button type="button" className="admin-button-secondary" onClick={() => onMove(index, 'down')} disabled={isSaving || index === total - 1}>Move down</button>
          <button type="button" className="admin-button-danger" onClick={(event) => onDelete(photo, event.currentTarget)} disabled={isSaving}>Delete photo</button>
        </div>
        <MediaUploader
          id={`photo-${photo.id}-replacement`}
          label="Replace image"
          folder="gallery"
          submitLabel="Replace photo image"
          disabled={isSaving}
          onUploaded={(image) => onReplace(photo.id, image)}
        />
      </div>
    </article>
  );
}

export function GalleryManager() {
  const {
    content,
    error: contentError,
    createCategory,
    updateCategory,
    deleteCategory,
    createPhoto,
    updatePhoto,
    deletePhoto,
  } = useContent();
  const toast = useToast();
  const categories = ordered(content?.categories);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newPhotoAltText, setNewPhotoAltText] = useState('');
  const [newPhotoIsVisible, setNewPhotoIsVisible] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const newCategorySlug = slugify(newCategoryName);
  const nextCategorySortOrder = nextSortOrder(categories);
  const activeCategoryId = categories.some((category) => category.id === selectedCategoryId)
    ? selectedCategoryId
    : categories[0]?.id ?? '';
  const selectedPhotos = ordered((content?.photos ?? []).filter((photo) => photo.categoryId === activeCategoryId));

  const createNewCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setFeedback({ type: 'error', message: 'Enter a category name.' });
      toast('Enter a category name.', 'error');
      return;
    }
    if (categories.some((category) => slugify(category.name) === newCategorySlug || category.slug === newCategorySlug)) {
      setFeedback({ type: 'error', message: 'A category with this name already exists.' });
      toast('A category with this name already exists.', 'error');
      return;
    }

    setFeedback(null);
    try {
      const category = await createCategory(name, nextCategorySortOrder);
      setNewCategoryName('');
      if (category?.id) setSelectedCategoryId(category.id);
      setFeedback({ type: 'success', message: 'Category created.' });
      toast('Changes published');
    } catch (createError) {
      setFeedback({ type: 'error', message: messageFor(createError, 'Unable to create the category.') });
      toast(messageFor(createError, 'Unable to create the category.'), 'error');
    }
  };

  const moveCategory = async (index, direction) => {
    setFeedback(null);
    try {
      const reorderedCategories = moveItem(categories, index, direction);
      await Promise.all(reorderedCategories.map((category, sortOrder) => updateCategory(category.id, { sortOrder })));
      setFeedback({ type: 'success', message: 'Category order saved.' });
      toast('Changes published');
    } catch (moveError) {
      setFeedback({ type: 'error', message: messageFor(moveError, 'Unable to reorder categories.') });
      toast(messageFor(moveError, 'Unable to reorder categories.'), 'error');
    }
  };

  const addPhoto = async (image) => {
    if (!activeCategoryId) throw new Error('Create and select a category before uploading a photo.');
    await createPhoto({
      categoryId: activeCategoryId,
      imageUrl: image.url,
      storagePath: image.path,
      altText: newPhotoAltText,
      sortOrder: nextSortOrder(selectedPhotos),
      isVisible: newPhotoIsVisible,
    });
    setNewPhotoAltText('');
    setNewPhotoIsVisible(true);
    setFeedback({ type: 'success', message: 'Photo added.' });
    toast('Changes published');
  };

  const movePhoto = async (index, direction) => {
    setFeedback(null);
    try {
      const reorderedPhotos = moveItem(selectedPhotos, index, direction);
      await Promise.all(reorderedPhotos.map((photo, sortOrder) => updatePhoto(photo.id, { sortOrder })));
      setFeedback({ type: 'success', message: 'Photo order saved.' });
      toast('Changes published');
    } catch (moveError) {
      setFeedback({ type: 'error', message: messageFor(moveError, 'Unable to reorder photos.') });
      toast(messageFor(moveError, 'Unable to reorder photos.'), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      if (pendingDelete.kind === 'category') await deleteCategory(pendingDelete.item.id);
      else await deletePhoto(pendingDelete.item.id);
      setFeedback({ type: 'success', message: `${pendingDelete.kind === 'category' ? 'Category' : 'Photo'} deleted.` });
      toast('Changes published');
      setPendingDelete(null);
    } catch (deleteError) {
      setFeedback({ type: 'error', message: messageFor(deleteError, `Unable to delete the ${pendingDelete.kind}.`) });
      toast(messageFor(deleteError, `Unable to delete the ${pendingDelete.kind}.`), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-media-manager">
      {contentError && <p className="admin-message" role="alert">The CMS is unavailable. Media changes may not save until it reconnects.</p>}
      {feedback && <p className={feedback.type === 'error' ? 'admin-message' : undefined} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}</p>}
      <section className="admin-gallery-section" aria-labelledby="gallery-categories-title">
        <h3 id="gallery-categories-title">Categories</h3>
        <div className="admin-inline-form">
          <label htmlFor="new-category-name">New category name</label>
          <input id="new-category-name" value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} />
          {newCategoryName.trim() && <p className="admin-slug-preview">Slug: {newCategorySlug}</p>}
          <button type="button" className="admin-button-secondary" onClick={createNewCategory}>Create category</button>
        </div>
        {categories.length === 0 ? (
          <p className="admin-empty-state" role="status">No categories yet. Create one before adding photographs.</p>
        ) : (
          <ol className="admin-category-list">
            {categories.map((category, index) => (
              <CategoryEditor
                key={category.id}
                category={category}
                index={index}
                total={categories.length}
                onSave={updateCategory}
                onMove={moveCategory}
                onDelete={(item, trigger) => setPendingDelete({ kind: 'category', item, trigger })}
              />
            ))}
          </ol>
        )}
      </section>
      <section className="admin-gallery-section" aria-labelledby="gallery-photos-title">
        <h3 id="gallery-photos-title">Photos</h3>
        <p>
          <label htmlFor="photo-category">Category</label>
          <select id="photo-category" value={activeCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} disabled={categories.length === 0}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </p>
        <fieldset className="admin-media-form" disabled={categories.length === 0}>
          <legend>Add a photo</legend>
          <p>
            <label htmlFor="new-photo-alt-text">Alternative text</label>
            <input id="new-photo-alt-text" value={newPhotoAltText} onChange={(event) => setNewPhotoAltText(event.target.value)} />
          </p>
          <p>
            <label htmlFor="new-photo-visible">
              <input id="new-photo-visible" type="checkbox" checked={newPhotoIsVisible} onChange={(event) => setNewPhotoIsVisible(event.target.checked)} />
              Show on site
            </label>
          </p>
          <MediaUploader id="new-photo-image" label="Photo image" folder="gallery" submitLabel="Upload photo" disabled={categories.length === 0} onUploaded={addPhoto} />
        </fieldset>
        {activeCategoryId && selectedPhotos.length === 0 && <p className="admin-empty-state" role="status">No photos in this category yet. Upload an image to add one.</p>}
        {selectedPhotos.length > 0 && (
          <div className="admin-media-grid">
            {selectedPhotos.map((photo, index) => (
              <PhotoEditor
                key={photo.id}
                photo={photo}
                index={index}
                total={selectedPhotos.length}
                onSave={updatePhoto}
                onMove={movePhoto}
                onDelete={(item, trigger) => setPendingDelete({ kind: 'photo', item, trigger })}
                onReplace={(id, image) => updatePhoto(id, { imageUrl: image.url, storagePath: image.path })}
              />
            ))}
          </div>
        )}
      </section>
      {pendingDelete && (
        <ConfirmDialog
          title={`Delete ${pendingDelete.kind}?`}
          description={pendingDelete.kind === 'category'
            ? 'This removes the category from the gallery. Child photos and uploaded files will be permanently deleted. This action cannot be undone.'
            : 'This removes the photo from the gallery. This action cannot be undone.'}
          isDeleting={isDeleting}
          restoreFocus={pendingDelete.trigger}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
