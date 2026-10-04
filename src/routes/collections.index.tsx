import { Link, createFileRoute } from '@tanstack/react-router'
import { Cover } from '../components/Cover'
import { getCollections } from '../lib/api'

export const Route = createFileRoute('/collections/')({
  head: () => ({ meta: [{ title: 'السلاسل — سِجِلّ' }] }),
  loader: () => getCollections(),
  component: Collections,
})

function Collections() {
  const cols = Route.useLoaderData()
  return (
    <section className="hero container-x pb-6 pt-16">
      <div className="text-center">
        <span className="chip">❖ رحلات متسلسلة ❖</span>
        <h1 className="gold-text mt-5 font-display text-4xl font-bold leading-[1.5] sm:text-5xl md:text-6xl">
          السلاسل التاريخية
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-amiri text-lg text-[var(--muted)] sm:text-xl">
          مقالات مترابطة تأخذك من البداية إلى النهاية في عصر أو حضارة واحدة.
        </p>
      </div>

      <div className="orn my-10 text-sm">◆</div>

      <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
        {cols.map((c) => (
          <Link key={c.slug} to="/collections/$slug" params={{ slug: c.slug }} className="card">
            <Cover
              article={{ ...c.articles[0], title: c.name, category: c.name, period: '' }}
              className="h-44"
            />
            <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{c.icon}</span>
                <span className="chip">{c.articles.length} من {c.totalEpisodes} مقالة</span>
              </div>
              <h2 className="font-display text-3xl font-bold">{c.name}</h2>
              <p className="text-sm text-[var(--muted)]">{c.description}</p>
              <span className="mt-auto pt-2 text-sm text-[var(--accent)]">ابدأ الرحلة ←</span>
            </div>
          </Link>
        ))}
      </div>
      {cols.length === 0 && (
        <p className="py-16 text-center text-[var(--muted)]">لا توجد سلاسل بعد.</p>
      )}
    </section>
  )
}
