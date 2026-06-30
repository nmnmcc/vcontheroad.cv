import Link from 'next/link'
import type { Tag } from '@/payload-types'
import { pathForLocale, type LocaleConfig } from '@/lib/i18n'

type TagRef = number | Tag

type Props = {
  tags: TagRef[] | null | undefined
  locale: LocaleConfig
  tabIndex?: number
}

export default function TagChips({ tags, locale, tabIndex }: Props) {
  const resolved = (tags ?? []).filter(
    (t): t is Tag => typeof t === 'object' && t !== null && typeof t.slug === 'string',
  )
  if (resolved.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-(--spacing-gutter) text-subtitle leading-none">
      {resolved.map((tag) => (
        <li key={tag.id}>
          <Link
            href={pathForLocale(`/tags/${tag.slug}`, locale)}
            tabIndex={tabIndex}
            className="inline-flex items-center font-normal text-foreground transition-colors hover:text-muted"
          >
            #{tag.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
