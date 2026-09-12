const MAX_BODY_BYTES = 32 * 1024

function parseBody(request) {
  if (typeof request.body === 'string') return JSON.parse(request.body)
  return request.body || {}
}

function normalizePhone(value) {
  const cleaned = String(value || '').replace(/[^0-9+]/g, '')
  if (cleaned.startsWith('+84')) return `0${cleaned.slice(3)}`
  if (cleaned.startsWith('84') && cleaned.length >= 11) return `0${cleaned.slice(2)}`
  return cleaned
}

function isAllowedOrigin(request) {
  const origin = request.headers.origin
  if (!origin) return true
  try {
    const hostname = new URL(origin).hostname
    const allowed = new Set(['www.seventravel.vn', 'seventravel.vn', 'localhost', '127.0.0.1'])
    if (process.env.VERCEL_URL) allowed.add(process.env.VERCEL_URL)
    return allowed.has(hostname) || hostname.endsWith('.vercel.app')
  } catch (_) {
    return false
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ ok: false, message: 'Method not allowed' })
  }

  if (!isAllowedOrigin(request)) {
    return response.status(403).json({ ok: false, message: 'Nguồn gửi không hợp lệ.' })
  }

  const contentLength = Number(request.headers['content-length'] || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return response.status(413).json({ ok: false, message: 'Dữ liệu vượt giới hạn.' })
  }

  let body
  try {
    body = parseBody(request)
  } catch (_) {
    return response.status(400).json({ ok: false, message: 'Dữ liệu không hợp lệ.' })
  }

  // Honeypot: phản hồi thành công giả để bot không thử lại.
  if (String(body.company_website || '').trim()) {
    return response.status(200).json({ ok: true, duplicate: false })
  }

  const name = String(body.name || '').trim().slice(0, 80)
  const phone = normalizePhone(body.phone)
  const openedAt = Date.parse(body.opened_at || '')
  if (name.length < 2 || !/^0\d{8,10}$/.test(phone)) {
    return response.status(400).json({ ok: false, message: 'Vui lòng kiểm tra họ tên và số điện thoại.' })
  }
  if (!Number.isFinite(openedAt) || Date.now() - openedAt < 2000) {
    return response.status(429).json({ ok: false, message: 'Vui lòng chờ vài giây rồi gửi lại.' })
  }

  const endpoint = process.env.GOOGLE_APPS_SCRIPT_URL
  const secret = process.env.LEAD_WEBHOOK_SECRET
  if (!endpoint || !secret) {
    return response.status(503).json({ ok: false, message: 'Hệ thống nhận thông tin đang được cấu hình.' })
  }

  const payload = {
    secret,
    submitted_at: new Date().toISOString(),
    name,
    phone,
    tour: String(body.tour || '').slice(0, 120),
    phase: String(body.phase || '').slice(0, 80),
    industry: String(body.industry || '').slice(0, 300),
    page_url: String(body.page_url || '').slice(0, 500),
    landing_path: String(body.landing_path || '').slice(0, 120),
    referrer: String(body.referrer || '').slice(0, 500),
    user_agent: String(body.user_agent || '').slice(0, 500),
    utm_source: String(body.utm_source || '').slice(0, 120),
    utm_medium: String(body.utm_medium || '').slice(0, 120),
    utm_campaign: String(body.utm_campaign || '').slice(0, 180),
    utm_content: String(body.utm_content || '').slice(0, 180),
    utm_term: String(body.utm_term || '').slice(0, 180),
    gclid: String(body.gclid || '').slice(0, 220),
    fbclid: String(body.fbclid || '').slice(0, 220)
  }

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    })
    const text = await upstream.text()
    let result = {}
    try { result = JSON.parse(text) } catch (_) { result = {} }
    if (!upstream.ok || result.ok === false) throw new Error('Upstream rejected lead')
    return response.status(200).json({ ok: true, duplicate: Boolean(result.duplicate) })
  } catch (_) {
    return response.status(502).json({ ok: false, message: 'Chưa thể lưu yêu cầu. Vui lòng liên hệ Zalo hoặc hotline.' })
  }
}
