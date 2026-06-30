import { revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { tags } from '../lib/server/revalidate'

export const About: GlobalConfig = {
  slug: 'about',
  access: {
    read: () => true,
  },
  fields: [{ name: 'content', type: 'richText', localized: true }],
  hooks: {
    afterChange: [
      (({ context }) => {
        if (context?.skipRevalidate) return
        revalidateTag(tags.about(), 'default')
      }) satisfies GlobalAfterChangeHook,
    ],
  },
}
