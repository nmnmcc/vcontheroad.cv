import type { EmailAdapter } from 'payload'

type CfAddress = { email: string; name: string }

type CfSendMessage = {
  from: string | CfAddress
  to: string | string[]
  subject: string
  replyTo?: string | CfAddress
  cc?: string | string[]
  bcc?: string | string[]
  headers?: Record<string, string>
  text?: string
  html?: string
}

type CfSendBinding = {
  send(message: CfSendMessage): Promise<{ messageId: string }>
}

type NodemailerAddress = { name?: string; address: string }
type AddressInput = string | NodemailerAddress

const isAddressInput = (value: unknown): value is AddressInput => {
  if (typeof value === 'string') return true
  if (!value || typeof value !== 'object') return false
  return typeof (value as { address?: unknown }).address === 'string'
}

const toAddressInput = (value: unknown): AddressInput | undefined =>
  isAddressInput(value) ? value : undefined

const toRecipientInputs = (value: unknown): AddressInput[] => {
  if (Array.isArray(value)) return value.filter(isAddressInput)
  return isAddressInput(value) ? [value] : []
}

const parseAddressString = (value: string): string | CfAddress => {
  const match = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/)
  return match && match[1] && match[2]
    ? { name: match[1].trim(), email: match[2].trim() }
    : value.trim()
}

const toCfAddress = (value: AddressInput): string | CfAddress =>
  typeof value === 'string'
    ? parseAddressString(value)
    : { email: value.address, name: value.name ?? '' }

const toEmailOnly = (value: AddressInput): string =>
  typeof value === 'string' ? value : value.address

const toRecipients = (value: unknown): string | string[] | undefined => {
  const arr = toRecipientInputs(value)
  const mapped = arr.map(toEmailOnly).filter(Boolean)
  if (!mapped.length) return undefined
  return mapped.length === 1 ? mapped[0] : mapped
}

const toPlainText = (value: unknown): string | undefined => {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  if (value instanceof Uint8Array) return new TextDecoder().decode(value)
  return undefined
}

const toHeaders = (value: unknown): Record<string, string> | undefined => {
  if (!value || typeof value !== 'object') return undefined
  const entries: Array<[string, string]> = []
  const extract = (key: string, raw: unknown) => {
    if (typeof raw === 'string') entries.push([key, raw])
    else if (raw && typeof raw === 'object' && 'value' in raw)
      entries.push([key, String((raw as { value: unknown }).value)])
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (item && typeof item === 'object' && 'key' in item && 'value' in item) {
        extract(String((item as { key: unknown }).key), (item as { value: unknown }).value)
      }
    }
  } else {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) extract(k, v)
  }
  return entries.length ? Object.fromEntries(entries) : undefined
}

export const cloudflareEmailAdapter =
  ({
    binding,
    defaultFromAddress,
    defaultFromName,
  }: {
    binding: CfSendBinding | undefined
    defaultFromAddress: string
    defaultFromName: string
  }): EmailAdapter<{ messageId: string } | undefined> =>
  ({ payload }) => ({
    name: 'cloudflare-email',
    defaultFromAddress,
    defaultFromName,
    sendEmail: async (message) => {
      const to = toRecipients(message.to)
      if (!to) throw new Error('cloudflareEmailAdapter: `to` is required')

      const fromInput = toAddressInput(message.from)
      const from = fromInput
        ? toCfAddress(fromInput)
        : { email: defaultFromAddress, name: defaultFromName }

      if (message.attachments?.length) {
        payload.logger.warn({
          msg: 'cloudflareEmailAdapter: attachments are not supported and will be dropped',
        })
      }

      const replyToInput = toAddressInput(message.replyTo)
      const cc = toRecipients(message.cc)
      const bcc = toRecipients(message.bcc)
      const text = toPlainText(message.text)
      const html = toPlainText(message.html)
      const headers = toHeaders(message.headers)
      const cfMessage: CfSendMessage = {
        from,
        to,
        subject: message.subject ?? '',
        ...(cc !== undefined && { cc }),
        ...(bcc !== undefined && { bcc }),
        ...(replyToInput && { replyTo: toCfAddress(replyToInput) }),
        ...(text !== undefined && { text }),
        ...(html !== undefined && { html }),
        ...(headers !== undefined && { headers }),
      }

      if (!binding) {
        payload.logger.info({
          msg: `Email attempted without Cloudflare EMAIL binding. To: '${Array.isArray(to) ? to.join(', ') : to}', Subject: '${cfMessage.subject}'`,
        })
        return undefined
      }

      return binding.send(cfMessage)
    },
  })
