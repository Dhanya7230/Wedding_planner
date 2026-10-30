import { describe, it, expect } from 'vitest';
import { sanitizeHtml, stripHtmlToText, safeMarkdownToHtml } from '../utils/sanitizer';

describe('XSS Prevention and Sanitizer', () => {
  it('strips malicious <script> tags and payloads completely', () => {
    const malicious = 'Hello <script>alert("xss")</script> World';
    const clean = sanitizeHtml(malicious);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('alert("xss")');
    expect(clean).toContain('Hello');
    expect(clean).toContain('World');
  });

  it('removes dangerous inline event handlers like onerror and onload', () => {
    const malicious = '<img src="x" onerror="alert(document.cookie)" /> Photo';
    const clean = sanitizeHtml(malicious);
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('alert(document.cookie)');
  });

  it('eliminates dangerous iframe and object embeds', () => {
    const malicious = '<iframe src="javascript:alert(1)"></iframe><div>Safe content</div>';
    const clean = sanitizeHtml(malicious);
    expect(clean).not.toContain('<iframe');
    expect(clean).not.toContain('javascript:');
    expect(clean).toContain('Safe content');
  });

  it('preserves safe formatting tags such as bold, italics, paragraphs, and lists', () => {
    const safeContent = '<p>Welcome <strong>guests</strong>! <em>Celebrate</em> with us.</p>';
    const clean = sanitizeHtml(safeContent);
    expect(clean).toContain('<strong>guests</strong>');
    expect(clean).toContain('<em>Celebrate</em>');
  });

  it('converts markdown safely without allowing injected script tags', () => {
    const markdownWithAttack = '**Bold Theme**\n<script>alert("hack")</script>\n- Item 1';
    const html = safeMarkdownToHtml(markdownWithAttack);
    expect(html).toContain('<strong');
    expect(html).toContain('Bold Theme');
    expect(html).not.toContain('<script>');
    expect(html).toContain('Item 1');
  });

  it('strips all HTML when requested as plain text', () => {
    const rich = '<div class="banner"><h1>Header</h1><p>Body</p></div>';
    const plain = stripHtmlToText(rich);
    expect(plain).toBe('HeaderBody');
  });
});
