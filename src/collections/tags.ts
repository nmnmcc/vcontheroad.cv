import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  FieldHook,
} from 'payload'
import { tags } from '../lib/server/revalidate'
import { pickLocalized, slugify } from '../lib/server/slug'

type TagDoc = {
  id: number
  name?: string | Record<string, string> | null
  slug: string
  description?: string | Record<string, string> | null
}

function revalidateAll(tagValues: string[]): void {
  for (const t of new Set(tagValues)) revalidateTag(t, 'default')
}

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
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
            const name = pickLocalized(data, 'name', req?.locale)
            if (name) return slugify(name)
            return typeof value === 'string' ? value : ''
          }) satisfies FieldHook,
        ],
      },
    },
    { name: 'description', type: 'textarea', localized: true },
  ],
  hooks: {
    afterChange: [
      (async ({ doc, previousDoc, operation }) => {
        const next = doc as TagDoc
        const prev = previousDoc as TagDoc | undefined
        const bump: string[] = [tags.tagsList(), tags.postsList()]
        if (next.slug) {
          bump.push(tags.tag(next.slug))
          bump.push(tags.postsByTag(next.slug))
        }
        if (operation === 'create') {
          bump.push(tags.tagsSlugs())
        } else if (prev?.slug && prev.slug !== next.slug) {
          bump.push(tags.tag(prev.slug))
          bump.push(tags.postsByTag(prev.slug))
          bump.push(tags.tagsSlugs())
        }
        revalidateAll(bump)
      }) satisfies CollectionAfterChangeHook,
    ],
    afterDelete: [
      (async ({ doc }) => {
        const tag = doc as TagDoc | undefined
        const bump: string[] = [tags.tagsList(), tags.tagsSlugs(), tags.postsList()]
        if (tag?.slug) {
          bump.push(tags.tag(tag.slug))
          bump.push(tags.postsByTag(tag.slug))
        }
        revalidateAll(bump)
      }) satisfies CollectionAfterDeleteHook,
    ],
  },
}
