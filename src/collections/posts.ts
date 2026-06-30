import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  FieldHook,
  Payload,
} from 'payload'
import type { Post, Tag } from '@/payload-types'
import { tags } from '../lib/server/revalidate'
import { pickLocalized, slugify } from '../lib/server/slug'

type TagRef = number | Tag

async function resolveTagSlugs(
  payload: Payload,
  tagRefs: TagRef[] | null | undefined,
): Promise<string[]> {
  if (!tagRefs || tagRefs.length === 0) return []
  const slugs: string[] = []
  const idsToResolve: number[] = []
  for (const ref of tagRefs) {
    if (typeof ref === 'number') idsToResolve.push(ref)
    else if (ref && typeof ref.slug === 'string') slugs.push(ref.slug)
  }
  if (idsToResolve.length > 0) {
    const { docs } = await payload.find({
      collection: 'tags',
      where: { id: { in: idsToResolve } },
      depth: 0,
      pagination: false,
      select: { slug: true },
      overrideAccess: true,
    })
    for (const doc of docs) {
      if (typeof doc.slug === 'string') slugs.push(doc.slug)
    }
  }
  return slugs
}

function revalidateAll(tagValues: string[]): void {
  for (const t of new Set(tagValues)) revalidateTag(t, 'default')
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'author', '_status', 'updatedAt'],
  },
  versions: {
    drafts: {
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        or: [
          { _status: { equals: 'published' } },
          { _status: { exists: false } },
        ],
      }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          (({ value, data, req }) => {
            if (typeof value === 'string' && value.length > 0) return value
            const title = pickLocalized(data, 'title', req?.locale)
            if (title) return slugify(title)
            return typeof value === 'string' ? value : ''
          }) satisfies FieldHook<Post, string>,
        ],
      },
    },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'content', type: 'richText', localized: true },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
  ],
  hooks: {
    afterChange: [
      (async ({ doc, previousDoc, operation, context, req }) => {
        if (context?.skipRevalidate) return
        const [nextSlugs, prevSlugs] = await Promise.all([
          resolveTagSlugs(req.payload, doc.tags),
          resolveTagSlugs(req.payload, previousDoc?.tags),
        ])
        const bump: string[] = [tags.postsList()]
        for (const slug of new Set<string>([...nextSlugs, ...prevSlugs])) {
          bump.push(tags.postsByTag(slug))
        }
        if (doc.slug) bump.push(tags.post(doc.slug))
        if (operation === 'create') {
          bump.push(tags.postsSlugs())
        } else if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
          bump.push(tags.post(previousDoc.slug))
          bump.push(tags.postsSlugs())
        }
        revalidateAll(bump)
      }) satisfies CollectionAfterChangeHook<Post>,
    ],
    afterDelete: [
      (async ({ doc, context, req }) => {
        if (context?.skipRevalidate) return
        const slugs = await resolveTagSlugs(req.payload, doc?.tags)
        const bump: string[] = [tags.postsList(), tags.postsSlugs()]
        for (const slug of slugs) bump.push(tags.postsByTag(slug))
        if (doc?.slug) bump.push(tags.post(doc.slug))
        revalidateAll(bump)
      }) satisfies CollectionAfterDeleteHook<Post>,
    ],
  },
}
