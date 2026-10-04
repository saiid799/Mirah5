import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Logo } from '../components/Logo'
import appCss from '../styles.css?url'

// أيقونة التبويب: نفس النجمة الثمانية بألوان الأندلس الذهبية
const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#d9ac4f'/><stop offset='.55' stop-color='#f6e2a8'/><stop offset='1' stop-color='#c0492f'/></linearGradient></defs><polygon points='24,1.5 30.58,8.11 39.91,8.09 39.89,17.42 46.5,24 39.89,30.58 39.91,39.91 30.58,39.89 24,46.5 17.42,39.89 8.09,39.91 8.11,30.58 1.5,24 8.11,17.42 8.09,8.09 17.42,8.11' fill='url(#g)'/><polygon points='24,6.5 29.05,11.8 36.37,11.63 36.2,18.95 41.5,24 36.2,29.05 36.37,36.37 29.05,36.2 24,41.5 18.95,36.2 11.63,36.37 11.8,29.05 6.5,24 11.8,18.95 11.63,11.63 18.95,11.8' fill='#090c15' stroke='url(#g)' stroke-width='.8'/><path d='M24 14l8 10-8 10-8-10z' fill='url(#g)'/></svg>",
  )

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='bardi')t='noor';if(['andalus','diwan','noor'].indexOf(t)<0)t='andalus';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='andalus'}`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#090c15' },
      { title: 'سِجِلّ — مقالات في التاريخ' },
      {
        name: 'description',
        content: 'منصة عربية لقراءة مقالات التاريخ بأسلوب عصري وممتع.',
      },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: favicon },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Reem+Kufi:wght@400;500;600;700&family=Scheherazade+New:wght@400;500;700&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
    scripts: [{ children: themeScript }],
  }),
  shellComponent: RootDocument,
  component: () => (
    <>
      <Header />
      <main className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </>
  ),
  notFoundComponent: () => (
    <div className="container-x py-24 text-center">
      <h1 className="font-display text-6xl text-[var(--accent)]">٤٠٤</h1>
      <p className="mt-3 text-[var(--muted)]">الصفحة التي تبحث عنها غير موجودة.</p>
      <Link to="/" className="btn btn-primary mt-6">
        العودة للرئيسية
      </Link>
    </div>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const themes = [
  { id: 'andalus', name: 'ليل الأندلس', color: '#d9ac4f', bg: '#090c15' },
  { id: 'diwan', name: 'ليل الديوان', color: '#d9774e', bg: '#150e0b' },
  { id: 'noor', name: 'نور', color: '#0b6b5b', bg: '#f6f3ec' },
]

function ThemeSwitcher() {
  const [theme, setTheme] = useState('andalus')
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? 'andalus')
  }, [])
  const pick = (id: string) => {
    setTheme(id)
    document.documentElement.dataset.theme = id
    try {
      localStorage.setItem('theme', id)
    } catch {}
  }
  return (
    <div className="flex items-center gap-1 md:gap-2 md:px-2" role="group" aria-label="الثيم">
      {themes.map((t) => (
        <button
          key={t.id}
          className="swatch"
          title={t.name}
          aria-label={t.name}
          aria-pressed={theme === t.id}
          onClick={() => pick(t.id)}
          style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.color} 50%)` }}
        />
      ))}
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur">
      <div className="container-x flex items-center justify-between gap-2 py-2 md:py-3">
        <Link to="/" className="shrink-0" aria-label="سِجِلّ — الرئيسية">
          <Logo size={42} />
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className="btn nav-desktop border-transparent bg-transparent">
            المقالات
          </Link>
          <Link to="/collections" className="btn nav-desktop border-transparent bg-transparent">
            السلاسل
          </Link>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] pb-28 pt-8 text-center text-sm text-[var(--muted)] md:pb-8">
      <div className="orn mb-4 text-xl">❖</div>
      <div className="flex justify-center">
        <Logo size={64} tagline={false} />
      </div>
      <p className="mt-1 font-amiri">ذاكرة الأمم تُروى هنا — مقالات تاريخية بقراءة مريحة.</p>
    </footer>
  )
}

const icons = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  series: 'M4 6h16M4 12h16M4 18h10',
}

// شريط تنقل سفلي للهواتف: أزرار كبيرة في متناول الإبهام
function BottomNav() {
  const items = [
    { to: '/', label: 'المقالات', icon: icons.home, exact: true },
    { to: '/collections', label: 'السلاسل', icon: icons.series, exact: false },
  ] as const
  return (
    <nav className="bottom-nav md:hidden" aria-label="التنقل الرئيسي">
      {items.map((it) => (
        <Link
          key={it.to}
          to={it.to}
          activeOptions={{ exact: it.exact }}
          activeProps={{ 'data-active': 'true' }}
          className="bottom-nav-item"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={it.icon} />
          </svg>
          <span>{it.label}</span>
        </Link>
      ))}
    </nav>
  )
}
