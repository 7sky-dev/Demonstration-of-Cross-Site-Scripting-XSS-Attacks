// Checks three modes: vulnerable (raw), filtered (strips <script>, but bypassable), safe (encodes + headers).
const assert = require('node:assert');
const app = require('./server');

const server = app.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const search = (q) => fetch(`${base}/search?q=${encodeURIComponent(q)}`).then((r) => r.text());
  const next = () => fetch(`${base}/toggle`, { method: 'POST', redirect: 'manual' });
  try {
    // The search actually filters products.
    const fruits = await search('JAB');
    assert.match(fruits, /Jabłko/);
    assert.doesNotMatch(fruits, /Banan/);

    // Vulnerable mode: HTML goes in raw, no CSP.
    let res = await fetch(`${base}/search?q=${encodeURIComponent('<b>x</b>')}`);
    assert.match(await res.text(), /<b>x<\/b>\s*<\/strong>/);
    assert.equal(res.headers.get('content-security-policy'), null);

    // Filtered mode: <script> stripped, but <img onerror> gets through; this is not a defense (no CSP).
    await next();
    assert.doesNotMatch(await search('<script>alert(1)</script>'), /<script>alert\(1\)<\/script>/);
    assert.match(await search('<img src=x onerror=alert(1)>'), /<img src=x onerror=alert\(1\)>/);
    assert.equal((await fetch(`${base}/search`)).headers.get('content-security-policy'), null);

    // Safe mode: encoding + CSP + HttpOnly.
    await next();
    res = await fetch(`${base}/search?q=${encodeURIComponent('<b>x</b>')}`);
    const html = await res.text();
    assert.doesNotMatch(html, /<b>x<\/b>/);
    assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/);
    assert.ok(res.headers.get('content-security-policy'));
    assert.match(res.headers.get('set-cookie'), /HttpOnly/);
    console.log('ok');
  } finally {
    server.close();
  }
});
