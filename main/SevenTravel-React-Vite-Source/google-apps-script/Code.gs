const HEADERS = [
  'Thời gian', 'Họ và tên', 'Số điện thoại', 'Gói tour', 'Đợt', 'Ngành hàng',
  'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
  'GCLID', 'FBCLID', 'Landing Path', 'Page URL', 'Referrer', 'User Agent', 'Trạng thái'
]

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength || 500)
}

function escapeHtml(value) {
  return clean(value, 500)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function doPost(event) {
  const lock = LockService.getScriptLock()
  try {
    const data = JSON.parse(event.postData.contents || '{}')
    const properties = PropertiesService.getScriptProperties()
    const expectedSecret = properties.getProperty('WEBHOOK_SECRET')
    if (!expectedSecret || data.secret !== expectedSecret) return jsonResponse({ ok: false, error: 'Unauthorized' })

    const sheetId = properties.getProperty('SHEET_ID')
    if (!sheetId) return jsonResponse({ ok: false, error: 'Missing SHEET_ID' })
    const spreadsheet = SpreadsheetApp.openById(sheetId)
    const sheetName = properties.getProperty('SHEET_NAME') || 'LEADS_CANTON_FAIR'
    let sheet = spreadsheet.getSheetByName(sheetName)
    if (!sheet) sheet = spreadsheet.insertSheet(sheetName)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS)
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0B3D6D').setFontColor('#FFFFFF')
      sheet.setFrozenRows(1)
    }

    const phone = clean(data.phone, 20).replace(/\D/g, '')
    const submittedAt = new Date(data.submitted_at || Date.now())
    if (!phone || isNaN(submittedAt.getTime())) return jsonResponse({ ok: false, error: 'Invalid lead' })

    lock.waitLock(10000)
    const lastRow = sheet.getLastRow()
    const firstRow = Math.max(2, lastRow - 199)
    const rowCount = Math.max(0, lastRow - firstRow + 1)
    if (rowCount > 0) {
      const recent = sheet.getRange(firstRow, 1, rowCount, 4).getValues()
      const duplicate = recent.some(row => {
        const previousTime = row[0] instanceof Date ? row[0].getTime() : Date.parse(row[0])
        const previousPhone = String(row[2] || '').replace(/\D/g, '')
        return previousPhone === phone && submittedAt.getTime() - previousTime < 30 * 60 * 1000
      })
      if (duplicate) return jsonResponse({ ok: true, duplicate: true })
    }

    sheet.appendRow([
      submittedAt,
      clean(data.name, 80),
      phone,
      clean(data.tour, 120),
      clean(data.phase, 80),
      clean(data.industry, 300),
      clean(data.utm_source, 120),
      clean(data.utm_medium, 120),
      clean(data.utm_campaign, 180),
      clean(data.utm_content, 180),
      clean(data.utm_term, 180),
      clean(data.gclid, 220),
      clean(data.fbclid, 220),
      clean(data.landing_path, 120),
      clean(data.page_url, 500),
      clean(data.referrer, 500),
      clean(data.user_agent, 500),
      'Mới'
    ])

    const notifyEmail = properties.getProperty('NOTIFY_EMAIL') || 'info@seventravel.vn'
    MailApp.sendEmail({
      to: notifyEmail,
      subject: 'Lead mới – Tour Canton Fair 140 – ' + clean(data.name, 80),
      htmlBody:
        '<h2>Khách hàng yêu cầu tư vấn Canton Fair 140</h2>' +
        '<p><b>Họ tên:</b> ' + escapeHtml(data.name) + '</p>' +
        '<p><b>Điện thoại:</b> ' + escapeHtml(phone) + '</p>' +
        '<p><b>Gói tour:</b> ' + escapeHtml(data.tour) + '</p>' +
        '<p><b>Đợt:</b> ' + escapeHtml(data.phase) + '</p>' +
        '<p><b>Nguồn:</b> ' + escapeHtml(data.utm_source || 'direct') + ' / ' + escapeHtml(data.utm_campaign) + '</p>'
    })
    return jsonResponse({ ok: true, duplicate: false })
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message || error) })
  } finally {
    try { lock.releaseLock() } catch (_) {}
  }
}
