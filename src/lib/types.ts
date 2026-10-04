export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  period: string
  author: string
  collection: string
  episode: number
  coverUrl: string
  coverCredit?: string
  motif?: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export type ArticleInput = Omit<Article, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string
}

export const readingMinutes = (text: string) =>
  Math.max(1, Math.round(text.trim().split(/\s+/).length / 170))

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-EG', {
    dateStyle: 'long',
    timeZone: 'UTC',
  })

export const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export interface UpcomingEpisode {
  episode: number
  title: string
  period: string
  summary: string
  points: string[]
}

export interface CollectionInfo {
  name: string
  slug: string
  description: string
  icon: string
  // العدد الكلي المخطَّط للمقالات في السلسلة (من data/collections.json)، وقد يزيد عن المنشور حاليًا
  totalEpisodes: number
  // حلقات مخططة لم تُنشر بعد (من data/roadmaps.json)
  upcoming: UpcomingEpisode[]
  articles: Article[]
}
