'use client'
import Link from 'next/link'
import { useRef } from 'react'
import type { PostSummary } from '@/lib/server/payload'
import { pathForLocale, type LocaleConfig } from '@/lib/i18n'
import { useTranslation } from '@/lib/client/i18n'
import { cfImage } from '@/lib/cf-image'
import CoverTheme from './cover-theme'
import AccentFigure from './accent-figure'
import FullscreenImage from './fullscreen-image'
import ShareButton from './share-button'
import TagChips from './tag-chips'

export default function PostView({
  post,
  collapsed,
  onToggle,
  locale,
}: {
  post: PostSummary
  collapsed: boolean
  onToggle: () => void
  locale: LocaleConfig
}) {
  const [t] = useTranslation([locale.tag])
  const cover = post.cover
  const coverMedia = typeof cover === 'object' && cover ? cover : null
  const author = typeof post.author === 'object' ? post.author : null
  const date = new Date(post.createdAt).toLocaleDateString(locale.dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const scope = `post-${post.id}`
  const paragraphs = post.description?.split(/\n\n+/).filter(Boolean) ?? []
  const headingRef = useRef<HTMLHeadingElement>(null)

  const activate = () => {
    if (typeof window === 'undefined') {
      onToggle()
      return
    }
    const heading = headingRef.current
    if (!heading) {
      onToggle()
      return
    }
    const section = heading.closest('section')
    const anchor = heading.getBoundingClientRect().top

    onToggle()
    window.history.replaceState(null, '', `#${scope}`)

    if (!section) return

    const pin = () => {
      const delta = heading.getBoundingClientRect().top - anchor
      if (delta !== 0) window.scrollBy(0, delta)
    }
    const ro = new ResizeObserver(pin)
    ro.observe(section)
    window.setTimeout(() => ro.disconnect(), 600)
  }

  return (
    <section
      id={scope}
      data-post-scope={scope}
      style={{ minBlockSize: 0 }}
      className="grid-snap-children flex scroll-mt-(--spacing-inset) flex-col"
    >
      {coverMedia?.url && (
        <CoverTheme
          accent={coverMedia.accent ?? null}
          targetSelector={`[data-post-scope="${scope}"]`}
        />
      )}
      {coverMedia?.url && (
        <div
          aria-hidden={collapsed}
          style={{ minBlockSize: 0 }}
          className={`grid transition-[grid-template-rows,padding,opacity] duration-300 ease-in-out ${
            collapsed
              ? 'grid-rows-[0fr] pb-0 opacity-0'
              : 'grid-rows-[1fr] pb-[var(--spacing-gutter)] opacity-100'
          }`}
        >
          <div className="min-h-0 overflow-x-visible overflow-y-clip">
            <AccentFigure
              accent={coverMedia.accent ?? null}
              className="-ms-(--spacing-inset) flex w-screen flex-wrap items-start gap-(--spacing-gutter) bg-none px-(--spacing-inset) [min-block-size:0]"
            >
              <FullscreenImage
                src={cfImage(coverMedia.url, { width: 2400 })}
                alt={coverMedia.alt ?? ''}
                className="grid-figure"
              />
            </AccentFigure>
          </div>
        </div>
      )}
      <h2
        ref={headingRef}
        onClick={(e) => {
          e.preventDefault()
          activate()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            activate()
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={collapsed}
        aria-controls={`${scope}-body`}
        className="flex cursor-pointer items-start text-title font-bold leading-none break-words select-none"
      >
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
      <div
        id={`${scope}-body`}
        aria-hidden={collapsed}
        style={{ minBlockSize: 0 }}
        className={`flex flex-col gap-[var(--spacing-gutter)] overflow-hidden transition-[height,padding,opacity] duration-300 ease-in-out ${
          collapsed ? 'h-0 pt-0 opacity-0' : 'h-auto pt-[var(--spacing-gutter)] opacity-100'
        }`}
      >
        <div className="flex flex-col items-start gap-[var(--spacing-gutter)] text-subtitle leading-none">
          {author?.name && <span className="font-normal">{author.name}</span>}
          <time dateTime={post.createdAt} className="font-light">
            {date}
          </time>
        </div>
        <TagChips tags={post.tags} locale={locale} tabIndex={collapsed ? -1 : 0} />
        {paragraphs.length > 0 && (
          <article className="grid-snap-deep grid-prose-w flex flex-col gap-[var(--spacing-gutter)] text-body leading-[1.5]">
            {paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </article>
        )}
        <div className="flex gap-[var(--spacing-gutter)]">
          <Link
            href={pathForLocale(`/posts/${post.slug}`, locale)}
            aria-label={`${t.readPost} ${post.title}`}
            tabIndex={collapsed ? -1 : 0}
            className="flex size-[var(--spacing-cell)] items-center justify-center bg-foreground text-background text-4xl transition-colors hover:bg-muted hover:text-foreground"
          >
            →
          </Link>
          <ShareButton
            slug={post.slug}
            title={post.title}
            locale={locale}
            tabIndex={collapsed ? -1 : 0}
          />
        </div>
      </div>
    </section>
  )
}
