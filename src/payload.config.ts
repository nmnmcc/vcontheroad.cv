import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import type { PayloadLogger } from 'payload'
import { fileURLToPath } from 'url'
import type { CloudflareContext } from '@opennextjs/cloudflare'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type {
  GenerateTitle,
  GenerateDescription,
  GenerateURL,
  GenerateImage,
} from '@payloadcms/plugin-seo/types'

import { Users } from './collections/users'
import { Media } from './collections/media'
import { Posts } from './collections/posts'
import { Tags } from './collections/tags'
import { About } from './globals/about'
import { SiteSettings } from './globals/site-settings'
import { cloudflareEmailAdapter } from './email/cloudflare-email-adapter'
import { migrations } from './migrations'
import { SITE_URL } from './lib/server/seo'
import { LOCALES, DEFAULT_LOCALE, pathForLocale, getLocale } from './lib/i18n'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some(
  (value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')) ?? false,
)
const isProduction = process.env.NODE_ENV === 'production'
const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build'

function getPayloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET?.trim()
  if (secret) return secret
  if (isProduction && !isProductionBuild) {
    throw new Error('PAYLOAD_SECRET is required in production. Set it with `wrangler secret put PAYLOAD_SECRET`.')
  }
  return 'development-only-payload-secret-change-me'
}

const createLog =
  (level: string, fn: (...args: unknown[]) => void) =>
  (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

// PayloadLogger is Pino's full Logger interface; we only implement the level
// methods Payload actually invokes. Double cast through `unknown` acknowledges
// the structural gap while keeping the consumer type honest.
const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as unknown as PayloadLogger

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

const generateTitle: GenerateTitle = ({ doc }) => (typeof doc?.title === 'string' ? doc.title : '')

const generateDescription: GenerateDescription = ({ doc }) =>
  typeof doc?.description === 'string' ? doc.description : ''

const generateURL: GenerateURL = ({ doc, collectionSlug, globalSlug, locale }) => {
  const localeConfig = getLocale(locale) ?? DEFAULT_LOCALE
  const base = (path: string) => `${SITE_URL}${pathForLocale(path, localeConfig)}`
  if (globalSlug === 'about') return base('/about')
  if (collectionSlug === 'posts' && doc?.slug) return base(`/posts/${doc.slug}`)
  if (collectionSlug === 'tags' && doc?.slug) return base(`/tags/${doc.slug}`)
  return base('/')
}

const generateImage: GenerateImage = ({ doc }) => {
  const cover = doc?.cover
  if (typeof cover === 'number') return cover
  if (cover && typeof cover === 'object' && typeof cover.id === 'number') return cover.id
  return ''
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, Tags],
  globals: [SiteSettings, About],
  editor: lexicalEditor(),
  localization: {
    locales: LOCALES.map(({ code, label }) => ({ code, label })),
    defaultLocale: DEFAULT_LOCALE.code,
    fallback: true,
  },
  graphQL: {
    disable: true,
  },
  secret: getPayloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    prodMigrations: migrations,
    push: false,
  }),
  email: cloudflareEmailAdapter({
    binding: cloudflare.env.EMAIL,
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@vcontheroad.cv',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'vcontheroad',
  }),
  ...(isProduction && { logger: cloudflareLogger }),
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
    seoPlugin({
      collections: ['posts', 'tags'],
      globals: ['about'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle,
      generateDescription,
      generateURL,
      generateImage,
      fields: ({ defaultFields }) =>
        defaultFields.map((field) => {
          if ('name' in field && (field.name === 'title' || field.name === 'description')) {
            return { ...field, localized: true }
          }
          return field
        }),
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        ...(process.env.CLOUDFLARE_ENV && { environment: process.env.CLOUDFLARE_ENV }),
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}
