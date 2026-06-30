import type { LocaleCode } from '../i18n'

export const tags = {
  siteSettings: (locale?: LocaleCode) =>
    locale ? `site-settings:${locale}` : 'site-settings',
  about: (locale?: LocaleCode) => (locale ? `about:${locale}` : 'about'),
  postsList: (locale?: LocaleCode) => (locale ? `posts:list:${locale}` : 'posts:list'),
  postsSlugs: (locale?: LocaleCode) =>
    locale ? `posts:slugs:${locale}` : 'posts:slugs',
  post: (slug: string, locale?: LocaleCode) =>
    locale ? `post:${slug}:${locale}` : `post:${slug}`,
  tagsList: (locale?: LocaleCode) => (locale ? `tags:list:${locale}` : 'tags:list'),
  tagsSlugs: (locale?: LocaleCode) => (locale ? `tags:slugs:${locale}` : 'tags:slugs'),
  tag: (slug: string, locale?: LocaleCode) =>
    locale ? `tag:${slug}:${locale}` : `tag:${slug}`,
  postsByTag: (slug: string, locale?: LocaleCode) =>
    locale ? `posts:byTag:${slug}:${locale}` : `posts:byTag:${slug}`,
}
