import { revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { tags } from '../lib/server/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'vcontheroad' },
    { name: 'suffix', type: 'text', defaultValue: '.cv' },
    { name: 'subtitle', type: 'text', defaultValue: 'Vincent Chow On The Road', localized: true },
    {
      name: 'favicon',
      label: 'Favicon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Recommend SVG or a square PNG (at least 256×256).',
      },
    },
    {
      name: 'shortName',
      label: 'Short name',
      type: 'text',
      required: true,
      defaultValue: 'VCCV',
      admin: {
        description: 'Short site name used for SEO metadata and the brand suffix.',
      },
    },
  ],
  hooks: {
    afterChange: [
      (({ context }) => {
        if (context?.skipRevalidate) return
        revalidateTag(tags.siteSettings(), 'default')
      }) satisfies GlobalAfterChangeHook,
    ],
  },
}
