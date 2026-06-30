import AccentFigure from './accent-figure'
import FullscreenImage from './fullscreen-image'

type Props = Readonly<{
  src: string
  alt: string
  width?: number
  height?: number
  caption?: string
  accent?: number | null
}>

export default function UploadFigure({
  src,
  alt,
  width,
  height,
  caption,
  accent = null,
}: Props) {
  return (
    <AccentFigure
      accent={accent}
      className="-ms-(--spacing-inset) flex w-screen flex-wrap content-start items-start gap-(--spacing-gutter) bg-none px-(--spacing-inset)"
    >
      <FullscreenImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="grid-figure"
      />
      {caption && (
        <figcaption className="grid-figcaption text-body leading-[1.5]">
          {caption}
        </figcaption>
      )}
    </AccentFigure>
  )
}
