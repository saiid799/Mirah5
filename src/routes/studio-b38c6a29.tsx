import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Illustration, motifs } from '../components/Illustration'
import { Markdown } from '../components/Markdown'
import { adminDelete, adminList, adminLogin, adminLogout, adminSave, adminSession } from '../lib/api'
import { formatDate } from '../lib/types'
import type { Article, ArticleInput } from '../lib/types'

export const Route = createFileRoute('/studio-b38c6a29')({
  head: () => ({
    meta: [{ title: 'سِجِلّ' }, { name: 'robots', content: 'noindex, nofollow, noarchive' }],
  }),
  component: Admin,
})

const empty: ArticleInput = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  period: '',
  author: 'هيئة التحرير',
  collection: '',
  episode: 0,
  coverUrl: '',
  motif: '',
  published: true,
}

function Admin() {
  const [password, setPassword] = useState('')
  const [articles, setArticles] = useState<Article[] | null>(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<ArticleInput | null>(null)
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(true)

  // الدخول عبر جلسة موقّعة في كوكي HttpOnly: كلمة المرور لا تُخزَّن في المتصفح
  const login = async (pw: string) => {
    setBusy(true)
    setError('')
    try {
      await adminLogin({ data: pw })
      setArticles(await adminList())
      setPassword('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر الدخول')
    }
    setBusy(false)
  }

  const logout = async () => {
    await adminLogout()
    setArticles(null)
    setEditing(null)
  }

  // إن كانت هناك جلسة صالحة ندخل مباشرة
  useEffect(() => {
    void (async () => {
      try {
        if (await adminSession()) setArticles(await adminList())
      } catch {}
      setChecking(false)
    })()
  }, [])

  const reload = async () => setArticles(await adminList())

  const save = async () => {
    if (!editing) return
    setBusy(true)
    setError('')
    try {
      await adminSave({ data: { article: editing } })
      await reload()
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر الحفظ')
    }
    setBusy(false)
  }

  const remove = async (a: Article) => {
    if (!confirm(`حذف «${a.title}» نهائيًا؟`)) return
    await adminDelete({ data: { id: a.id } })
    await reload()
  }

  const toggle = async (a: Article) => {
    await adminSave({
      data: { article: { ...a, published: !a.published } },
    })
    await reload()
  }

  if (checking) return <div className="container-x py-24" />

  if (!articles) {
    return (
      <div className="container-x max-w-md py-24">
        <div className="card p-8 text-center">
          <div className="text-4xl">🔐</div>
          <h1 className="mt-3 font-display text-3xl font-bold">لوحة الإدارة</h1>
          <form
            className="mt-6 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              void login(password)
            }}
          >
            <input
              type="password"
              className="field text-center"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button className="btn btn-primary justify-center" disabled={busy}>
              {busy ? 'جارٍ التحقق…' : 'دخول'}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </div>
      </div>
    )
  }

  if (editing) {
    const set = (k: keyof ArticleInput, v: string | boolean) =>
      setEditing({ ...editing, [k]: v })
    return (
      <div className="container-x py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-bold">
            {editing.id ? 'تعديل مقال' : 'مقال جديد'}
          </h1>
          <div className="flex gap-2">
            <button className="btn" onClick={() => setEditing(null)}>
              إلغاء
            </button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {busy ? 'جارٍ الحفظ…' : '💾 حفظ'}
            </button>
          </div>
        </div>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label t="العنوان">
              <input className="field" value={editing.title} onChange={(e) => set('title', e.target.value)} />
            </Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Label t="التصنيف / العصر">
                <input className="field" placeholder="العصر العباسي" value={editing.category} onChange={(e) => set('category', e.target.value)} />
              </Label>
              <Label t="الفترة الزمنية">
                <input className="field" placeholder="١٤٥٣م" value={editing.period} onChange={(e) => set('period', e.target.value)} />
              </Label>
              <Label t="الكاتب">
                <input className="field" value={editing.author} onChange={(e) => set('author', e.target.value)} />
              </Label>
              <Label t="السلسلة (اختياري)">
                <input
                  className="field"
                  list="collections"
                  placeholder="تاريخ اليابان"
                  value={editing.collection}
                  onChange={(e) => set('collection', e.target.value)}
                />
                <datalist id="collections">
                  {[...new Set(articles.map((a) => a.collection).filter(Boolean))].map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Label>
              <Label t="رقم الحلقة في السلسلة">
                <input
                  type="number"
                  min={0}
                  className="field"
                  value={editing.episode || ''}
                  onChange={(e) => setEditing({ ...editing, episode: Number(e.target.value) || 0 })}
                />
              </Label>
              <Label t="الرابط (اختياري)">
                <input className="field" dir="ltr" value={editing.slug} onChange={(e) => set('slug', e.target.value)} />
              </Label>
            </div>
            <Label t="رابط صورة الغلاف (اختياري)">
              <input className="field" dir="ltr" placeholder="https://…" value={editing.coverUrl} onChange={(e) => set('coverUrl', e.target.value)} />
            </Label>
            <Label t="نوع الرسم التلقائي (يُحدَّد تلقائيًا من العنوان)">
              <select
                className="field"
                value={editing.motif ?? ''}
                onChange={(e) => set('motif', e.target.value)}
              >
                <option value="">تلقائي</option>
                {Object.entries(motifs).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Label>
            <Label t="الملخص">
              <textarea className="field" rows={2} value={editing.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            </Label>
            <Label t="المحتوى (## عنوان · > اقتباس · - قائمة · **غامق**)">
              <textarea
                className="field font-mono"
                rows={18}
                value={editing.content}
                onChange={(e) => set('content', e.target.value)}
              />
            </Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => set('published', e.target.checked)}
              />
              منشور (يظهر للقرّاء)
            </label>
          </div>

          <div className="card h-fit p-6 lg:sticky lg:top-20">
            <span className="chip mb-3 w-fit">معاينة حيّة</span>
            {!editing.coverUrl && (
              <div className="relative mb-4 h-44 overflow-hidden rounded-xl">
                <Illustration article={editing} />
              </div>
            )}
            <h2 className="font-display text-3xl font-bold leading-snug">
              {editing.title || 'عنوان المقال'}
            </h2>
            <div className="reader mt-4 max-h-[60vh] overflow-auto pe-2" style={{ ['--font-size' as string]: '1.1rem' }}>
              <Markdown source={editing.content || 'ابدأ الكتابة لترى المعاينة…'} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">
          إدارة المقالات <span className="text-lg text-[var(--muted)]">({articles.length})</span>
        </h1>
        <div className="flex gap-2">
          <button
            className="btn"
            onClick={() => void logout()}
          >
            خروج
          </button>
          <button className="btn btn-primary" onClick={() => setEditing({ ...empty })}>
            + مقال جديد
          </button>
        </div>
      </div>

      <p className="mb-4 text-xs text-[var(--muted)]">
        تُحفظ المقالات كملفات JSON داخل المجلد <code dir="ltr">data/articles</code> في المشروع.
      </p>

      <div className="flex flex-col gap-3">
        {articles.map((a) => (
          <div key={a.id} className="card flex-row flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-display text-xl font-bold">{a.title}</h3>
                <span className={`chip ${a.published ? '' : 'opacity-60'}`}>
                  {a.published ? 'منشور' : 'مسوّدة'}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                {a.category}{a.collection ? ` · ${a.collection} (${a.episode || '؟'})` : ''} · {formatDate(a.updatedAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => toggle(a)}>
                {a.published ? 'إخفاء' : 'نشر'}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setError('')
                  setEditing(a)
                }}
              >
                تعديل
              </button>
              <button className="btn btn-danger" onClick={() => remove(a)}>
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Label({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[var(--muted)]">{t}</span>
      {children}
    </label>
  )
}
