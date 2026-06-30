'use client'
import type { ComponentProps } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

type Props = Omit<ComponentProps<typeof Lightbox>, 'plugins'>

export default function LightboxRenderer(props: Props) {
  return (
    <Lightbox
      plugins={[Zoom]}
      controller={{ closeOnBackdropClick: true }}
      carousel={{ finite: true }}
      zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      styles={{ container: { backgroundColor: 'rgb(0 0 0 / 0.92)' } }}
      {...props}
    />
  )
}
