import { notFound } from 'next/navigation'
import PostsList from './posts-list'
import { findAllPosts } from '@/lib/server/payload'
import { getLocale } from '@/lib/i18n'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: code } = await params
  const locale = getLocale(code)
  if (!locale) notFound()
  const posts = await findAllPosts(locale)
  return <PostsList posts={posts} locale={locale} />
}
