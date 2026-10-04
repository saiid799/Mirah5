import type { ReactNode } from 'react'

// محوّل ماركداون مبسّط: ## عناوين، > اقتباس، - قوائم، **غامق**، *مائل*
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
      if (part.startsWith('*') && part.length > 2)
        return <em key={i}>{part.slice(1, -1)}</em>
      return part
    })
}

// تقسيم الفقرة الطويلة عند حدود الجُمل إلى مقاطع قصيرة (≈ ٢٨٠ حرفًا) لراحة القراءة
function chunk(text: string, max = 280): string[] {
  const flat = text.replace(/\n/g, ' ')
  if (flat.length <= max * 1.4) return [flat]
  const sentences = flat.split(/(?<=[.؟!])\s+/)
  const out: string[] = []
  let cur = ''
  for (const s of sentences) {
    if (cur && (cur + ' ' + s).length > max) {
      out.push(cur)
      cur = s
    } else {
      cur = cur ? cur + ' ' + s : s
    }
  }
  if (cur) out.push(cur)
  return out
}

export function Markdown({ source }: { source: string }) {
  let h2 = -1
  let firstPara = true
  const blocks = source.replace(/\r/g, '').split(/\n{2,}/)
  return (
    <>
      {blocks.map((raw, i) => {
        const block = raw.trim()
        if (!block) return null
        // صورة: ![التعليق](الرابط "المصدر|رابط صفحة المصدر")
        const img = block.match(/^!\[(.*?)\]\((\S+?)(?:\s+"(.*)")?\)$/)
        if (img) {
          const [credit, page] = (img[3] ?? '').split('|')
          return (
            <figure key={i}>
              <img src={img[2]} alt={img[1]} loading="lazy" />
              <figcaption>
                {inline(img[1])}
                {credit && (
                  <small>
                    {page ? (
                      <a href={page} target="_blank" rel="noreferrer noopener">
                        {credit}
                      </a>
                    ) : (
                      credit
                    )}
                  </small>
                )}
              </figcaption>
            </figure>
          )
        }
        if (block.startsWith('### '))
          return <h3 key={i}>{inline(block.slice(4))}</h3>
        if (block.startsWith('## ') || block.startsWith('# ')) {
          h2++
          return (
            <h2 key={i} id={`s${h2}`}>
              {inline(block.replace(/^#+\s/, ''))}
            </h2>
          )
        }
        // لمحة سريعة: سطر يبدأ بـ «! »
        if (/^!\s/.test(block))
          return (
            <aside key={i} className="fact">
              <span className="fact-label">لمحة</span>
              <p>{inline(block.replace(/^!\s+/, ''))}</p>
            </aside>
          )
        if (/^\d+[.)] /.test(block))
          return (
            <ol key={i}>
              {block.split('\n').map((l, j) => (
                <li key={j}>{inline(l.replace(/^\d+[.)]\s+/, ''))}</li>
              ))}
            </ol>
          )
        if (block.startsWith('>'))
          return (
            <blockquote key={i}>
              {inline(block.replace(/^>\s?/gm, '').replace(/\n/g, ' '))}
            </blockquote>
          )
        if (/^[-*] /.test(block))
          return (
            <ul key={i}>
              {block.split('\n').map((l, j) => (
                <li key={j}>{inline(l.replace(/^[-*] /, ''))}</li>
              ))}
            </ul>
          )
        const lead = firstPara
        firstPara = false
        return (
          <div key={i} className={lead ? 'lead' : undefined}>
            {chunk(block).map((t, j) => (
              <p key={j}>{inline(t)}</p>
            ))}
          </div>
        )
      })}
    </>
  )
}
