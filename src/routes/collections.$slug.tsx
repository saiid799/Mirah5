import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Cover } from '../components/Cover'
import { getCollection } from '../lib/api'
import { readingMinutes } from '../lib/types'

export const Route = createFileRoute('/collections/$slug')({
  loader: async ({ params }) => {
    const c = await getCollection({ data: params.slug })
    if (!c) throw notFound()
    return c
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? 'سلسلة'} — سِجِلّ` }],
  }),
  component: CollectionPage,
})

function CollectionPage() {
  const c = Route.useLoaderData()
  const total = c.articles.reduce((n, a) => n + readingMinutes(a.content), 0)
  const first = c.articles[0]
  return (
    <div className="container-x max-w-4xl pb-6 pt-8 sm:pt-14">
      <Link to="/collections" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
        → كل السلاسل
      </Link>
      <header className="mt-6 text-center">
        <div className="text-5xl">{c.icon}</div>
        <h1 className="gold-text mt-3 font-display text-4xl font-bold leading-[1.5] sm:text-5xl md:text-6xl">
          {c.name}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl font-amiri text-lg sm:text-xl text-[var(--muted)]">
          {c.description}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="chip">{c.articles.length} من {c.totalEpisodes} مقالة</span>
          <span className="chip">~{total} دقيقة قراءة</span>
        </div>
        {c.totalEpisodes > c.articles.length && (
          <div className="mx-auto mt-5 max-w-sm">
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--line)]" role="progressbar" aria-valuemin={0} aria-valuemax={c.totalEpisodes} aria-valuenow={c.articles.length}>
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(c.articles.length / c.totalEpisodes) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              نُشر {c.articles.length} من {c.totalEpisodes} — المزيد قادم تباعًا
            </p>
          </div>
        )}
        {first && (
          <Link
            to="/articles/$slug"
            params={{ slug: first.slug }}
            className="btn btn-primary mt-6"
          >
            ابدأ من المقال الأول
          </Link>
        )}
      </header>

      <div className="orn my-10 text-sm">◆</div>

      <ol className="relative flex flex-col gap-4 before:absolute before:inset-y-4 before:start-[1.2rem] sm:before:start-[1.55rem] before:w-px before:bg-[var(--line)]">
        {c.articles.map((a, i) => (
          <li key={a.id} className="relative flex gap-3 sm:gap-4">
            <span className="z-10 grid h-10 w-10 shrink-0 sm:h-12 sm:w-12 place-items-center rounded-full border border-[var(--accent)] bg-[var(--bg2)] font-kufi text-lg text-[var(--accent)]">
              {i + 1}
            </span>
            <Link
              to="/articles/$slug"
              params={{ slug: a.slug }}
              className="card min-w-0 flex-1 sm:flex-row"
            >
              <Cover article={a} className="h-28 sm:h-auto sm:w-44" />
              <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
                <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                  {a.period && <span className="chip">{a.period}</span>}
                  <span>{readingMinutes(a.content)} دقائق قراءة</span>
                </div>
                <h2 className="font-amiri text-xl font-bold leading-snug sm:text-2xl">{a.title}</h2>
                <p className="line-clamp-2 text-sm text-[var(--muted)]">{a.excerpt}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
      {c.upcoming.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-bold sm:text-3xl">قادم قريبًا</h2>
          <ol className="flex flex-col gap-3">
            {c.upcoming.map((e) => (
              <li key={e.episode} className="flex gap-3 rounded-2xl border border-dashed border-[var(--line)] p-4 opacity-80 sm:gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] font-kufi text-[var(--muted)]">
                  {e.episode}
                </span>
                <div className="min-w-0">
                  <span className="chip text-xs">{e.period}</span>
                  <h3 className="mt-1 font-amiri text-lg font-bold leading-snug sm:text-xl">{e.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{e.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
