import { defineCloudflareConfig, type OpenNextConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue'
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache'

export default {
  buildCommand: 'next build --webpack',
  ...defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
    queue: doQueue,
    tagCache: doShardedTagCache({ baseShardSize: 12 }),
  }),
  cloudflare: {
    useWorkerdCondition: true,
  },
} satisfies OpenNextConfig
