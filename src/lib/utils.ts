// [GenAI Use] Prompt: "I need a tiny helper that combines clsx and tailwind-merge so I can write conditional Tailwind classes without duplicates. Should be a single exported function."
// [GenAI Use] LLM Response Start
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// combines clsx and tailwind-merge so conditional classes are deduplicated automatically
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: This is a common pattern but I had not used it before. It saves a lot of manual class string concatenation in components.
