import { cfImage } from '@/lib/cf-image'
import AccentFigure from './accent-figure'
import CoverTheme from './cover-theme'
import FullscreenImage from './fullscreen-image'

type Props = Readonly<{
  src: string
  alt: string
  scope: string
  accent?: number | null
  className?: string
}>

export default function PostCover({ src, alt, scope, accent = null, className }: Props) {
  return (
    <>
      <CoverTheme accent={accent} targetSelector={`[data-post-scope="${scope}"]`} />
      <AccentFigure
        accent={accent}
        className={
          className ??
          '-ms-(--spacing-inset) flex w-screen flex-wrap content-start items-start gap-(--spacing-gutter) bg-none px-(--spacing-inset)'
        }
      >
        <FullscreenImage
          src={cfImage(src, { width: 2400 })}
          alt={alt}
          className="grid-figure"
        />
      </AccentFigure>
    </>
  )
}
