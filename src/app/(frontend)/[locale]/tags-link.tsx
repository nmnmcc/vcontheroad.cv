import Link from 'next/link'
import { pathForLocale, type LocaleConfig } from '@/lib/i18n'

export default function TagsLink({
  locale,
  label,
}: {
  locale: LocaleConfig
  label: string
}) {
  return (
    <Link
      href={pathForLocale('/tags', locale)}
      className="grid-snap-w shrink-0 whitespace-pre transition-colors hover:text-muted"
    >
      {label}
    </Link>
  )
}
