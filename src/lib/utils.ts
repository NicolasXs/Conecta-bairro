import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value?: string, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "-"
  try {
    return new Date(value).toLocaleDateString("pt-BR", options)
  } catch {
    return "-"
  }
}

export function averageScore(ratings: { score: number }[]): string | null {
  if (!ratings.length) return null
  return (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
}

export function formatPrice(price?: number | null): string | null {
  if (price == null) return null
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
