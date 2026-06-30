# vcontheroad.cv

A bilingual travel journal built with Next.js, Payload CMS, and Cloudflare
Workers. The public site is statically cached where possible, while editorial
content is managed through Payload and stored in Cloudflare D1/R2.

## Stack

- Next.js App Router
- Payload CMS 3
- Cloudflare Workers via OpenNext
- Cloudflare D1 for structured content
- Cloudflare R2 for uploaded images
- Yarn 4

## Local Development

Requires Node.js 22 or newer.

Install dependencies:

```bash
yarn install
```

Create a local environment file from the example and generate a development
secret:

```bash
cp .env.example .env
openssl rand -hex 32
```

Set `PAYLOAD_SECRET` in `.env`, then start the app:

```bash
yarn dev
```

Payload admin is available at `/admin`.

## Scripts

```bash
yarn lint
yarn typecheck
yarn test:int
yarn test:e2e
yarn build
```

## Cloudflare Deployment

Authenticate Wrangler first:

```bash
yarn wrangler login
```

Production requires a Payload secret stored as a Cloudflare secret:

```bash
yarn wrangler secret put PAYLOAD_SECRET --env production
```

Forks should replace the Worker name, D1 database, R2 buckets, email sender, and
site URL in `wrangler.jsonc` before deploying.

Deploy with:

```bash
CLOUDFLARE_ENV=production yarn deploy
```

## Security

Do not commit real environment files, `.dev.vars`, database dumps, local media,
or Cloudflare credentials. See [SECURITY.md](./SECURITY.md) for the reporting
process and the pre-publish checklist.

## License

MIT
