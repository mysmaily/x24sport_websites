const pageUrl = 'https://mayaobongro.vn/lien-he/';

const html = await fetch(`${pageUrl}?contact_test=${Date.now()}`).then((res) => res.text());
const nonceMatch = html.match(/name="x24_contact_nonce" value="([^"]+)"/);
if (!nonceMatch) {
  throw new Error('Contact nonce not found');
}
const startedAtMatch = html.match(/name="x24_started_at" value="([^"]+)"/);
const startedSigMatch = html.match(/name="x24_started_sig" value="([^"]+)"/);
if (!startedAtMatch || !startedSigMatch) {
  throw new Error('Anti-spam timestamp fields not found');
}

await new Promise((resolve) => setTimeout(resolve, 3200));

const body = new URLSearchParams();
body.set('action', 'x24_contact_submit');
body.set('x24_contact_nonce', nonceMatch[1]);
body.set('x24_started_at', startedAtMatch[1]);
body.set('x24_started_sig', startedSigMatch[1]);
body.set('_wp_http_referer', '/lien-he/');
body.set('x24_name', 'Codex Test');
body.set('x24_phone', '0900000000');
body.set('x24_request', `Tin nhan test form lien he Mayaobongro.vn ${new Date().toISOString()}`);

const response = await fetch('https://mayaobongro.vn/wp-admin/admin-post.php', {
  method: 'POST',
  body,
  redirect: 'manual',
});

console.log(JSON.stringify({
  status: response.status,
  location: response.headers.get('location'),
  hasForm: html.includes('name="x24_name"') && html.includes('name="x24_phone"') && html.includes('name="x24_request"'),
  hasMap: html.includes('google.com/maps/embed'),
  hasPlaceholder: html.includes('Tôi cần đặt may áo bóng rổ cho trường'),
  hasLoadingLabel: html.includes('Đang gửi...'),
  hasAntiSpam: html.includes('name="website"') && html.includes('name="x24_started_at"') && html.includes('name="x24_started_sig"'),
  leaksToken: html.includes('8859811830:') || html.includes('AAFS3'),
}, null, 2));

if (response.status !== 302 || !(response.headers.get('location') || '').includes('x24_contact=sent')) {
  process.exit(1);
}
