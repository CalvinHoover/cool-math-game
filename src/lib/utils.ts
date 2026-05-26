import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// combines clsx and tailwind-merge so conditional classes are deduplicated automatically
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
