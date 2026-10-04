import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  deleteCookie,
  getCookie,
  getRequestIP,
  setCookie,
} from '@tanstack/react-start/server'

/* مصادقة المشرف:
   - كلمة المرور مخزّنة مشفّرة (scrypt + salt) في .admin-auth.json خارج الكود وgit.
   - عند الدخول تُصدر جلسة موقّعة (HMAC-SHA256) في كوكي HttpOnly + SameSite=Strict،
     فلا تظهر كلمة المرور في المتصفح ولا تُرسَل مع كل طلب.
   - حماية من التخمين: ٥ محاولات فاشلة لكل IP تغلق الدخول ١٥ دقيقة. */

const COOKIE = 'sijill_owner'
const SESSION_MS = 8 * 60 * 60 * 1000
const MAX_FAILS = 5
const LOCK_MS = 15 * 60 * 1000

type AuthFile = { salt: string; hash: string; secret: string }

let cached: AuthFile | null = null
const load = (): AuthFile | null => {
  if (cached) return cached
  try {
    cached = JSON.parse(readFileSync(join(process.cwd(), '.admin-auth.json'), 'utf8'))
    return cached
  } catch {
    return null
  }
}

const sign = (payload: string, secret: string) =>
  createHmac('sha256', secret).update(payload).digest('hex')

const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

const fails = new Map<string, { n: number; until: number }>()
const ipOf = () => {
  try {
    return getRequestIP({ xForwardedFor: true }) ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

export function login(password: string) {
  const auth = load()
  if (!auth) throw new Error('لم يتم إعداد كلمة المرور بعد')
  const ip = ipOf()
  const rec = fails.get(ip)
  if (rec && rec.until > Date.now()) {
    throw new Error('محاولات كثيرة. حاول لاحقًا.')
  }
  const attempt = scryptSync(String(password), auth.salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex')
  if (!safeEq(attempt, auth.hash)) {
    const n = (rec && rec.until === 0 ? rec.n : 0) + 1
    fails.set(ip, { n, until: n >= MAX_FAILS ? Date.now() + LOCK_MS : 0 })
    throw new Error('كلمة المرور غير صحيحة')
  }
  fails.delete(ip)
  const exp = String(Date.now() + SESSION_MS)
  setCookie(COOKIE, `${exp}.${sign(exp, auth.secret)}`, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MS / 1000,
  })
}

export function logout() {
  deleteCookie(COOKIE, { path: '/' })
}

export function isOwner(): boolean {
  const auth = load()
  const v = getCookie(COOKIE)
  if (!auth || !v) return false
  const [exp, sig] = v.split('.')
  if (!exp || !sig || Number(exp) < Date.now()) return false
  return safeEq(sig, sign(exp, auth.secret))
}

export function requireOwner() {
  if (!isOwner()) throw new Error('غير مصرّح')
}
