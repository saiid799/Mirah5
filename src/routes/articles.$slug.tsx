import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Cover } from '../components/Cover'
import { Markdown } from '../components/Markdown'
import { getBySlug } from '../lib/api'
import { formatDate, readingMinutes } from '../lib/types'

export const Route = createFileRoute('/articles/$slug')({
  loader: async ({ params }) => {
    const res = await getBySlug({ data: params.slug })
    if (!res.article) throw notFound()
    return { article: res.article, series: res.series, related: res.related }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.article.title ?? 'مقال'} — سِجِلّ` },
      { name: 'description', content: loaderData?.article.excerpt ?? '' },
    ],
  }),
  component: ArticlePage,
})

const fonts = [
  { id: 'Amiri', name: 'أميري' },
  { id: 'Scheherazade New', name: 'شهرزاد' },
  { id: 'Noto Naskh Arabic', name: 'نسخ' },
  { id: 'Reem Kufi', name: 'كوفي' },
]

// خطوط إضافية تظهر فقط إذا وُجد ملفها في public/fonts
const extraFonts = [
  { id: 'DecoType Naskh Swashes', name: 'ديكوتايب' },
  { id: 'KA Hand Naskh Mob', name: 'يد نسخ' },
  { id: 'NT Panorama Naskh', name: 'بانوراما' },
]

function ArticlePage() {
  const { article, series, related } = Route.useLoaderData()
  const toc = article.content
    .split(/\n{2,}/)
    .filter((b) => /^##?\s/.test(b.trim()))
    .map((b, i) => ({ id: `s${i}`, text: b.trim().replace(/^#+\s/, '').replace(/\*\*/g, '') }))
  const [progress, setProgress] = useState(0)
  const [size, setSize] = useState(1.25)
  const [font, setFont] = useState('Amiri')
  const [extra, setExtra] = useState<typeof extraFonts>([])
  // الفهرس مفتوح على الشاشات الكبيرة ومطويّ على الهاتف ليصل القارئ للنص أسرع
  const [tocOpen, setTocOpen] = useState(true)
  useEffect(() => {
    if (window.matchMedia('(max-width: 639px)').matches) setTocOpen(false)
  }, [])

  useEffect(() => {
    Promise.all(
      extraFonts.map((f) =>
        document.fonts
          .load(`1em '${f.id}'`)
          .then((r) => (r.length ? f : null))
          .catch(() => null),
      ),
    ).then((r) => setExtra(r.filter((x): x is (typeof extraFonts)[number] => !!x)))
    try {
      const s = Number(localStorage.getItem('fontSize'))
      if (s) setSize(s)
      const f = localStorage.getItem('readerFont')
      if (f && [...fonts, ...extraFonts].some((x) => x.id === f)) setFont(f)
    } catch {}
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const changeFont = (id: string) => {
    setFont(id)
    try {
      localStorage.setItem('readerFont', id)
    } catch {}
  }

  const changeSize = (delta: number) => {
    const next = Math.min(1.8, Math.max(0.95, +(size + delta).toFixed(2)))
    setSize(next)
    try {
      localStorage.setItem('fontSize', String(next))
    } catch {}
  }

  return (
    <article>
      <div className="progress">
        <i style={{ transform: `scaleX(${progress})` }} />
      </div>

      <header className="container-x max-w-3xl pt-8 text-center sm:pt-12">
        <Link to="/" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
          → كل المقالات
        </Link>
        {series && (
          <Link
            to="/collections/$slug"
            params={{ slug: series.slug }}
            className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-1 text-center text-sm leading-relaxed text-[var(--accent)]"
          >
            <span className="font-kufi">
              {series.name} · المقال {series.index} من {series.planned}
            </span>
          </Link>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="chip">{article.category}</span>
          {article.period && <span className="chip">{article.period}</span>}
        </div>
        <h1 className="gold-text mt-5 font-display text-[1.95rem] font-bold leading-[1.65] sm:text-4xl md:text-6xl">
          {article.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-amiri text-lg text-[var(--muted)] sm:text-xl">
          {article.excerpt}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--muted)]">
          {article.author && <span>✍️ {article.author}</span>}
          <span>{formatDate(article.createdAt)}</span>
          <span>{readingMinutes(article.content)} دقائق قراءة</span>
        </div>
      </header>

      <div className="container-x mt-8 max-w-4xl sm:mt-10">
        <Cover article={article} className="h-52 overflow-hidden rounded-2xl sm:h-64 sm:rounded-3xl md:h-80" />
        {article.coverUrl && article.coverCredit && (
          <p className="mt-2 text-center text-xs text-[var(--muted)]" dir="auto">
            صورة الغلاف:{' '}
            <a
              href={article.coverCredit.split('|')[1]}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {article.coverCredit.split('|')[0]}
            </a>
          </p>
        )}
      </div>

      <div className="container-x max-w-2xl">
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 sm:p-3">
          <div className="flex flex-wrap items-center justify-center gap-1">
            {[...fonts, ...extra].map((f) => (
              <button
                key={f.id}
                className={`btn px-3 py-1 ${font === f.id ? 'btn-primary' : ''}`}
                style={{ fontFamily: `'${f.id}'` }}
                onClick={() => changeFont(f.id)}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn px-3 py-1" onClick={() => changeSize(-0.1)} aria-label="تصغير الخط">
              أ-
            </button>
            <button className="btn px-3 py-1" onClick={() => changeSize(0.1)} aria-label="تكبير الخط">
              أ+
            </button>
          </div>
        </div>

        {toc.length > 2 && (
          <details className="toc" open={tocOpen} onToggle={(e) => setTocOpen(e.currentTarget.open)}>
            <summary className="toc-title">في هذا المقال ({toc.length})</summary>
            <ol>
              {toc.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>
                    <b>{i + 1}</b>
                    {t.text}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        )}

        <div className="reader mt-8" style={{ ['--font-size' as string]: `${size}rem`, ['--reader-font' as string]: `'${font}'` }}>
          <Markdown source={article.content} />
        </div>

        <div className="orn my-12 text-2xl">❖</div>

        {series && (series.prev || series.next) && (
          <nav className="mb-12 grid gap-4 sm:grid-cols-2">
            {series.prev ? (
              <Link to="/articles/$slug" params={{ slug: series.prev.slug }} className="card p-5">
                <span className="text-xs text-[var(--accent)]">→ المقال السابق</span>
                <span className="mt-1 font-amiri text-lg font-bold leading-snug">{series.prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {series.next && (
              <Link to="/articles/$slug" params={{ slug: series.next.slug }} className="card p-5 text-end">
                <span className="text-xs text-[var(--accent)]">المقال التالي ←</span>
                <span className="mt-1 font-amiri text-lg font-bold leading-snug">{series.next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </div>

      {related.length > 0 && (
        <section className="container-x">
          <h2 className="mb-5 font-display text-2xl font-bold sm:text-3xl">اقرأ أيضًا</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="card">
                <Cover article={a} className="h-36" />
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold leading-snug">{a.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
