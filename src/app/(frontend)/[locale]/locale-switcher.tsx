'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALES, pathForLocale, type LocaleConfig } from '@/lib/i18n'

export default function LocaleSwitcher({
  locale,
  label,
}: {
  locale: LocaleConfig
  label: string
}) {
  const pathname = usePathname()
  const target = pathForLocale('/language', locale)
  if (LOCALES.length < 2) return null
  if (pathname === target) return null

  const href = `${target}?from=${encodeURIComponent(pathname)}`

  return (
    <Link
      href={href}
      className="grid-snap-w shrink-0 whitespace-pre transition-colors hover:text-muted"
    >
      {label}
    </Link>
  )
}
