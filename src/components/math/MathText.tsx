'use client';

import { renderMixedMath } from '@/features/questions/mathRenderer';

export function MathText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const html = renderMixedMath(text);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
