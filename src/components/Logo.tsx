/* شعار «سِجِلّ»: كلمة بخط الرقعة بتدرّج ذهبي من لون الثيم الحالي، وتحتها عبارة صغيرة. */
export function Logo({ size = 40, tagline = true }: { size?: number; tagline?: boolean }) {
  return (
    <span className="logo">
      <span className="logo-text">
        <span
          className="gold-text font-display font-bold leading-none"
          style={{ fontSize: `${size * 0.8}px` }}
        >
          سِجِلّ
        </span>
        {tagline && <span className="logo-tag">أرشيف التاريخ</span>}
      </span>
    </span>
  )
}
