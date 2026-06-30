import React from 'react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { Media } from '@/payload-types'
import { cfImage } from '@/lib/cf-image'
import UploadFigure from './upload-figure'

const HEADING_SIZE = {
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
  h5: 'text-h5',
  h6: 'text-h6',
} as const

type HeadingTag = keyof typeof HEADING_SIZE

export function buildConverters(coverUrl: string | null): JSXConvertersFunction {
  return ({ defaultConverters }) => ({
    ...defaultConverters,
    horizontalrule: () => (
      <hr className="-ml-(--spacing-inset) w-screen border-0 border-t border-foreground [min-block-size:0]" />
    ),
    quote: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children, parent: node })
      return (
        <blockquote className="relative ms-(--spacing-cell)">
          <span
            aria-hidden
            className="absolute top-0 -start-(--spacing-cell) h-(--spacing-cell) w-[calc(var(--spacing-cell)/3)] bg-accent"
          />
          {children}
        </blockquote>
      )
    },
    list: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children, parent: node })
      const Tag: 'ul' | 'ol' = node.tag === 'ol' ? 'ol' : 'ul'
      return (
        <Tag className="ms-(--spacing-cell) flex list-none flex-col gap-(--spacing-gutter) ps-0">
          {children}
        </Tag>
      )
    },
    listitem: ({ node, nodesToJSX, parent }) => {
      const hasSubLists = node.children.some((c) => c.type === 'list')
      const children = nodesToJSX({ nodes: node.children, parent: node })
      const listType =
        parent && 'listType' in parent
          ? (parent as { listType?: string }).listType
          : undefined

      if (hasSubLists) {
        return (
          <li className="list-none" style={{ listStyleType: 'none' }}>
            {children}
          </li>
        )
      }

      let marker: React.ReactNode
      if (listType === 'number') {
        marker = (
          <span className="text-body font-bold leading-none text-accent [min-block-size:0]">
            {node.value}
          </span>
        )
      } else if (listType === 'check') {
        marker = (
          <span
            className={`block size-[calc(var(--spacing-cell)/2.5)] border-2 border-accent [min-block-size:0] ${
              node.checked ? 'bg-accent' : ''
            }`}
          />
        )
      } else {
        marker = (
          <span className="block size-[calc(var(--spacing-cell)/4)] bg-accent [min-block-size:0]" />
        )
      }

      return (
        <li className="relative list-none" style={{ listStyleType: 'none' }}>
          <span
            aria-hidden
            className="absolute top-0 -start-(--spacing-cell) flex h-[1lh] w-(--spacing-cell) items-start justify-start [min-block-size:0]"
          >
            {marker}
          </span>
          <div style={{ marginBlockStart: 'calc((1em - 1lh) / 2)' }}>
            {children}
          </div>
        </li>
      )
    },
    upload: ({ node }) => {
      const doc = typeof node.value === 'object' ? (node.value as Media) : null
      if (!doc?.url) return null
      if (!doc.mimeType?.startsWith('image')) {
        return (
          <a href={doc.url} rel="noopener noreferrer">
            {doc.filename ?? doc.url}
          </a>
        )
      }
      const alt =
        (typeof node.fields?.alt === 'string' && node.fields.alt) || doc.alt || ''
      return (
        <UploadFigure
          src={cfImage(doc.url, { width: 2400 })}
          alt={alt}
          width={doc.width ?? undefined}
          height={doc.height ?? undefined}
          caption={alt || undefined}
          accent={doc.accent ?? null}
        />
      )
    },
    heading: ({ node, nodesToJSX }) => {
      const Tag: HeadingTag = node.tag in HEADING_SIZE ? (node.tag as HeadingTag) : 'h2'
      const children = nodesToJSX({ nodes: node.children, parent: node })
      const filled = Tag === 'h1' || Tag === 'h2'
      return (
        <Tag
          className={`flex items-start ${HEADING_SIZE[Tag]} font-bold leading-none break-words`}
        >
          {filled ? (
            <span
              className="bg-foreground bg-cover bg-center bg-clip-text pb-(--spacing-gutter) text-transparent brightness-50"
              style={
                coverUrl
                  ? { backgroundImage: `url(${cfImage(coverUrl, { width: 1600 })})` }
                  : undefined
              }
            >
              {children}
            </span>
          ) : (
            <span className="text-foreground">{children}</span>
          )}
        </Tag>
      )
    },
  })
}
