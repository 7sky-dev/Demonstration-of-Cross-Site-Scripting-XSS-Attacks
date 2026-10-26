// safe: textContent (plain text). filter: naive <script> stripping before innerHTML (bypassable). vuln: innerHTML.
const mode = document.body.dataset.mode;

function render() {
  let value = decodeURIComponent(location.hash.slice(1));
  const el = document.getElementById('name');
  if (mode === 'safe') { el.textContent = value; return; }
  if (mode === 'filter') value = value.replace(/<\/?script>/gi, '');
  el.innerHTML = value;
}

render();
window.addEventListener('hashchange', render);
