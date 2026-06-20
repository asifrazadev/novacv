import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isEmptyHtml(html: string | undefined | null) {
  if (!html) return true
  const text = html.replace(/<[^>]*>/g, "").trim()
  return text === ""
}

export function getGoogleFontUrl(fontFamily: string | undefined | null): string {
  if (!fontFamily) return ""

  const fontMap: Record<string, string> = {
    "Inter": "Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800",
    "Roboto": "Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700",
    "Outfit": "Outfit:wght@300;400;500;600;700;800",
    "Playfair Display": "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700",
    "Lora": "Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700",
    "EB Garamond": "EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700",
    "JetBrains Mono": "JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700",
  }

  const spec = fontMap[fontFamily]
  if (!spec) return ""
  // Note: the mapping for Playfair Display, EB Garamond, and JetBrains Mono has spaces, the URL parameter should have '+' or '%20'.
  // encodeURIComponent handles spaces by turning them into %20 which Google Fonts supports perfectly.
  return `https://fonts.googleapis.com/css2?family=${spec}&display=swap`
}

// Map the DB font family name to the CSS variable name
export function getFontVariable(fontFamily: string | undefined | null): string {
  if (!fontFamily) return "var(--font-inter)"

  const map: Record<string, string> = {
    "Inter": "var(--font-inter)",
    "Roboto": "var(--font-roboto)",
    "Outfit": "var(--font-outfit)",
    "Playfair Display": "var(--font-playfair)",
    "Lora": "var(--font-lora)",
    "EB Garamond": "var(--font-eb-garamond)",
    "JetBrains Mono": "var(--font-jetbrains-mono)",
  }

  return map[fontFamily] || "var(--font-inter)"
}

