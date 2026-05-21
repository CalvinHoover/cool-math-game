import { describe, expect, it } from 'vitest';
import {
  activeRenderer,
  katexRenderer,
  passthroughRenderer,
  setRenderer,
} from '@/features/questions/mathRenderer';

describe('katexRenderer', () => {
  it('renders inline math inside $...$', () => {
    const html = katexRenderer.renderToHtml('Solve $x^2$ for $x$.');
    expect(html).toContain('katex');
    expect(html).toContain('Solve ');
    expect(html).toContain(' for ');
    expect(html).toContain('.');
  });

  it('renders display math inside $$...$$', () => {
    const html = katexRenderer.renderToHtml('$$\\sum_{i=1}^n i$$');
    expect(html).toContain('katex-display');
  });

  it('renders plain text with no math as escaped html', () => {
    const html = katexRenderer.renderToHtml('What is 2+2?');
    expect(html).toBe('What is 2+2?');
  });

  it('escapes html in non-math text', () => {
    const html = katexRenderer.renderToHtml('a < b and c > d');
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
  });

  it('handles invalid latex gracefully', () => {
    const html = katexRenderer.renderToHtml('$\\invalidcommand$');
    expect(html).toContain('katex-error');
  });
});

describe('passthroughRenderer', () => {
  it('returns plain text with html escaped', () => {
    const html = passthroughRenderer.renderToHtml('$x^2$');
    expect(html).toBe('$x^2$');
  });

  it('escapes html characters', () => {
    const html = passthroughRenderer.renderToHtml('a < b');
    expect(html).toBe('a &lt; b');
  });
});

describe('setRenderer', () => {
  it('swaps the active renderer', () => {
    setRenderer(passthroughRenderer);
    const html = activeRenderer.renderToHtml('$x$');
    expect(html).toBe('$x$');

    setRenderer(katexRenderer);
    const html2 = activeRenderer.renderToHtml('$x$');
    expect(html2).toContain('katex');
  });
});
