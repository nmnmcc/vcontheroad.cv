export type CfImageOptions = {
  width?: number
  quality?: number
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  format?: 'auto' | 'webp' | 'avif' | 'json'
}

export function cfImage(src: string, options: CfImageOptions = {}): string {
  if (!src) return src
  if (process.env.NODE_ENV !== 'production') return src
  if (!src.startsWith('/') || src.startsWith('/cdn-cgi/')) return src

  const parts: string[] = []
  if (options.width) parts.push(`width=${options.width}`)
  if (options.quality) parts.push(`quality=${options.quality}`)
  if (options.fit) parts.push(`fit=${options.fit}`)
  parts.push(`format=${options.format ?? 'auto'}`)
  return `/cdn-cgi/image/${parts.join(',')}${src}`
}
