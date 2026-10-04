import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Cover } from '../components/Cover'
import { getCollections, getPublished } from '../lib/api'
import { formatDate, readingMinutes } from '../lib/types'

export const Route = createFileRoute('/')({
  loader: async () => ({
    articles: await getPublished(),
    collections: await getCollections(),
  }),
  component: Home,
})

function Home() {
  const { articles, collections } = Route.useLoaderData()
  const [cat, setCat] = useState('الكل')
  const [q, setQ] = useState('')

  const cats = useMemo(
    () => ['الكل', ...new Set(articles.map((a) => a.category))],
    [articles],
  )
  const list = articles.filter(
    (a) =>
      (cat === 'الكل' || a.category === cat) &&
      (!q || (a.title + a.excerpt).includes(q)),
  )
  const [featured, ...rest] = list
  const showFeatured = !!featured && !q && cat === 'الكل'
  const grid = showFeatured ? rest : list

  return (
    <>
      <section className="hero container-x pb-8 pt-10 text-center sm:pb-10 sm:pt-16">
        <span className="chip rise">❖ أرشيف التاريخ العربي ❖</span>
        <h1
          className="rise mx-auto mt-6 max-w-4xl font-display text-[2.35rem] font-bold leading-[1.55] sm:text-5xl md:text-7xl"
          style={{ animationDelay: '.08s' }}
        >
          اقرأ التاريخ <span className="gold-text">كما لم تقرأه</span>{' '}
          من قبل
        </h1>
        <p
          className="rise mx-auto mt-5 max-w-xl font-amiri text-lg text-[var(--muted)] sm:text-xl"
          style={{ animationDelay: '.16s' }}
        >
          مقالات موثّقة عن الحضارات والمعارك والعلماء، بخطوط مريحة وتجربة قراءة
          هادئة.
        </p>
        <div
          className="rise mx-auto mt-8 max-w-md"
          style={{ animationDelay: '.24s' }}
        >
          <input
            className="field text-center"
            placeholder="🔍 ابحث في المقالات…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </section>

      {collections.length > 0 && (
        <section className="container-x mb-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold">السلاسل</h2>
            <Link to="/collections" className="text-sm text-[var(--accent)]">
              كل السلاسل ←
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {collections.map((c) => (
              <Link
                key={c.slug}
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className="card flex-row items-center gap-3 p-4 sm:gap-4 sm:p-5"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--accent-soft)] text-3xl">
                  {c.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                  <p className="text-xs text-[var(--muted)]">{c.articles.length} مقالات متسلسلة</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-x">
        <div className="orn mb-8 text-sm">◆</div>
        <div className="scroll-row mb-8">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`btn shrink-0 whitespace-nowrap ${c === cat ? 'btn-primary' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>

        {showFeatured && (
          <Link
            to="/articles/$slug"
            params={{ slug: featured.slug }}
            className="card mb-8 md:flex-row"
          >
            <Cover article={featured} className="h-52 sm:h-64 md:h-auto md:min-h-64 md:w-1/2" />
            <div className="flex flex-1 flex-col justify-center gap-3 p-5 sm:p-7 md:p-10">
              <span className="chip w-fit">{featured.category} · الأحدث</span>
              <h2 className="font-display text-2xl font-bold leading-snug sm:text-3xl md:text-4xl">
                {featured.title}
              </h2>
              <p className="text-[var(--muted)]">{featured.excerpt}</p>
              <Meta a={featured} />
            </div>
          </Link>
        )}

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {grid.map((a) => (
            <Link
              key={a.id}
              to="/articles/$slug"
              params={{ slug: a.slug }}
              className="card"
            >
              <Cover article={a} className="h-44" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="chip w-fit">{a.collection ? `${a.collection} · ${a.episode || ''}` : a.category}</span>
                <h3 className="font-display text-2xl font-bold leading-snug">
                  {a.title}
                </h3>
                <p className="line-clamp-3 text-sm text-[var(--muted)]">
                  {a.excerpt}
                </p>
                <div className="mt-auto pt-2">
                  <Meta a={a} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {list.length === 0 && (
          <p className="py-16 text-center text-[var(--muted)]">
            لا توجد مقالات مطابقة.
          </p>
        )}
      </section>
    </>
  )
}

function Meta({ a }: { a: { createdAt: string; content: string } }) {
  return (
    <div className="flex flex-wrap gap-x-3 text-xs text-[var(--muted)]">
      <span>{formatDate(a.createdAt)}</span>
      <span>·</span>
      <span>{readingMinutes(a.content)} دقائق قراءة</span>
    </div>
  )
}
