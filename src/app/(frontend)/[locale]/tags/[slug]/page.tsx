import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/server/seo'
import { findPostsByTag, findTagBySlug } from '@/lib/server/payload'
import { getLocale, match } from '@/lib/i18n'
import PostsList from '../../posts-list'

type PageParams = { locale: string; slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { locale: code, slug } = await params
  const locale = getLocale(code)
  if (!locale) return {}
  const tag = await findTagBySlug(slug, locale)
  if (!tag) return {}
  return buildMetadata({
    meta: tag.meta,
    fallbackTitle: tag.name,
    fallbackDescription: tag.description ?? undefined,
    path: `/tags/${tag.slug}`,
    locale,
  })
}

export default async function TagPage({ params }: { params: Promise<PageParams> }) {
  const { locale: code, slug } = await params
  const locale = getLocale(code)
  if (!locale) notFound()
  const tag = await findTagBySlug(slug, locale)
  if (!tag) notFound()
  const posts = await findPostsByTag(slug, locale)
  const t = await match([locale.tag])

  return (
    <>
      <div className="grid-snap-children flex flex-col gap-(--spacing-gutter)">
        <h2 className="flex items-start text-title font-bold leading-none break-words">
          <span className="pb-(--spacing-gutter)">#{tag.name}</span>
        </h2>
        {tag.description && (
          <p className="grid-prose-w text-body leading-[1.5]">{tag.description}</p>
        )}
      </div>
      {posts.length === 0 ? (
        <p className="text-body leading-[1.5]">{t.noTaggedPosts}</p>
      ) : (
        <>
          <hr className="-ml-(--spacing-inset) w-screen border-0 border-t border-foreground [min-block-size:0]" />
          <PostsList posts={posts} locale={locale} />
        </>
      )}
    </>
  )
}
