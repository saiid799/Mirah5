import { useId } from 'react'

/* رسم تلقائي لكل مقال: مشهد تاريخي + صورة شخصية بأسلوب «السيلويت» المسطّح
   (ألوان قليلة، ظلال حادة، حبر أسود) بألوان الموقع التاريخية.
   يُشتقّ من عنوان المقال وتصنيفه، فكل مقال جديد يحصل على رسمه تلقائيًا.
   أمّا الحقل motif فيتيح تغيير نوع المشهد يدويًا. */

export const motifs = {
  japan: 'اليابان / الساموراي',
  islamic: 'الحضارة الإسلامية',
  fortress: 'حصار ومعارك',
  sea: 'بحار واستكشاف',
  ancient: 'حضارات قديمة',
} as const
export type Motif = keyof typeof motifs

const keywords: Record<Motif, RegExp> = {
  japan: /ياباني|اليابان|ساموراي|ياماتو|شوجون|كاماكورا|جومون|ميناموتو|طوكيو/,
  islamic: /مسجد|إسلام|الإسلام|عباسي|العباس|الأندلس|قرطبة|بغداد|خلافة|أموي|بيت الحكمة|مملوك|دمشق/,
  fortress: /حصار|فتح |معركة|حرب|حطين|أسوار|قلعة|غزو|جيش|القسطنطينية|صلاح الدين/,
  sea: /بحر|سفين|أسطول|ملاح|رحلة|استكشاف|محيط|جزر/,
  ancient: /فرعون|مصر|بابل|رومان|إغريق|يونان|سومر|قديم|حضارة|ما قبل/,
}

export function detectMotif(a: {
  title?: string
  category?: string
  collection?: string
  excerpt?: string
  motif?: string
}): Motif {
  if (a.motif && a.motif in motifs) return a.motif as Motif
  let best: Motif = 'ancient'
  let bestScore = 0
  for (const m of Object.keys(keywords) as Motif[]) {
    const re = keywords[m]
    const score =
      (re.test(a.title ?? '') ? 3 : 0) +
      (re.test(a.category ?? '') ? 3 : 0) +
      (re.test(a.collection ?? '') ? 3 : 0) +
      (re.test(a.excerpt ?? '') ? 1 : 0)
    if (score > bestScore) {
      best = m
      bestScore = score
    }
  }
  return best
}

// ألوان تاريخية: قرمزي، لازورد، ذهب، زمرد، بنفسجي ملكي
const palettes = [
  { bg: '#b3261a', mid: '#e8673c', shade: '#6e120c' }, // قرمزي
  { bg: '#1f3a8f', mid: '#6d93e0', shade: '#101f55' }, // لازورد
  { bg: '#d9ac4f', mid: '#f6dc96', shade: '#98691a' }, // ذهبي
  { bg: '#0f6b57', mid: '#52b898', shade: '#073a2e' }, // زمردي
  { bg: '#5b2a86', mid: '#a56bd0', shade: '#2f1347' }, // بنفسجي
]
const INK = '#0b0a0c'

const hash = (s: string) =>
  [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) >>> 0
  let t = seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// لون المقال التاريخي نفسه (يُستعمل لتلوين الصور الحقيقية بما يوافق الرسم)
export const tintFor = (a: { title?: string; category?: string }) =>
  palettes[hash(`${a.title ?? ''}|${a.category ?? ''}`) % palettes.length]

type P = (typeof palettes)[number]

