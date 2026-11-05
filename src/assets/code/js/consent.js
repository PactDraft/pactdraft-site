/* PactDraft cookie consent.
   Visitors whose browser time zone is in Europe (incl. UK) or the nearby Atlantic islands are asked before advertising loads.
   Everyone else sees no banner (see the Cookie Policy). The choice is kept in localStorage "pd_consent".
   Ads (mgid.js) wait for window.pdConsent.state === true. The footer link "Cookie settings" re-opens the banner. */
(function () {
  'use strict';
  var KEY = 'pd_consent', saved = null, tz = '';
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { /* ignore */ }
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* ignore */ }
  var needed = /^Europe\//.test(tz) || /^Atlantic\/(Reykjavik|Madeira|Canary|Azores|Faroe)$/.test(tz);
  var api = window.pdConsent = { needed: needed, state: (saved && typeof saved.ads === 'boolean') ? saved.ads : (needed ? null : true), open: openBanner };

  function save(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ ads: v, ts: Date.now() })); } catch (e) { /* ignore */ }
    api.state = v;
    var b = document.getElementById('pd-consent'); if (b && b.parentNode) b.parentNode.removeChild(b);
    try { window.dispatchEvent(new Event('pd-consent')); } catch (e) { /* ignore */ }
  }

  function openBanner() {
    if (document.getElementById('pd-consent')) return;
    var dark = document.documentElement.classList.contains('dark');
    var b = document.createElement('div');
    b.id = 'pd-consent'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Cookie consent');
    b.style.cssText = 'position:fixed;z-index:2147483000;left:12px;right:12px;bottom:12px;max-width:520px;padding:16px;border-radius:14px;font:14px/1.5 system-ui,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,.22);border:1px solid ' + (dark ? '#33423d' : '#cfd6d1') + ';background:' + (dark ? '#16201d' : '#ffffff') + ';color:' + (dark ? '#e8efe9' : '#1b1c1c');
    b.innerHTML = '<p style="margin:0 0 12px">We use cookies and similar technology to show advertising. Allow it? You can change your mind any time from "Cookie settings" in the footer. <a href="/cookie-policy/" style="text-decoration:underline;color:inherit">Cookie Policy</a></p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" data-v="1" style="padding:9px 16px;border-radius:9px;border:0;background:#045f1c;color:#fff;font-weight:600;cursor:pointer">Accept</button>' +
      '<button type="button" data-v="0" style="padding:9px 16px;border-radius:9px;border:1px solid ' + (dark ? '#4a5b55' : '#9aa7a0') + ';background:transparent;color:inherit;font-weight:600;cursor:pointer">Reject</button></div>';
    b.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute && e.target.getAttribute('data-v');
      if (v === '1') save(true); else if (v === '0') save(false);
    });
    document.body.appendChild(b);
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href="#cookie-settings"]');
    if (a) { e.preventDefault(); openBanner(); }
  });
  if (needed && api.state === null) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openBanner); else openBanner();
  }
})();
