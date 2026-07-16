const pageUrl = 'https://mayaobongro.vn/';

async function getHome() {
  const html = await fetch(`${pageUrl}?order_test=${Date.now()}`).then((res) => res.text());
  const nonce = html.match(/name="x24_home_order_nonce" value="([^"]+)"/)?.[1];
  const startedAt = html.match(/name="x24_started_at" value="([^"]+)"/)?.[1];
  const startedSig = html.match(/name="x24_started_sig" value="([^"]+)"/)?.[1];
  if (!nonce || !startedAt || !startedSig) {
    throw new Error('Home order form anti-spam fields not found');
  }
  return { html, nonce, startedAt, startedSig };
}

async function submit(fields) {
  const body = new URLSearchParams();
  body.set('action', 'x24_home_order_submit');
  body.set('x24_home_order_nonce', fields.nonce);
  body.set('x24_started_at', fields.startedAt);
  body.set('x24_started_sig', fields.startedSig);
  body.set('_wp_http_referer', '/');
  body.set('x24_order_name', fields.name ?? 'Codex Home Test');
  body.set('x24_order_phone', fields.phone ?? '');
  body.set('x24_order_quantity', fields.quantity ?? '12');
  body.set('x24_order_date', fields.date ?? '1 tuần');
  return fetch('https://mayaobongro.vn/wp-admin/admin-post.php', {
    method: 'POST',
    body,
    redirect: 'manual',
  });
}

const first = await getHome();
await new Promise((resolve) => setTimeout(resolve, 3200));
const success = await submit({ ...first, phone: '0900000000' });

const second = await getHome();
await new Promise((resolve) => setTimeout(resolve, 3200));
const missingPhone = await submit({ ...second, phone: '' });

const result = {
  successStatus: success.status,
  successLocation: success.headers.get('location'),
  missingPhoneStatus: missingPhone.status,
  missingPhoneLocation: missingPhone.headers.get('location'),
  hasForm: first.html.includes('data-x24-home-order-form'),
  hasFields: ['x24_order_name', 'x24_order_phone', 'x24_order_quantity', 'x24_order_date'].every((name) => first.html.includes(`name="${name}"`)),
  phoneRequired: /name="x24_order_phone"[^>]*required/.test(first.html),
  hasOverlay: first.html.includes('x24-home-order-overlay') && first.html.includes('x24-home-order-panel'),
  hasConsultButton: first.html.includes('Nhận tư vấn'),
  hasDateChoices: ['4 ngày', '5 ngày', '1 tuần', 'Trên 1 tuần'].every((choice) => first.html.includes(choice)),
  hasLoadingLabel: first.html.includes('Đang gửi...'),
  hasAntiSpam: first.html.includes('name="website"') && first.html.includes('name="x24_started_at"') && first.html.includes('name="x24_started_sig"'),
  leaksToken: first.html.includes('8859811830:') || first.html.includes('AAFS3'),
};

console.log(JSON.stringify(result, null, 2));

if (
  result.successStatus !== 302
  || !(result.successLocation || '').includes('x24_order=sent')
  || result.missingPhoneStatus !== 302
  || !(result.missingPhoneLocation || '').includes('x24_order=error')
  || !result.hasForm
  || !result.hasFields
  || !result.phoneRequired
  || !result.hasOverlay
  || !result.hasConsultButton
  || !result.hasDateChoices
  || !result.hasLoadingLabel
  || !result.hasAntiSpam
  || result.leaksToken
) {
  process.exit(1);
}