/* ───────── المشاهد (الخلفية البعيدة) ───────── */
function Scene({ motif, p, r }: { motif: Motif; p: P; r: () => number }) {
  const base = 350
  switch (motif) {
    case 'japan':
      return (
        <g>
          <path d={`M60 ${base} L300 150 L330 150 L570 ${base}Z`} fill={p.shade} />
          <path d="M300 150 L330 150 L352 182 L326 172 L312 190 L296 170 L276 184Z" fill={p.mid} />
          {/* بوابة توري */}
          <g fill={INK}>
            <rect x="590" y="215" width="14" height="140" />
            <rect x="690" y="215" width="14" height="140" />
            <path d="M570 200 Q647 225 724 200 L724 218 Q647 240 570 218Z" />
            <rect x="598" y="242" width="98" height="10" />
          </g>
          {/* باغودا */}
          <g fill={INK} transform="translate(120 0)">
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M${60 - i * 8} ${270 + i * 26} L${110 + i * 8} ${270 + i * 26} L${124 + i * 8} ${284 + i * 26} L${46 - i * 8} ${284 + i * 26}Z`} />
            ))}
            <rect x="82" y="240" width="6" height="30" />
          </g>
        </g>
      )
    case 'islamic':
      return (
        <g fill={p.shade}>
          <rect x="0" y={base} width="800" height="30" />
          <path d={`M230 ${base} v-90 a110 110 0 0 1 220 0 v90Z`} />
          <rect x="336" y="130" width="8" height="40" />
          <circle cx="340" cy="122" r="14" fill={p.mid} />
          <circle cx="345" cy="119" r="12" fill={p.shade} />
          {[120, 530, 640].map((x, i) => (
            <g key={x}>
              <rect x={x} y={i === 0 ? 170 : 210} width="26" height={base - (i === 0 ? 170 : 210)} />
              <path d={`M${x - 4} ${i === 0 ? 170 : 210} h34 l-17 -34Z`} fill={INK} />
              <rect x={x - 6} y={i === 0 ? 215 : 255} width="38" height="8" fill={INK} />
            </g>
          ))}
          <g fill={INK}>
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M${255 + i * 40} ${base} v-28 a14 14 0 0 1 28 0 v28Z`} />
            ))}
          </g>
        </g>
      )
    case 'fortress':
      return (
        <g>
          <g fill={p.shade}>
            <rect x="0" y="270" width="800" height="90" />
            {Array.from({ length: 18 }).map((_, i) => (
              <rect key={i} x={i * 46 + 6} y="250" width="28" height="24" />
            ))}
            <rect x="110" y="170" width="90" height="190" />
            <rect x="560" y="150" width="100" height="210" />
          </g>
          <g fill={INK}>
            {[110, 560].map((x, i) => (
              <g key={x}>
                {Array.from({ length: 4 }).map((_, k) => (
                  <rect key={k} x={x + k * 25 + (i ? 4 : 0)} y={i ? 130 : 150} width="17" height="22" />
                ))}
                <path d={`M${x + 38} ${i ? 130 : 150} V${i ? 70 : 90}`} stroke={INK} strokeWidth="5" />
                <path d={`M${x + 41} ${i ? 72 : 92} h46 l-12 14 l12 14 h-46Z`} fill={p.mid} />
                <path d={`M${x + 28} 230 v${60} a10 10 0 0 0 20 0 v-${60} a10 10 0 0 0 -20 0Z`} />
              </g>
            ))}
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M${300 + i * 60} 330 v-34 a12 12 0 0 1 24 0 v34Z`} />
            ))}
          </g>
        </g>
      )
    case 'sea':
      return (
        <g>
          <g fill={INK}>
            <path d="M250 330 Q400 372 570 318 L548 290 L270 292Z" />
            <rect x="404" y="130" width="7" height="170" />
            <path d="M414 140 Q500 190 498 276 L414 276Z" fill={p.mid} />
            <path d="M398 160 Q330 210 332 276 L398 276Z" fill={p.shade} />
          </g>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M-20 ${355 + i * 22} q50 -${26 - i * 4} 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 V450 H-20Z`}
              fill={i % 2 ? p.shade : INK}
              opacity={0.55 + i * 0.2}
            />
          ))}
        </g>
      )
    default:
      return (
        <g>
          <g fill={p.shade}>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={250 + i * 18} y={base - 40 - i * 36} width={300 - i * 36} height="40" />
            ))}
            <path d={`M600 ${base} L700 190 L800 ${base}Z`} />
          </g>
          <g fill={INK}>
            {[150, 170, 190].map((x, i) => (
              <rect key={x} x={x} y={200 + i * 6} width="9" height={base - 200 - i * 6} />
            ))}
            <rect x="140" y="190" width="70" height="10" />
          </g>
          {Array.from({ length: 9 }).map((_, i) => (
            <circle key={i} cx={40 + r() * 720} cy={30 + r() * 110} r={1.5 + r() * 2} fill={p.mid} />
          ))}
        </g>
      )
  }
}

