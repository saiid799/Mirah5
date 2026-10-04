// تعيين/تغيير كلمة مرور المشرف. الاستعمال:  node scripts/set-admin-password.mjs "كلمة_المرور"
// تُخزَّن كلمة المرور مشفّرة (scrypt + salt عشوائي) في .admin-auth.json (مستثنى من git)،
// مع مفتاح سري عشوائي لتوقيع جلسات الدخول. لا تُحفظ كلمة المرور نفسها في أي مكان.
import { randomBytes, scryptSync } from 'node:crypto'
import { writeFileSync } from 'node:fs'

const pw = process.argv[2]
if (!pw || pw.length < 6) {
  console.error('أعطِ كلمة مرور من ٦ أحرف على الأقل.')
  process.exit(1)
}
const salt = randomBytes(16).toString('hex')
const hash = scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex')
const secret = randomBytes(32).toString('hex')
writeFileSync('.admin-auth.json', JSON.stringify({ salt, hash, secret }, null, 2), { mode: 0o600 })
console.log('تم حفظ كلمة المرور مشفّرة في .admin-auth.json')
