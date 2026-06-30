import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/server/seo'
import { findAllTags } from '@/lib/server/payload'
import { getLocale, match, pathForLocale } from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: code } = await params
  const locale = getLocale(code)
  if (!locale) return {}
  const t = await match([locale.tag])
  return buildMetadata({
    fallbackTitle: t.tags,
    path: '/tags',
    locale,
  })
}

export default async function TagsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: code } = await params
  const locale = getLocale(code)
  if (!locale) notFound()
  const allTags = await findAllTags(locale)
  const t = await match([locale.tag])

  return (
    <div className="grid-snap-children flex flex-col gap-(--spacing-gutter)">
      <h2 className="flex items-start text-title font-bold leading-none break-words">
        <span className="pb-(--spacing-gutter)">{t.tags}</span>
      </h2>
      {allTags.length === 0 ? (
        <p className="text-body leading-[1.5]">{t.noTaggedPosts}</p>
      ) : (
        <ul className="flex flex-wrap gap-(--spacing-gutter) text-subtitle leading-none">
          {allTags.map((tag) => (
            <li key={tag.id}>
              <Link
                href={pathForLocale(`/tags/${tag.slug}`, locale)}
                className="grid-snap-w inline-flex h-(--spacing-cell) items-center text-foreground transition-colors hover:text-muted"
              >
                #{tag.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
