import { escapeHtml } from './escape-html';

describe('escapeHtml', () => {
  it('escapes the characters that can open markup or break out of an attribute', () => {
    expect(escapeHtml(`<b>"Rex" & 'Miso'</b>`)).toBe(
      '&lt;b&gt;&quot;Rex&quot; &amp; &#39;Miso&#39;&lt;/b&gt;',
    );
  });

  it('leaves plain text and links unchanged', () => {
    expect(escapeHtml('petwatch://invites/abc_-123')).toBe('petwatch://invites/abc_-123');
  });
});
