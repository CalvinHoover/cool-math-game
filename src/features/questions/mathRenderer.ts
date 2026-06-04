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

export function renderMixedMath(text: string): string {
  const parts = text.split('$');
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Plain text — HTML escape
      result += parts[i]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } else {
      // Math segment
      try {
        result += katex.renderToString(parts[i], { throwOnError: false, displayMode: false });
      } catch {
        result += '$' + parts[i] + '$';
      }
    }
  }
  return result;
}
