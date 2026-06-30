import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media } from '@/payload-types'
import { buildMetadata } from '@/lib/server/seo'
import { cfImage } from '@/lib/cf-image'
import { findPostBySlug } from '@/lib/server/payload'
import { getLocale, match, pathForLocale } from '@/lib/i18n'
import PostCover from '../../post-cover'
import LightboxGallery from '../../lightbox-gallery'
import ShareButton from '../../share-button'
import TagChips from '../../tag-chips'
import { buildConverters } from '../../rich-text-converters'
import BackLink from './back-link'

type PageParams = { locale: string; slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { locale: code, slug } = await params
  const locale = getLocale(code)
  if (!locale) return {}
  const post = await findPostBySlug(slug, locale)
  if (!post) return {}
  const cover = typeof post.cover === 'object' ? (post.cover as Media) : null
  return buildMetadata({
    meta: post.meta,
    fallbackTitle: post.title,
    fallbackDescription: post.description ?? undefined,
    fallbackImage: cover,
    path: `/posts/${post.slug}`,
    locale,
  })
}

export default async function PostPage({ params }: { params: Promise<PageParams> }) {
  const { locale: code, slug } = await params
  const locale = getLocale(code)
  if (!locale) notFound()
  const post = await findPostBySlug(slug, locale)
  if (!post) redirect(pathForLocale('/', locale))

  const t = await match([locale.tag])
  const cover = post.cover
  const coverMedia = typeof cover === 'object' && cover ? cover : null
  const author = typeof post.author === 'object' ? post.author : null
  const date = new Date(post.createdAt).toLocaleDateString(locale.dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const scope = `post-${post.id}`

  return (
    <LightboxGallery>
    <div
      data-post-scope={scope}
      className="grid-snap-children flex flex-col gap-(--spacing-gutter)"
    >
      {coverMedia?.url && (
        <PostCover
          src={coverMedia.url}
          alt={coverMedia.alt ?? ''}
          scope={scope}
          accent={coverMedia.accent ?? null}
        />
      )}
      <h2 className="flex items-start text-title font-bold leading-none break-words">
        <span
          className="grid-title-w bg-foreground bg-cover bg-center bg-clip-text pb-(--spacing-gutter) text-transparent brightness-50"
          style={
            coverMedia?.url
              ? { backgroundImage: `url(${cfImage(coverMedia.url, { width: 1600 })})` }
              : undefined
          }
        >
          {post.title}
        </span>
      </h2>
      <div className="flex flex-col items-start gap-(--spacing-gutter) text-subtitle leading-none">
        {author?.name && <span className="font-normal">{author.name}</span>}
        <time dateTime={post.createdAt} className="font-light">
          {date}
        </time>
      </div>
      <TagChips tags={post.tags} locale={locale} />
      {post.content && (
        <article className="grid-snap-deep grid-prose-w flex flex-col gap-(--spacing-gutter) text-body leading-[1.5]">
          <RichText
            data={post.content}
            disableContainer
            converters={buildConverters(coverMedia?.url ?? null)}
          />
        </article>
      )}
      <div className="flex gap-(--spacing-gutter)">
        <BackLink
          fallbackHref={pathForLocale('/', locale)}
          aria-label={t.backToHome}
          className="flex size-[var(--spacing-cell)] items-center justify-center bg-foreground text-background text-4xl transition-colors hover:bg-muted hover:text-foreground"
        >
          ←
        </BackLink>
        <ShareButton
          slug={post.slug}
          title={post.title}
          locale={locale}
        />
      </div>
    </div>
    </LightboxGallery>
  )
}
