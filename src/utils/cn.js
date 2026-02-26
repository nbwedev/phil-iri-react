// Utility for merging Tailwind classes safely.
// Use this instead of string concatenation to avoid class conflicts.
//
// Usage:
//   cn('px-4 py-2', isActive && 'bg-blue-500', className)

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