/* ───────── صورة الشخصية ───────── */
function Figure({ motif, p, r }: { motif: Motif; p: P; r: () => number }) {
  const beard = r() > 0.45
  return (
    <g>
      {/* الكتفان */}
      <path d="M-190 240 C-180 130 -110 100 -50 86 L50 86 C110 100 180 130 190 240Z" fill={INK} />
      <path d="M-34 86 L0 150 L34 86Z" fill={p.shade} />
      {/* الرأس مائل للأعلى */}
      <g transform="rotate(-9 0 60)">
        <path d="M-26 40 L26 40 L30 92 L-30 92Z" fill={p.shade} />
        <clipPath id={`h${motif}`}>
          <ellipse cx="0" cy="-10" rx="54" ry="68" />
        </clipPath>
        <ellipse cx="0" cy="-10" rx="54" ry="68" fill={p.mid} />
        <path d="M6 -80 Q70 -40 56 30 Q30 66 0 58Z" fill={p.shade} clipPath={`url(#h${motif})`} />
        <path d="M-30 -14 q10 8 22 0 M12 -14 q10 8 22 0" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M-2 -6 q-6 22 2 24" stroke={p.shade} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M-14 30 q14 8 28 0" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        {beard && <path d="M-44 6 Q-40 78 0 84 Q40 78 44 6 Q30 52 0 54 Q-30 52 -44 6Z" fill={INK} />}
        <Headgear motif={motif} p={p} />
      </g>
    </g>
  )
}

function Headgear({ motif, p }: { motif: Motif; p: P }) {
  switch (motif) {
    case 'japan':
      return (
        <g fill={INK}>
          <path d="M-58 -16 C-62 -90 62 -90 58 -16 C44 -50 -44 -50 -58 -16Z" />
          <ellipse cx="0" cy="-92" rx="14" ry="18" />
          <rect x="-4" y="-80" width="8" height="14" />
        </g>
      )
    case 'islamic':
      return (
        <g>
          <path d="M-62 -26 C-70 -112 70 -112 62 -26 C40 -52 -40 -52 -62 -26Z" fill={INK} />
          <path d="M-56 -44 Q0 -66 56 -44 M-58 -58 Q0 -82 58 -58" stroke={p.mid} strokeWidth="4" fill="none" />
          <circle cx="0" cy="-104" r="6" fill={p.mid} />
        </g>
      )
    case 'fortress':
      return (
        <g fill={INK}>
          <path d="M-60 -10 C-66 -96 66 -96 60 -10 L48 -20 C30 -52 -30 -52 -48 -20Z" />
          <path d="M-6 -96 Q40 -150 70 -100 Q30 -118 4 -92Z" fill={p.mid} />
          <rect x="-5" y="-62" width="10" height="48" />
        </g>
      )
    case 'sea':
      return (
        <g fill={INK}>
          <path d="M-60 -22 C-60 -80 60 -80 60 -22 Z" />
          <path d="M-86 -22 Q0 -4 86 -22 Q0 -40 -86 -22Z" />
          <path d="M-14 -62 h28 v12 h-28z" fill={p.mid} />
        </g>
      )
    default:
      return (
        <g fill={INK}>
          <path d="M-56 -26 C-60 -86 60 -86 56 -26 C40 -54 -40 -54 -56 -26Z" />
          <path d="M-52 -42 Q0 -62 52 -42" stroke={p.mid} strokeWidth="5" fill="none" />
          <path d="M-12 -80 l12 -26 l12 26Z" fill={p.mid} />
        </g>
      )
  }
}

export function Illustration({
  article,
  className = '',
}: {
  article: {
    title?: string
    category?: string
    collection?: string
    excerpt?: string
    motif?: string
  }
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const seedStr = `${article.title ?? ''}|${article.category ?? ''}`
  const h = hash(seedStr)
  const r = rng(h)
  const motif = detectMotif(article)
  const p = palettes[h % palettes.length]
  const figX = r() > 0.5 ? 255 : 545
  const sunX = figX > 400 ? 230 : 570

  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    >
      <defs>
        <filter id={`w${uid}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed={h % 50} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
        </filter>
        <filter id={`g${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
        <radialGradient id={`v${uid}`} cx="50%" cy="45%" r="75%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <rect width="800" height="450" fill={p.bg} />
      <g filter={`url(#w${uid})`}>
        <circle cx={sunX} cy="170" r="150" fill={p.mid} opacity="0.9" />
        <circle cx={sunX} cy="170" r="190" fill="none" stroke={p.mid} strokeWidth="3" opacity="0.5" />
        <Scene motif={motif} p={p} r={r} />
        <rect x="0" y="350" width="800" height="100" fill={INK} opacity="0.92" />
        <g transform={`translate(${figX} 268) scale(1.45)`}>
          <Figure motif={motif} p={p} r={r} />
        </g>
      </g>
      <rect width="800" height="450" filter={`url(#g${uid})`} opacity="0.35" style={{ mixBlendMode: 'multiply' }} />
      <rect width="800" height="450" fill={`url(#v${uid})`} />
    </svg>
  )
}
