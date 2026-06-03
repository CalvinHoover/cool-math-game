'use client';
// src/components/interface/BackButton.tsx
// Reusable back button that navigates to a given path using the retro MenuButton style.

import { useRouter } from 'next/navigation';
import { MenuButton } from './MenuButton';

interface BackButtonProps {
  label?: string;
  href?: string;
}

export default function BackButton({ label = 'Back to Menu', href = '/dashboard' }: BackButtonProps) {
  const router = useRouter();
  return (
    <MenuButton
      label={label}
      onClick={() => router.push(href)}
      className="btn-settings"
    />
  );
}
