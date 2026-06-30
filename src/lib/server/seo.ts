import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import { DEFAULT_LOCALE, LOCALES, pathForLocale, type LocaleConfig } from '../i18n'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vcontheroad.cv'

type MetaGroup = {
  title?: string | null
  description?: string | null
  image?: (number | null) | Media
}

const resolveImage = (image?: MetaGroup['image']): Media | null =>
  typeof image === 'object' && image ? image : null

export function buildMetadata({
  meta,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  path,
  locale,
}: {
  meta?: MetaGroup | undefined
  fallbackTitle?: string | undefined
  fallbackDescription?: string | undefined
  fallbackImage?: Media | null | undefined
  path: string
  locale: LocaleConfig
}): Metadata {
  const title = meta?.title || fallbackTitle
  const description = meta?.description || fallbackDescription || undefined
  const image = resolveImage(meta?.image) ?? fallbackImage ?? null
  const canonical = pathForLocale(path, locale)

  const languages: Record<string, string> = {}
  for (const l of LOCALES) {
    languages[l.htmlLang] = pathForLocale(path, l)
  }
  languages['x-default'] = pathForLocale(path, DEFAULT_LOCALE)

  const openGraph: Metadata['openGraph'] = {
    title: title ?? undefined,
    description,
    url: canonical,
    type: 'article',
    locale: locale.ogLocale,
    images: image?.url ? [{ url: image.url, alt: image.alt ?? title ?? '' }] : undefined,
  }

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph,
    twitter: {
      card: image?.url ? 'summary_large_image' : 'summary',
      title: title ?? undefined,
      description,
      images: image?.url ? [image.url] : undefined,
    },
  }
}
