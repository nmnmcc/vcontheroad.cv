import { create } from '@nmnmcc/intee'
import type { Config } from '../payload-types'
import zhCN from '../i18n/zh-CN'

export type LocaleCode = Config['locale']

export interface LocaleConfig {
  code: LocaleCode
  tag: string
  label: string
  htmlLang: string
  ogLocale: string
  dateLocale: string
}

export const DEFAULT_LOCALE: LocaleConfig = {
  code: 'zh',
  tag: 'zh-CN',
  label: '中文',
  htmlLang: 'zh-CN',
  ogLocale: 'zh_CN',
  dateLocale: 'zh-CN',
}

export const LOCALES: readonly LocaleConfig[] = [
  DEFAULT_LOCALE,
  {
    code: 'en',
    tag: 'en-US',
    label: 'English',
    htmlLang: 'en',
    ogLocale: 'en_US',
    dateLocale: 'en-US',
  },
] as const

export const languages = [
  { tag: 'zh-CN', data: zhCN },
  {
    tag: 'en-US',
    data: () =>
      import('../i18n/en-US')
        .then((m) => m.default)
        .catch((err) => {
          console.error('i18n: failed to load en-US bundle, falling back to zh-CN', err)
          return zhCN
        }),
  },
] as const

export const match = create(languages)

export function getLocale(code: string | undefined): LocaleConfig | undefined {
  if (!code) return undefined
  return LOCALES.find((l) => l.code === code)
}

export function pathForLocale(path: string, locale: LocaleConfig): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === '/') return `/${locale.code}`
  return `/${locale.code}${normalized}`
}

export function stripLocalePrefix(pathname: string): { locale: LocaleConfig; path: string } {
  const [, first, ...rest] = pathname.split('/')
  const matched = LOCALES.find((l) => l.code === first)
  if (matched) {
    const path = rest.length ? `/${rest.join('/')}` : '/'
    return { locale: matched, path }
  }
  return { locale: DEFAULT_LOCALE, path: pathname || '/' }
}
