import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { buildMetadata } from '@/lib/server/seo'
import { getAbout } from '@/lib/server/payload'
import { getLocale, match } from '@/lib/i18n'
import { buildConverters } from '../rich-text-converters'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: code } = await params
  const locale = getLocale(code)
  if (!locale) return {}
  const about = await getAbout(locale)
  const t = await match([locale.tag])
  return buildMetadata({
    meta: about.meta,
    fallbackTitle: t.about,
    path: '/about',
    locale,
  })
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: code } = await params
  const locale = getLocale(code)
  if (!locale) notFound()
  const about = await getAbout(locale)
  const t = await match([locale.tag])

  return (
    <div className="grid-snap-children flex flex-col gap-(--spacing-gutter)">
      <h2 className="flex items-start text-title font-bold leading-none break-words">
        <span className="pb-(--spacing-gutter)">{t.about}</span>
      </h2>
      {about.content && (
        <article className="grid-snap-deep grid-prose-w flex flex-col gap-(--spacing-gutter) text-body leading-[1.5]">
          <RichText
            data={about.content}
            disableContainer
            converters={buildConverters(null)}
          />
        </article>
      )}
    </div>
  )
}
