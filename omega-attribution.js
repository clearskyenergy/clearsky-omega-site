/* omega-attribution.js — where a visitor came from, kept for the demo form
   © 2025–2026 ClearSky Energy Solutions LLC. Proprietary and Confidential.

   A LinkedIn post links to a page with ?utm_source=linkedin&utm_campaign=…,
   but the visitor reads two pages before pressing "Request a demo", and by
   then the tags are gone from the address. This keeps the FIRST touch
   (utm tags, the referring site, the page they landed on) in this browser
   only, and contact.html sends it with the request so the sales board can
   say which post brought which lead.

   Nothing leaves the browser from here. No cookie, no third party, no
   identifier: a source, a campaign and a landing page. Storage can be
   blocked or cleared (private windows, previews), so every read and write is
   wrapped and a missing value is simply "direct". ES5, no build step. */
(function () {
  var KEY = 'omega.firstTouch';
  var MAX_AGE = 30 * 86400000;
  function read() {
    try { var v = JSON.parse(window.localStorage.getItem(KEY) || 'null'); return v && typeof v === 'object' ? v : null; } catch (e) { return null; }
  }
  function write(v) { try { window.localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function param(q, n) {
    var m = new RegExp('[?&]' + n + '=([^&#]*)').exec(q || '');
    if (!m) return '';
    try { return decodeURIComponent(m[1].replace(/\+/g, ' ')).slice(0, 80); } catch (e) { return ''; }
  }
  function external(ref) {
    var m = /^https?:\/\/([^\/?#]+)/i.exec(ref || '');
    if (!m) return '';
    var host = m[1].toLowerCase();
    return /(^|\.)clearskyomega\.com$/.test(host) ? '' : host;
  }
  var q = window.location.search, now = Date.now();
  var touch = {
    source: param(q, 'utm_source'), medium: param(q, 'utm_medium'),
    campaign: param(q, 'utm_campaign'), content: param(q, 'utm_content'),
    ref: external(document.referrer), landing: window.location.pathname.slice(0, 80), at: now
  };
  var had = read();
  var fresh = !had || !had.at || now - had.at > MAX_AGE;
  /* a tagged arrival is always worth recording over an untagged one: the
     post that sent them is the fact the board needs */
  if (fresh || (touch.source && !had.source)) {
    if (touch.source || touch.ref || fresh) write(touch);
  }
  window.OmegaAttribution = { get: function () { return read() || {}; } };
})();
