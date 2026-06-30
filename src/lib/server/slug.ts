import { DEFAULT_LOCALE } from '../i18n'

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

export function pickLocalized(
  data: unknown,
  field: string,
  reqLocale?: string,
): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const value = (data as Record<string, unknown>)[field]
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const map = value as Record<string, unknown>
    const fromDefault = map[DEFAULT_LOCALE.code]
    if (typeof fromDefault === 'string' && fromDefault.length > 0) return fromDefault
    if (reqLocale) {
      const fromReq = map[reqLocale]
      if (typeof fromReq === 'string' && fromReq.length > 0) return fromReq
    }
    for (const v of Object.values(map)) {
      if (typeof v === 'string' && v.length > 0) return v
    }
  }
  return undefined
}
