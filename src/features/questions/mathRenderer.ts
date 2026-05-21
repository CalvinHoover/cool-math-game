import katex from 'katex';

export function renderMath(text: string): string {
  try {
    return katex.renderToString(text, { throwOnError: false, displayMode: true });
  } catch {
    return text;
  }
}

export function renderMathInline(text: string): string {
  try {
    return katex.renderToString(text, { throwOnError: false, displayMode: false });
  } catch {
    return text;
  }
}
