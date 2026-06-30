import React from 'react'
import { hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities'

type Props = Readonly<{
  accent?: number | null
  className?: string
  children: React.ReactNode
}>

export default function AccentFigure({ accent = null, className, children }: Props) {
  const bg =
    accent === null
      ? undefined
      : hexFromArgb(themeFromSourceColor(accent).palettes.primary.tone(90))
  return (
    <figure className={className} style={bg ? { backgroundColor: bg } : undefined}>
      {children}
    </figure>
  )
}
