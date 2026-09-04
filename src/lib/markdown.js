import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdown(markdown) {
  const raw = typeof markdown === 'string' ? markdown : '';
  const html = marked.parse(raw || '');
  if (typeof DOMPurify?.sanitize === 'function') {
    return DOMPurify.sanitize(html);
  }
  return html;
}
