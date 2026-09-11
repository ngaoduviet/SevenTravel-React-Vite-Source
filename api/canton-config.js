export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ ok: false, message: 'Method not allowed' })
  }

  response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
  return response.status(200).json({
    ga4Id: process.env.GA4_ID || '',
    metaPixelId: process.env.META_PIXEL_ID || '',
    zaloUrl: process.env.ZALO_URL || 'https://zalo.me/0899525777',
    whatsappUrl: process.env.WHATSAPP_URL || 'https://wa.me/84899525777',
    messengerUrl: process.env.MESSENGER_URL || 'https://m.me/61591483266432',
    taxId: process.env.BUSINESS_TAX_ID || ''
  })
}
