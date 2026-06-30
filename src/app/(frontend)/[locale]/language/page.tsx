import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  LOCALES,
  getLocale,
  match,
  pathForLocale,
  stripLocalePrefix,
} from '@/lib/i18n'
import { findAllPostSlugs } from '@/lib/server/payload'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: code } = await params
  const locale = getLocale(code)
  if (!locale) return {}
  const t = await match([locale.tag])
  return {
    title: t.language,
    robots: { index: false, follow: false },
    alternates: { canonical: pathForLocale('/language', locale) },
  }
}

function safeFrom(raw: string | string[] | undefined): string {
  if (typeof raw !== 'string') return '/'
  if (!raw.startsWith('/')) return '/'
  if (raw.startsWith('//') || raw.startsWith('/\\')) return '/'
  return raw
}

export default async function LanguagePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale: code } = await params
  const current = getLocale(code)
  if (!current) notFound()
  const sp = await searchParams
  const from = safeFrom(sp.from)
  const languagePath = pathForLocale('/language', current)
  const isFromLanguagePage = from === languagePath
  const safeReturn = isFromLanguagePage ? pathForLocale('/', current) : from
  const { path } = stripLocalePrefix(isFromLanguagePage ? '/' : from)
  const t = await match([current.tag])
  const counts = await Promise.all(LOCALES.map((l) => findAllPostSlugs(l)))
  const countByLocale = new Map(LOCALES.map((l, i) => [l.code, counts[i]?.length ?? 0]))

  return (
    <div className="grid-snap-children flex flex-col gap-(--spacing-gutter)">
      <h2 className="flex items-start text-title font-bold leading-none break-words">
        <span className="pb-(--spacing-gutter)">{t.language}</span>
      </h2>
      <ul className="flex flex-col gap-(--spacing-gutter)">
        {LOCALES.map((l) => {
          const isActive = l.code === current.code
          const target = isActive ? safeReturn : pathForLocale(path, l)
          return (
            <li key={l.code}>
              <Link
                href={target}
                hrefLang={l.htmlLang}
                lang={l.htmlLang}
                aria-current={isActive ? 'true' : undefined}
                className={`inline-flex items-center gap-(--spacing-gutter) text-subtitle leading-none transition-colors ${
                  isActive
                    ? 'font-bold text-foreground'
                    : 'font-normal text-foreground hover:text-accent'
                }`}
              >
                <span>
                  {l.label} ({countByLocale.get(l.code) ?? 0})
                </span>
                {isActive && <span aria-hidden className="text-muted">•</span>}
              </Link>
            </li>
          )
        })}
      </ul>
      <div>
        <Link
          href={safeReturn}
          aria-label={t.backToHome}
          className="inline-flex size-(--spacing-cell) items-center justify-center bg-foreground text-background text-4xl transition-colors hover:bg-muted hover:text-foreground"
        >
          ←
        </Link>
      </div>
    </div>
  )
}
