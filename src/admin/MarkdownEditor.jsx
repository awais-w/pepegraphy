// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React from 'react';

const TOOLBAR = [
  { label: 'B', action: 'bold', title: 'Bold', prefix: '**', suffix: '**' },
  { label: 'I', action: 'italic', title: 'Italic', prefix: '*', suffix: '*' },
  { label: 'H', action: 'heading', title: 'Heading', prefix: '## ', suffix: '' },
  { label: '“”', action: 'quote', title: 'Quote', prefix: '> ', suffix: '' },
  { label: '—', action: 'list', title: 'List', prefix: '- ', suffix: '' },
  { label: '1.', action: 'ordered', title: 'Ordered list', prefix: '1. ', suffix: '' },
  { label: '—', action: 'rule', title: 'Divider', prefix: '\n---\n', suffix: '' },
];

function wrapSelection(textarea, prefix, suffix) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.slice(0, start);
  const selected = textarea.value.slice(start, end);
  const after = textarea.value.slice(end);
  const next = `${before}${prefix}${selected}${suffix}${after}`;

  textarea.value = next;
  const cursor = start + prefix.length + selected.length + suffix.length;
  textarea.setSelectionRange(cursor, cursor);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
}

export function MarkdownEditor({ id, value, onChange, rows = 6 }) {
  return (
    <div className="admin-markdown-editor">
      <div className="admin-markdown-toolbar">
        {TOOLBAR.map((item) => (
          <button
            key={item.action}
            type="button"
            title={item.title}
            aria-label={item.title}
            onClick={() => {
              const textarea = document.getElementById(id);
              if (textarea?.tagName === 'TEXTAREA') wrapSelection(textarea, item.prefix, item.suffix);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
      />
    </div>
  );
}
