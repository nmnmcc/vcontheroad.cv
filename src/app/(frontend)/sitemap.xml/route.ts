import { unstable_cache } from 'next/cache'
import { create } from 'xmlbuilder2'

import { LOCALES, DEFAULT_LOCALE, pathForLocale, type LocaleConfig } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/server/payload'
import { tags } from '@/lib/server/revalidate'
import { SITE_URL } from '@/lib/server/seo'

type UrlEntry = {
  path: string
  locales: LocaleConfig[]
  lastmod?: string
}

type LocaleDoc = { slug?: string | null; updatedAt?: string | null }

type LocaleDocs = { locale: LocaleConfig; docs: LocaleDoc[] }

const absoluteUrl = (path: string, locale: LocaleConfig): string =>
  `${SITE_URL}${pathForLocale(path, locale)}`

const latest = (values: (string | null | undefined)[]): string | undefined => {
  const valid = values.filter((v): v is string => typeof v === 'string' && v.length > 0)
  return valid.length === 0 ? undefined : valid.sort().at(-1)
}

const canonicalLocale = (locales: LocaleConfig[]): LocaleConfig =>
  locales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : locales[0]!

const alternateLinks = (entry: UrlEntry) => {
  const hrefs = entry.locales.map((l) => ({
    '@rel': 'alternate',
    '@hreflang': l.tag,
    '@href': absoluteUrl(entry.path, l),
  }))
  hrefs.push({
    '@rel': 'alternate',
    '@hreflang': 'x-default',
    '@href': absoluteUrl(entry.path, canonicalLocale(entry.locales)),
  })
  return hrefs
}

const renderUrl = (entry: UrlEntry) => ({
  loc: absoluteUrl(entry.path, canonicalLocale(entry.locales)),
  ...(entry.lastmod ? { lastmod: entry.lastmod } : {}),
  'xhtml:link': alternateLinks(entry),
})

const groupByLocale = (
  perLocale: LocaleDocs[],
): Map<string, { locales: LocaleConfig[]; updatedAt: string[] }> => {
  const map = new Map<string, { locales: LocaleConfig[]; updatedAt: string[] }>()
  for (const { locale, docs } of perLocale) {
    for (const doc of docs) {
      if (typeof doc.slug !== 'string') continue
      const entry = map.get(doc.slug) ?? { locales: [], updatedAt: [] }
      entry.locales.push(locale)
      if (typeof doc.updatedAt === 'string') entry.updatedAt.push(doc.updatedAt)
      map.set(doc.slug, entry)
    }
  }
  return map
}

const buildSitemap = unstable_cache(
  async (): Promise<string> => {
    const payload = await getPayloadClient()

    const fetchPerLocale = async (
      collection: 'posts' | 'tags',
      select: Record<string, true>,
      titleKey: 'title' | 'name',
    ): Promise<LocaleDocs[]> =>
      Promise.all(
        LOCALES.map(async (locale) => {
          const { docs } = await payload.find({
            collection,
            pagination: false,
            depth: 0,
            locale: locale.code,
            fallbackLocale: 'none',
            select,
            overrideAccess: false,
          })
          const filtered = (docs as unknown as Record<string, unknown>[]).filter((d) => {
            const title = d[titleKey]
            return typeof title === 'string' && title.length > 0
          })
          return { locale, docs: filtered as LocaleDoc[] }
        }),
      )

    const [postsByLocale, tagsByLocale] = await Promise.all([
      fetchPerLocale('posts', { slug: true, title: true, updatedAt: true }, 'title'),
      fetchPerLocale('tags', { slug: true, name: true, updatedAt: true }, 'name'),
    ])

    const postsMap = groupByLocale(postsByLocale)
    const tagsMap = groupByLocale(tagsByLocale)

    const allDates = (perLocale: LocaleDocs[]) =>
      perLocale.flatMap(({ docs }) => docs.map((d) => d.updatedAt ?? null))

    const entries: UrlEntry[] = [
      { path: '/', locales: [...LOCALES], lastmod: latest(allDates(postsByLocale)) },
      { path: '/about', locales: [...LOCALES] },
      { path: '/tags', locales: [...LOCALES], lastmod: latest(allDates(tagsByLocale)) },
      ...[...postsMap].map(([slug, { locales, updatedAt }]) => ({
        path: `/posts/${slug}`,
        locales,
        lastmod: latest(updatedAt),
      })),
      ...[...tagsMap].map(([slug, { locales, updatedAt }]) => ({
        path: `/tags/${slug}`,
        locales,
        lastmod: latest(updatedAt),
      })),
    ]

    return create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
      })
      .ele({ url: entries.map(renderUrl) })
      .end({ prettyPrint: true })
  },
  ['sitemap'],
  { tags: [tags.postsList(), tags.tagsList()] },
)

export async function GET(): Promise<Response> {
  const body = await buildSitemap()
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
