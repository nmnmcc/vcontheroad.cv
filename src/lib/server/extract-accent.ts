import { getCloudflareContext } from '@opennextjs/cloudflare'
import { sourceColorFromImageBytes } from '@material/material-color-utilities'

const SAMPLE_SIZE = 256

async function rgbaViaCloudflareImages(bytes: Uint8Array): Promise<Uint8Array | null> {
  const { env } = await getCloudflareContext({ async: true })
  const images = env.IMAGES
  if (!images) return null

  const input = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
  const result = await images
    .input(input)
    .transform({ width: SAMPLE_SIZE, height: SAMPLE_SIZE, fit: 'scale-down' })
    .output({ format: 'rgba' })

  return new Uint8Array(await new Response(result.image()).arrayBuffer())
}

async function rgbaViaJimp(bytes: Uint8Array): Promise<Uint8Array> {
  const { Jimp } = await import('jimp')
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const image = await Jimp.fromBuffer(ab)
  if (image.bitmap.width > SAMPLE_SIZE || image.bitmap.height > SAMPLE_SIZE) {
    image.scaleToFit({ w: SAMPLE_SIZE, h: SAMPLE_SIZE })
  }
  const data = image.bitmap.data
  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
}

export async function extractAccent(bytes: Uint8Array): Promise<number | null> {
  let rgba: Uint8Array | null = null
  try {
    rgba = await rgbaViaCloudflareImages(bytes)
  } catch {
    rgba = null
  }
  if (!rgba) {
    rgba = await rgbaViaJimp(bytes)
  }
  const argb = sourceColorFromImageBytes(new Uint8ClampedArray(rgba))
  return typeof argb === 'number' ? argb : null
}
