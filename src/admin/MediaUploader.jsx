// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useEffect, useRef, useState } from 'react';
import { useContent } from '../context/ContentContext';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function imageValidationError(file) {
  if (!file?.type?.startsWith('image/')) return 'Choose an image file to upload.';
  if (file.size > MAX_IMAGE_SIZE) return 'Images must be 10 MB or smaller.';
  return null;
}

export function MediaUploader({ id, label, folder, submitLabel, onUploaded, disabled = false, multiple = false }) {
  const { uploadImage } = useContent();
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => () => {
    previewUrls.forEach((url) => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url); });
  }, [previewUrls]);

  const selectFiles = (event) => {
    const nextFiles = Array.from(event.target.files || []);
    const validationErrors = nextFiles.map(imageValidationError);
    const validFiles = [];
    const newErrors = [];
    const newPreviews = [];

    nextFiles.forEach((file, index) => {
      const error = validationErrors[index];
      if (error) {
        newErrors.push({ name: file.name, error });
      } else {
        validFiles.push(file);
        newPreviews.push(typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null);
      }
    });

    setFiles(validFiles);
    setPreviewUrls(newPreviews);
    setErrors(newErrors);
  };

  const upload = async () => {
    if (!files.length) return;

    setIsUploading(true);
    setErrors([]);
    setUploadProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });
        const uploadedImage = await uploadImage(file, folder);
        await onUploaded(uploadedImage);
      }

      setFiles([]);
      setPreviewUrls([]);
      setUploadProgress({ current: 0, total: 0 });
      if (inputRef.current) inputRef.current.value = '';
    } catch (uploadError) {
      setErrors((current) => [...current, { name: 'Upload', error: uploadError instanceof Error ? uploadError.message : 'Unable to upload the image.' }]);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, i) => i !== index));
    setPreviewUrls((current) => current.filter((_, i) => i !== index));
    setErrors((current) => current.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-media-uploader">
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={selectFiles}
        disabled={disabled || isUploading}
      />
      {previewUrls.length > 0 && (
        <div className="admin-media-previews">
          {previewUrls.map((url, index) => (
            <div key={index} className="admin-media-preview-item">
              <img className="admin-media-preview" src={url} alt={`Preview ${index + 1}`} />
              {!isUploading && (
                <button type="button" className="admin-media-remove" onClick={() => removeFile(index)} aria-label="Remove image">
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <p className="admin-media-file-names">
          {isUploading ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...` : `${files.length} file${files.length === 1 ? '' : 's'} selected`}
        </p>
      )}
      {errors.map((item, index) => (
        <p key={index} className="admin-message" role="alert">{item.error}</p>
      ))}
      <button type="button" className="admin-button-secondary" onClick={upload} disabled={disabled || isUploading || !files.length}>
        {isUploading ? 'Uploading...' : submitLabel}
      </button>
    </div>
  );
}

export function ConfirmDialog({ title, description, confirmLabel = 'Delete', isDeleting = false, onCancel, onConfirm, restoreFocus }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = restoreFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    dialogRef.current?.querySelector('[data-confirm-cancel]')?.focus();

    return () => {
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, [restoreFocus]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && !isDeleting) {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="admin-confirmation-backdrop" role="presentation">
      <section ref={dialogRef} className="admin-confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-confirmation-title" aria-describedby="admin-confirmation-description" onKeyDown={handleKeyDown}>
        <h3 id="admin-confirmation-title">{title}</h3>
        <p id="admin-confirmation-description">{description}</p>
        <div className="admin-action-row">
          <button type="button" className="admin-button-secondary" data-confirm-cancel onClick={onCancel} disabled={isDeleting}>Cancel</button>
          <button type="button" className="admin-button-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
