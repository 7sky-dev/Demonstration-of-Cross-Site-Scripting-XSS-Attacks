// Intentionally vulnerable training app (XSS)
const path = require('node:path');
const express = require('express');
const products = require('./data/products');

const HOST = process.env.HOST || '127.0.0.1'; // HOST=0.0.0.0 exposes it on the local network (intentionally vulnerable app!)
const PORT = Number(process.env.PORT) || 3000;

let mode = 'vuln'; // 'vuln' | 'filter' | 'safe' — cycling toggle in the header
const MODES = ['vuln', 'filter', 'safe'];
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const comments = ['Welcome to the guestbook!']; // shortcut: in-memory data, lost on restart

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Defense in safe mode: HttpOnly cookie + CSP (scripts and styles only from this server).
app.use((req, res, next) => {
  const safe = mode === 'safe';
  res.cookie('session', 'demo-123', { sameSite: 'lax', httpOnly: safe });
  if (safe) res.set('Content-Security-Policy', "default-src 'self'");
  res.locals.safe = safe;
  res.locals.mode = mode;
  res.locals.path = req.path;
  // How the value reaches the page: safe = encoding (defense), filter = naive <script> stripping (bypassable), vuln = raw.
  res.locals.show = (s) => {
    s = String(s);
    if (mode === 'safe') return escapeHtml(s);
    if (mode === 'filter') return s.replace(/<\/?script>/gi, '');
    return s;
  };
  next();
});

app.post('/toggle', (req, res) => {
  mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  res.redirect(303, req.get('referer') || '/');
});

app.get('/', (req, res) => res.render('index', {
  title: 'Aplikacja do demonstracji ataków XSS',
  authors: ['Piotr Kapeluszny', 'Jakub Siuzdak', 'Wojciech Aleksander'],
}));

app.get('/search', (req, res) => {
  const q = String(req.query.q || '');
  const needle = q.trim().toLocaleLowerCase('pl');
  res.render('search', {
    title: 'Reflected XSS',
    lead: 'Sklep z owocami. Szukana fraza wraca w odpowiedzi serwera i trafia do strony nad wynikami.',
    q,
    results: products.filter((p) => p.name.toLocaleLowerCase('pl').includes(needle)),
  });
});

app.get('/guestbook', (req, res) => res.render('guestbook', {
  title: 'Stored XSS',
  lead: 'Wpisy są zapisywane na serwerze i pokazywane każdemu, kto wejdzie na tę stronę.',
  comments,
}));

app.post('/guestbook', (req, res) => {
  const text = String(req.body.text || '');
  if (text) comments.push(text);
  res.redirect(303, '/guestbook');
});

app.post('/guestbook/clear', (req, res) => {
  comments.length = 1;
  res.redirect(303, '/guestbook');
});

app.get('/dom', (req, res) => res.render('dom', {
  title: 'DOM-based XSS',
  lead: 'Skrypt w przeglądarce bierze fragment adresu po znaku # i wstawia go do strony. Serwer w ogóle go nie widzi.',
}));

if (require.main === module) {
  app.listen(PORT, HOST, () => console.log(`Laboratorium XSS: http://${HOST}:${PORT}  (tylko lokalnie)`));
}

module.exports = app;
