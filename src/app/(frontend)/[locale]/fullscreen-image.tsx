'use client'
import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useGallery } from './lightbox-gallery'

const LightboxRenderer = dynamic(() => import('./lightbox-renderer'), { ssr: false })

type Props = Readonly<
  React.ImgHTMLAttributes<HTMLImageElement> & {
    imgRef?: React.Ref<HTMLImageElement>
  }
>

export default function FullscreenImage({ onClick, style, src, alt, imgRef, ...rest }: Props) {
  const gallery = useGallery()
  const [localOpen, setLocalOpen] = useState(false)
  const [hasMountedLightbox, setHasMountedLightbox] = useState(false)
  const idRef = useRef<number | null>(null)
  const validSrc = typeof src === 'string' && src.length > 0 ? src : null

  useEffect(() => {
    if (!gallery || !validSrc) return
    const id = gallery.register({ src: validSrc, ...(alt && { alt }) })
    idRef.current = id
    return () => {
      gallery.unregister(id)
      idRef.current = null
    }
  }, [gallery, validSrc, alt])

  const handleClick: React.MouseEventHandler<HTMLImageElement> = (event) => {
    onClick?.(event)
    if (event.defaultPrevented || !validSrc) return
    if (gallery && idRef.current !== null) {
      gallery.open(idRef.current)
    } else {
      setHasMountedLightbox(true)
      setLocalOpen(true)
    }
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...rest}
        ref={imgRef}
        src={src}
        alt={alt}
        onClick={handleClick}
        style={{ cursor: 'zoom-in', ...style }}
      />
      {!gallery && validSrc && hasMountedLightbox && (
        <LightboxRenderer
          open={localOpen}
          close={() => setLocalOpen(false)}
          slides={[{ src: validSrc, ...(alt && { alt }) }]}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
        />
      )}
    </>
  )
}
