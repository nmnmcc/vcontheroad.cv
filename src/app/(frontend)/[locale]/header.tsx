import Link from 'next/link'
import AboutLink from './about-link'
import TagsLink from './tags-link'
import LocaleSwitcher from './locale-switcher'
import { getSiteSettings } from '@/lib/server/payload'
import { match, pathForLocale, type LocaleConfig } from '@/lib/i18n'

export default async function Header({ locale }: { locale: LocaleConfig }) {
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    match([locale.tag]),
  ])

  const labels = [t.about, t.tags, t.language]
  const maxLen = Math.max(...labels.map((l) => [...l].length))
  const pad = (s: string) => s + ' '.repeat(maxLen - [...s].length)
  const [aboutLabel, tagsLabel, languageLabel] = labels.map(pad)

  return (
    <>
      <h1 className="group relative z-30 w-fit text-title font-bold uppercase leading-none break-words before:absolute before:right-0 before:bottom-0 before:-left-(--spacing-inset) before:-top-(--spacing-inset) before:origin-bottom-right before:scale-0 before:bg-foreground before:content-[''] before:transition-transform before:duration-300 hover:before:scale-100">
        <Link
          href={pathForLocale('/', locale)}
          className="relative text-foreground transition-colors duration-300 group-hover:text-background"
        >
          {settings.title}
          {settings.suffix && <span className="text-muted">{settings.suffix}</span>}
        </Link>
      </h1>
      {settings.subtitle && (
        <div className="flex flex-col items-start gap-(--spacing-gutter) text-subtitle leading-none">
          <p className="font-normal">{settings.subtitle}</p>
          <div className="flex flex-wrap items-start gap-(--spacing-gutter) font-light">
            <AboutLink locale={locale} label={aboutLabel} />
            <TagsLink locale={locale} label={tagsLabel} />
            <LocaleSwitcher locale={locale} label={languageLabel} />
          </div>
        </div>
      )}
      <hr className="-ml-(--spacing-inset) w-screen border-0 border-t border-foreground min-block-0" />
    </>
  )
}
