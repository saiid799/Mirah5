import { promises as fs } from 'node:fs'
import path from 'node:path'
import { slugify } from '../lib/types'
import type { Article, ArticleInput, CollectionInfo, UpcomingEpisode } from '../lib/types'
import { seedArticles } from './seed'

// كل مقال في ملف JSON مستقل داخل data/articles ← سهل النسخ والمراجعة عبر git
const DIR = path.resolve(process.cwd(), 'data', 'articles')
const fileOf = (id: string) => path.join(DIR, `${id}.json`)

let ready: Promise<void> | null = null

function init() {
  ready ??= (async () => {
    try {
      await fs.access(DIR)
    } catch {
      await fs.mkdir(DIR, { recursive: true })
      for (const a of seedArticles) await write(a)
    }
  })()
  return ready
}

// كتابة ذرّية: ملف مؤقت ثم إعادة تسمية، حتى لا يتلف الملف عند انقطاع الكتابة
async function write(a: Article) {
  const tmp = `${fileOf(a.id)}.tmp`
  await fs.writeFile(tmp, JSON.stringify(a, null, 2), 'utf8')
  await fs.rename(tmp, fileOf(a.id))
}

export async function readAll(): Promise<Article[]> {
  await init()
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith('.json'))
  const items = await Promise.all(
    files.map(async (f) => {
      try {
        const a = JSON.parse(await fs.readFile(path.join(DIR, f), 'utf8'))
        return { collection: '', episode: 0, ...a } as Article
      } catch {
        return null
      }
    }),
  )
  return items
    .filter((x): x is Article => !!x)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function saveArticle(input: ArticleInput): Promise<Article> {
  const all = await readAll()
  const existing = input.id ? all.find((a) => a.id === input.id) : undefined
  const now = new Date().toISOString()

  let slug =
    slugify(input.slug || input.title) || `article-${Date.now().toString(36)}`
  const taken = new Set(
    all.filter((a) => a.id !== existing?.id).map((a) => a.slug),
  )
  if (taken.has(slug)) {
    let n = 2
    while (taken.has(`${slug}-${n}`)) n++
    slug = `${slug}-${n}`
  }

  const article: Article = {
    id:
      existing?.id ??
      Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content,
    category: input.category.trim() || 'عام',
    period: input.period.trim(),
    author: input.author.trim(),
    collection: (input.collection ?? '').trim(),
    episode: Number(input.episode) || 0,
    coverUrl: input.coverUrl.trim(),
    coverCredit: input.coverUrl.trim() ? (input.coverCredit ?? existing?.coverCredit ?? '') : '',
    motif: input.motif || '',
    published: input.published,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await write(article)
  return article
}

export async function removeArticle(id: string) {
  await init()
  if (!/^[a-z0-9]+$/.test(id)) return
  await fs.rm(fileOf(id), { force: true })
}

// السلاسل: تُشتقّ تلقائيًا من حقل collection في المقالات، ووصفها وأيقونتها من data/collections.json (اختياري)
export async function buildCollections(
  articles: Article[],
): Promise<CollectionInfo[]> {
  let meta: Record<string, { description?: string; icon?: string; totalEpisodes?: number }> = {}
  try {
    meta = JSON.parse(
      await fs.readFile(path.resolve(process.cwd(), 'data', 'collections.json'), 'utf8'),
    )
  } catch {}
  let roadmaps: Record<string, { episodes?: UpcomingEpisode[] }> = {}
  try {
    roadmaps = JSON.parse(
      await fs.readFile(path.resolve(process.cwd(), 'data', 'roadmaps.json'), 'utf8'),
    )
  } catch {}
  const groups = new Map<string, Article[]>()
  for (const a of articles) {
    if (!a.collection) continue
    groups.set(a.collection, [...(groups.get(a.collection) ?? []), a])
  }
  return [...groups].map(([name, list]) => ({
    name,
    slug: slugify(name),
    description: meta[name]?.description ?? `سلسلة من ${list.length} مقالات متسلسلة.`,
    icon: meta[name]?.icon ?? '📚',
    upcoming: (roadmaps[name]?.episodes ?? [])
      .filter((e) => !list.some((a) => a.episode === e.episode))
      .sort((a, b) => a.episode - b.episode),
    totalEpisodes: Math.max(meta[name]?.totalEpisodes ?? 0, list.length),
    articles: list.sort(
      (a, b) =>
        (a.episode || 999) - (b.episode || 999) ||
        a.createdAt.localeCompare(b.createdAt),
    ),
  }))
}
