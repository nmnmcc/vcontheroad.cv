import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DEFAULT_LOCALE, LOCALES, pathForLocale } from '@/lib/i18n'

export async function GET(): Promise<never> {
  const h = await headers()
  const accept = h.get('accept-language') ?? ''
  const preferred = parseAcceptLanguage(accept)
  const locale =
    LOCALES.find((l) => preferred.some((tag) => matchesLocale(tag, l.htmlLang))) ?? DEFAULT_LOCALE
  redirect(pathForLocale('/', locale))
}

function parseAcceptLanguage(header: string): string[] {
  return header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith('q='))
      const quality = q ? Number.parseFloat(q.slice(2)) : 1
      return { tag: (tag ?? '').toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 }
    })
    .filter((t) => t.tag.length > 0 && t.quality > 0)
    .sort((a, b) => b.quality - a.quality)
    .map((t) => t.tag)
}

function matchesLocale(tag: string, htmlLang: string): boolean {
  const normalized = htmlLang.toLowerCase()
  return tag === normalized || tag.startsWith(`${normalized}-`) || normalized.startsWith(`${tag}-`)
}
