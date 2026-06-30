'use client'
import { Checkmark, Share } from '@carbon/icons-react'
import { useState } from 'react'
import { pathForLocale, type LocaleConfig } from '@/lib/i18n'
import { useTranslation } from '@/lib/client/i18n'

type Props = Readonly<{
  slug: string
  title: string
  locale: LocaleConfig
  tabIndex?: number
}>

export default function ShareButton({ slug, title, locale, tabIndex }: Props) {
  const [t] = useTranslation([locale.tag])
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}${pathForLocale(`/posts/${slug}`, locale)}`
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled or share failed
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? t.copied : `${t.share} ${title}`}
      tabIndex={tabIndex}
      className="flex size-[var(--spacing-cell)] cursor-pointer items-center justify-center bg-foreground text-background transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? <Checkmark size={32} aria-hidden /> : <Share size={32} aria-hidden />}
    </button>
  )
}
