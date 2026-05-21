'use client';

import { renderMath } from '@/features/questions/mathRenderer';

export function MathText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const html = renderMath(text);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
