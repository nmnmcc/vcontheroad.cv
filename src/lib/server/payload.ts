import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { About, Post, SiteSetting, Tag } from '@/payload-types'
import { DEFAULT_LOCALE, type LocaleConfig } from '../i18n'
import { tags } from './revalidate'

export type PostSummary = Pick<
  Post,
  'id' | 'title' | 'slug' | 'cover' | 'description' | 'author' | 'createdAt' | 'tags'
>

export type TagSummary = Pick<Tag, 'id' | 'name' | 'slug' | 'description'>

export const getPayloadClient = cache(() => getPayload({ config }))

function hasLocaleContent(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0
}

export const getSiteSettings = cache(
  (locale: LocaleConfig): Promise<SiteSetting> =>
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        return payload.findGlobal({
          slug: 'site-settings',
          depth: 1,
          locale: locale.code,
          fallbackLocale: DEFAULT_LOCALE.code,
        })
      },
      ['site-settings', locale.code],
      { tags: [tags.siteSettings(), tags.siteSettings(locale.code)] },
    )(),
)

export const getAbout = cache(
  (locale: LocaleConfig): Promise<About> =>
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        return payload.findGlobal({
          slug: 'about',
          depth: 1,
          locale: locale.code,
          fallbackLocale: DEFAULT_LOCALE.code,
        })
      },
      ['about', locale.code],
      { tags: [tags.about(), tags.about(locale.code)] },
    )(),
)

export const findPostBySlug = cache(
  (slug: string, locale: LocaleConfig): Promise<Post | null> =>
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        const { docs } = await payload.find({
          collection: 'posts',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
          locale: locale.code,
          fallbackLocale: 'none',
          overrideAccess: false,
        })
        const post = docs[0]
        if (!post || !hasLocaleContent(post.title)) return null
        return post
      },
      ['post', slug, locale.code],
      { tags: [tags.post(slug), tags.post(slug, locale.code)] },
    )(),
)

const postSummarySelect = {
  title: true,
  slug: true,
  cover: true,
  description: true,
  author: true,
  createdAt: true,
  tags: true,
} satisfies { [K in keyof Omit<PostSummary, 'id'>]: true }

export const findAllPosts = cache(
  (locale: LocaleConfig): Promise<PostSummary[]> =>
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        const { docs } = await payload.find({
          collection: 'posts',
          pagination: false,
          sort: '-createdAt',
          depth: 1,
          locale: locale.code,
          fallbackLocale: 'none',
          select: postSummarySelect,
          overrideAccess: false,
        })
        return (docs as PostSummary[]).filter((d) => hasLocaleContent(d.title))
      },
      ['posts:list', locale.code],
      { tags: [tags.postsList(), tags.postsList(locale.code)] },
    )(),
)

export const findAllPostSlugs = cache(
  (locale: LocaleConfig): Promise<string[]> =>
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        const { docs } = await payload.find({
          collection: 'posts',
          pagination: false,
          depth: 0,
          locale: locale.code,
          fallbackLocale: 'none',
          select: { slug: true, title: true },
          overrideAccess: false,
        })
        return docs
          .filter((d) => hasLocaleContent(d.title))
          .map((d) => d.slug)
          .filter((s): s is string => typeof s === 'string')
      },
      ['posts:slugs', locale.code],
      { tags: [tags.postsSlugs(), tags.postsSlugs(locale.code)] },
    )(),
)

const tagSummarySelect = {
  name: true,
  slug: true,
  description: true,
} satisfies { [K in keyof Omit<TagSummary, 'id'>]: true }

export const findAllTags = cache(
  (locale: LocaleConfig): Promise<TagSummary[]> =>
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        const { docs } = await payload.find({
          collection: 'tags',
          pagination: false,
          sort: 'name',
          depth: 0,
          locale: locale.code,
          fallbackLocale: 'none',
          select: tagSummarySelect,
          overrideAccess: false,
        })
        return (docs as TagSummary[]).filter((t) => hasLocaleContent(t.name))
      },
      ['tags:list', locale.code],
      { tags: [tags.tagsList(), tags.tagsList(locale.code)] },
    )(),
)

export const findAllTagSlugs = cache(
  (locale: LocaleConfig): Promise<string[]> =>
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        const { docs } = await payload.find({
          collection: 'tags',
          pagination: false,
          depth: 0,
          locale: locale.code,
          fallbackLocale: 'none',
          select: { slug: true, name: true },
          overrideAccess: false,
        })
        return docs
          .filter((d) => hasLocaleContent(d.name))
          .map((d) => d.slug)
          .filter((s): s is string => typeof s === 'string')
      },
      ['tags:slugs', locale.code],
      { tags: [tags.tagsSlugs(), tags.tagsSlugs(locale.code)] },
    )(),
)

export const findTagBySlug = cache(
  (slug: string, locale: LocaleConfig): Promise<Tag | null> =>
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        const { docs } = await payload.find({
          collection: 'tags',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 0,
          locale: locale.code,
          fallbackLocale: 'none',
          overrideAccess: false,
        })
        const tag = docs[0]
        if (!tag || !hasLocaleContent(tag.name)) return null
        return tag
      },
      ['tag', slug, locale.code],
      { tags: [tags.tag(slug), tags.tag(slug, locale.code)] },
    )(),
)

export const findPostsByTag = cache(
  (slug: string, locale: LocaleConfig): Promise<PostSummary[]> =>
    unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        const { docs } = await payload.find({
          collection: 'posts',
          where: { 'tags.slug': { equals: slug } },
          pagination: false,
          sort: '-createdAt',
          depth: 1,
          locale: locale.code,
          fallbackLocale: 'none',
          select: postSummarySelect,
          overrideAccess: false,
        })
        return (docs as PostSummary[]).filter((d) => hasLocaleContent(d.title))
      },
      ['posts:byTag', slug, locale.code],
      { tags: [tags.postsByTag(slug), tags.postsByTag(slug, locale.code)] },
    )(),
)
