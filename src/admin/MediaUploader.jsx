// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useEffect, useRef, useState } from 'react';
import { useContent } from '../context/ContentContext';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function imageValidationError(file) {
  if (!file?.type?.startsWith('image/')) return 'Choose an image file to upload.';
  if (file.size > MAX_IMAGE_SIZE) return 'Images must be 10 MB or smaller.';
  return null;
}

export function MediaUploader({ id, label, folder, submitLabel, onUploaded, disabled = false }) {
  const { uploadImage } = useContent();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => () => {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectFile = (event) => {
    const nextFile = event.target.files?.[0];
    const validationError = imageValidationError(nextFile);
    if (validationError) {
      setFile(null);
      setPreviewUrl(null);
      setError(validationError);
      return;
    }

    setFile(nextFile);
    setError(null);
    setPreviewUrl(typeof URL.createObjectURL === 'function' ? URL.createObjectURL(nextFile) : null);
  };

  const upload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploadedImage = await uploadImage(file, folder);
      await onUploaded(uploadedImage);
      setFile(null);
      setPreviewUrl(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload the image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="admin-media-uploader">
      <label htmlFor={id}>{label}</label>
      <input ref={inputRef} id={id} type="file" accept="image/*" onChange={selectFile} disabled={disabled || isUploading} />
      {previewUrl && <img className="admin-media-preview" src={previewUrl} alt="Selected image preview" />}
      {file && <p className="admin-media-file-name">Ready to upload: {file.name}</p>}
      {error && <p className="admin-message" role="alert">{error}</p>}
      <button type="button" className="admin-button-secondary" onClick={upload} disabled={disabled || isUploading || !file}>
        {isUploading ? 'Uploading image…' : submitLabel}
      </button>
    </div>
  );
}

export function ConfirmDialog({ title, description, confirmLabel = 'Delete', isDeleting = false, onCancel, onConfirm }) {
  return (
    <div className="admin-confirmation-backdrop" role="presentation">
      <section className="admin-confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-confirmation-title" aria-describedby="admin-confirmation-description">
        <h3 id="admin-confirmation-title">{title}</h3>
        <p id="admin-confirmation-description">{description}</p>
        <div className="admin-action-row">
          <button type="button" className="admin-button-secondary" onClick={onCancel} disabled={isDeleting}>Cancel</button>
          <button type="button" className="admin-button-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
