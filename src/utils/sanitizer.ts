import DOMPurify from 'dompurify';

/**
 * XSS Prevention & Content Sanitizer
 * Configures DOMPurify with strict Whitelist policies.
 * Eliminates malicious scripts, javascript: URI handlers, on* attributes, and iframe injections.
 */

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'b', 'i', 'strong', 'em', 'strike', 'u',
    'ul', 'ol', 'li',
    'span', 'div',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'br',
  ],
  ALLOWED_ATTR: ['class', 'id', 'aria-label', 'role'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'href', 'src'],
};

/**
 * Sanitizes untrusted HTML string using DOMPurify.
 * Guaranteed safe to render in the DOM.
 */
export function sanitizeHtml(untrustedInput: string): string {
  if (!untrustedInput || typeof untrustedInput !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(untrustedInput, SANITIZE_CONFIG);
}

/**
 * Strips all HTML tags and returns safe plain text.
 */
export function stripHtmlToText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/<\/?[^>]+(>|$)/g, '').trim();
}

/**
 * Converts simple markdown formatting (*bold*, _italic_, bullet points, headers)
 * into safe HTML, and runs it through the sanitizer.
 */
export function safeMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown
    // Escape standard raw HTML entities first to prevent injection
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-slate-800 mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold text-slate-900 mt-4 mb-2">$1</h1>')
    // Bold & italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic text-slate-700">$1</em>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-brand-400 pl-3 py-1 my-2 text-slate-600 italic bg-brand-50/50 rounded-r">$1</blockquote>')
    // Bullet lists
    .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700 my-0.5">$1</li>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p class="my-2 text-slate-700">')
    .replace(/\n/gim, '<br/>');

  html = `<p class="my-2 text-slate-700">${html}</p>`;

  // Final defense: run through DOMPurify with our strict whitelist
  return sanitizeHtml(html);
}
