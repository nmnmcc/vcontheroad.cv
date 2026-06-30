'use client'
import React, { useState } from 'react'
import type { PostSummary } from '@/lib/server/payload'
import type { LocaleConfig } from '@/lib/i18n'
import PostView from './post-view'

type Props = Readonly<{
  posts: readonly PostSummary[]
  locale: LocaleConfig
}>

export default function PostsList({ posts, locale }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const toggle = () => setCollapsed((v) => !v)
  return (
    <>
      {posts.map((post, i) => (
        <React.Fragment key={post.id}>
          {i > 0 && (
            <hr className="-ml-(--spacing-inset) w-screen border-0 border-t border-foreground [min-block-size:0]" />
          )}
          <PostView post={post} collapsed={collapsed} onToggle={toggle} locale={locale} />
        </React.Fragment>
      ))}
    </>
  )
}
