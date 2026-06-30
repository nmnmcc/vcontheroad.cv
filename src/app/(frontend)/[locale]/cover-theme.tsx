'use client'

import { useEffect } from 'react'
import { hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities'

export default function CoverTheme({
  accent,
  targetSelector,
}: {
  accent: number | null
  targetSelector?: string
}): null {
  useEffect(() => {
    if (accent === null) return
    const root = targetSelector
      ? document.querySelector<HTMLElement>(targetSelector)
      : document.documentElement
    if (!root) return
    const htmlRoot = document.documentElement
    const theme = themeFromSourceColor(accent)
    let active = false

    root.style.setProperty('--color-muted', hexFromArgb(theme.palettes.neutralVariant.tone(70)))

    const applyPageBackground = () => {
      htmlRoot.style.setProperty('--color-background', hexFromArgb(theme.palettes.primary.tone(95)))
      htmlRoot.style.setProperty('--color-accent', hexFromArgb(theme.palettes.primary.tone(50)))
    }

    const clearPageBackground = () => {
      htmlRoot.style.removeProperty('--color-background')
      htmlRoot.style.removeProperty('--color-accent')
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          active = true
          applyPageBackground()
        } else {
          active = false
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    observer.observe(root)

    return () => {
      observer.disconnect()
      if (active) clearPageBackground()
      root.style.removeProperty('--color-muted')
    }
  }, [accent, targetSelector])

  return null
}
