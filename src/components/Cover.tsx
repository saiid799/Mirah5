import type { Article } from '../lib/types'
import { Illustration } from './Illustration'

type CoverArticle = Pick<Article, 'category' | 'coverUrl' | 'period'> &
  Partial<Pick<Article, 'title' | 'collection' | 'excerpt' | 'motif'>>

// الغلاف: صورة المقال إن وُجدت، وإلا رسم تلقائي يُولَّد من عنوانه وتصنيفه
export function Cover({
  article,
  className = '',
}: {
  article: CoverArticle
  className?: string
}) {
  return (
    <div
      className={`cover ${article.coverUrl ? 'cover-photo' : 'cover-art'} ${className}`}
    >
      {!article.coverUrl && <Illustration article={article} />}
      {article.coverUrl && (
        <>
          <span
            className="cover-img"
            style={{ backgroundImage: `url(${JSON.stringify(article.coverUrl)})` }}
          />
          <span className="cover-shade" />
        </>
      )}
      {article.period && <span className="cover-period">{article.period}</span>}
    </div>
  )
}
