import React from 'react'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import Header from './header'
import { SITE_URL } from '@/lib/server/seo'
import { getSiteSettings } from '@/lib/server/payload'
import { DEFAULT_LOCALE, LOCALES, getLocale, pathForLocale } from '@/lib/i18n'
import './styles/index.css'
import '@ibm/plex-mono/css/ibm-plex-mono-default.min.css'
import '@ibm/plex-sans-sc/css/ibm-plex-sans-sc-default.min.css'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: code } = await params
  const locale = getLocale(code)
  if (!locale) return {}
  const settings = await getSiteSettings(locale)
  const siteName = settings.shortName
  const description = settings.subtitle ?? undefined
  const favicon = typeof settings.favicon === 'object' ? settings.favicon : null
  const icons: Metadata['icons'] = favicon?.url
    ? {
        icon: [{ url: favicon.url, type: favicon.mimeType ?? undefined }],
        apple: favicon.url,
      }
    : undefined

  const canonical = pathForLocale('/', locale)
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l.htmlLang] = pathForLocale('/', l)
  languages['x-default'] = pathForLocale('/', DEFAULT_LOCALE)

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteName, template: `%s — ${siteName}` },
    description,
    applicationName: siteName,
    alternates: { canonical, languages },
    icons,
    openGraph: {
      type: 'website',
      siteName,
      title: siteName,
      description,
      url: canonical,
      locale: locale.ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: 'oklch(1 0 0)',
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: code } = await params
  const locale = getLocale(code)
  if (!locale) notFound()

  return (
    <html lang={locale.htmlLang}>
      <body className="grid min-h-dvh place-items-start p-(--spacing-inset)">
        <Main>
          <div className="grid-snap-children flex flex-col gap-(--spacing-gutter)">
            <Header locale={locale} />
            {children}
          </div>
        </Main>
      </body>
    </html>
  )
}

function Main({ children }: React.PropsWithChildren) {
  return <main className="grid-fit-w">{children}</main>
}
