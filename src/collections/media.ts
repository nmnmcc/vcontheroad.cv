import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

const computeAccent: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== 'create' && operation !== 'update') return data
  const buffer = req.file?.data
  if (!buffer || buffer.length === 0) return data
  try {
    const { extractAccent } = await import('../lib/server/extract-accent')
    const accent = await extractAccent(new Uint8Array(buffer))
    if (accent !== null) data.accent = accent
  } catch (err) {
    req.payload.logger.warn({
      msg: 'media.accent extraction failed',
      err: err instanceof Error ? { name: err.name, message: err.message } : err,
    })
  }
  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [computeAccent],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'accent',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Dominant color (Material ARGB int) extracted at upload time.',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png'],
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
  },
}
