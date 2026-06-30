'use client'
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const LightboxRenderer = dynamic(() => import('./lightbox-renderer'), { ssr: false })

type Slide = Readonly<{ src: string; alt?: string }>

type GalleryApi = Readonly<{
  register: (slide: Slide) => number
  unregister: (id: number) => void
  open: (id: number) => void
}>

const GalleryContext = createContext<GalleryApi | null>(null)

export function useGallery() {
  return useContext(GalleryContext)
}

export default function LightboxGallery({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [index, setIndex] = useState(0)
  const entries = useRef<Map<number, Slide>>(new Map())
  const order = useRef<number[]>([])
  const nextId = useRef(0)
  const [slides, setSlides] = useState<Slide[]>([])

  const sync = useCallback(() => {
    setSlides(
      order.current
        .map((id) => entries.current.get(id))
        .filter((s): s is Slide => s !== undefined),
    )
  }, [])

  const api = useMemo<GalleryApi>(
    () => ({
      register: (slide) => {
        const id = nextId.current++
        entries.current.set(id, slide)
        order.current.push(id)
        sync()
        return id
      },
      unregister: (id) => {
        entries.current.delete(id)
        order.current = order.current.filter((x) => x !== id)
        sync()
      },
      open: (id) => {
        const i = order.current.indexOf(id)
        if (i < 0) return
        setIndex(i)
        setHasMounted(true)
        setOpen(true)
      },
    }),
    [sync],
  )

  return (
    <GalleryContext.Provider value={api}>
      {children}
      {hasMounted && (
        <LightboxRenderer
          open={open}
          close={() => setOpen(false)}
          index={index}
          on={{ view: ({ index: i }) => setIndex(i) }}
          slides={slides}
        />
      )}
    </GalleryContext.Provider>
  )
}
