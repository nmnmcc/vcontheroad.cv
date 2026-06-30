# Security Policy

## Reporting

Please do not open a public issue for suspected vulnerabilities. Email the
maintainer listed on the GitHub profile for `nmnmcc`, or use GitHub private
vulnerability reporting if it is enabled for this repository.

Include the affected route or component, reproduction steps, expected impact,
and any logs that do not contain secrets or personal data.

## Secret Handling

- Never commit `.env`, `.dev.vars`, database dumps, local media, API tokens, or
  Cloudflare credentials.
- Generate `PAYLOAD_SECRET` with `openssl rand -hex 32`.
- Store production secrets with `wrangler secret put PAYLOAD_SECRET`; do not put
  them in `wrangler.jsonc`.
- Rotate any secret immediately if it was committed, pasted into an issue, or
  shared in logs.

## Before Publishing

Run these checks before making the repository public:

```bash
rg --hidden -g '!node_modules' -g '!.git' -e 'AKIA[0-9A-Z]{16}' -e 'sk-[A-Za-z0-9_-]{20,}' -e 'gh[pousr]_[A-Za-z0-9_]{20,}'
yarn install --immutable
yarn lint
yarn typecheck
yarn npm audit --recursive --all
```

The Cloudflare resource names and D1 database IDs in `wrangler.jsonc` are not
authentication secrets, but they do identify the production deployment. Forks
should replace them with their own Cloudflare resources before deploying.
