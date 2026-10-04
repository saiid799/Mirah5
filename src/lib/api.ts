import { createServerFn } from '@tanstack/react-start'
import type { Article, ArticleInput, CollectionInfo } from './types'


export const getPublished = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Article[]> => {
    const { readAll } = await import('../server/store.server')
    return (await readAll()).filter((a) => a.published)
  },
)

export const getCollections = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CollectionInfo[]> => {
    const { readAll, buildCollections } = await import('../server/store.server')
    return buildCollections((await readAll()).filter((a) => a.published))
  },
)

export const getCollection = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data }): Promise<CollectionInfo | null> => {
    const { readAll, buildCollections } = await import('../server/store.server')
    const cols = await buildCollections((await readAll()).filter((a) => a.published))
    return cols.find((c) => c.slug === data) ?? null
  })

export const getBySlug = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data }) => {
    const { readAll, buildCollections } = await import('../server/store.server')
    const all = (await readAll()).filter((a) => a.published)
    const article = all.find((a) => a.slug === data) ?? null

    // السلسلة: الحلقة الحالية والسابقة والتالية
    let series: {
      name: string
      slug: string
      index: number
      total: number
      planned: number
      prev: Article | null
      next: Article | null
    } | null = null
    if (article?.collection) {
      const col = (await buildCollections(all)).find((c) => c.name === article.collection)
      if (col) {
        const i = col.articles.findIndex((a) => a.id === article.id)
        series = {
          name: col.name,
          slug: col.slug,
          index: i + 1,
          total: col.articles.length,
          planned: col.totalEpisodes,
          prev: col.articles[i - 1] ?? null,
          next: col.articles[i + 1] ?? null,
        }
      }
    }

    const sameCol = (a: Article) => !!article?.collection && a.collection === article.collection
    const related = all
      .filter((a) => a.slug !== data && !sameCol(a) && a.category === article?.category)
      .slice(0, 3)
    const others = all.filter(
      (a) => a.slug !== data && !sameCol(a) && !related.includes(a),
    )
    return { article, series, related: [...related, ...others].slice(0, 3) }
  })

// ───── واجهة المشرف: كلها محمية بجلسة موقّعة (انظر server/auth.server.ts) ─────
export const adminSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { isOwner } = await import('../server/auth.server')
  return isOwner()
})

export const adminLogin = createServerFn({ method: 'POST' })
  .inputValidator((password: string) => password)
  .handler(async ({ data }) => {
    const { login } = await import('../server/auth.server')
    login(data)
    return true
  })

export const adminLogout = createServerFn({ method: 'POST' }).handler(async () => {
  const { logout } = await import('../server/auth.server')
  logout()
})

export const adminList = createServerFn({ method: 'POST' }).handler(
  async (): Promise<Article[]> => {
    const { requireOwner } = await import('../server/auth.server')
    requireOwner()
    const { readAll } = await import('../server/store.server')
    return readAll()
  },
)

export const adminSave = createServerFn({ method: 'POST' })
  .inputValidator((d: { article: ArticleInput }) => d)
  .handler(async ({ data }): Promise<Article> => {
    const { requireOwner } = await import('../server/auth.server')
    requireOwner()
    if (!data.article.title.trim() || !data.article.content.trim()) {
      throw new Error('العنوان والمحتوى مطلوبان')
    }
    const { saveArticle } = await import('../server/store.server')
    return saveArticle(data.article)
  })

export const adminDelete = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const { requireOwner } = await import('../server/auth.server')
    requireOwner()
    const { removeArticle } = await import('../server/store.server')
    await removeArticle(data.id)
  })
