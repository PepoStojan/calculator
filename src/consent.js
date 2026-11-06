/* Basic cookie-consent gate. No dependencies. Included only when ads or analytics are configured.
   The ad script is injected ONLY after the visitor clicks Accept. This is a simple gate, not a certified consent platform. */
(function () {
  var cfg = window.__CONSENT__ || {}, KEY = 'ch_consent', loaded = false;
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked: choice lasts for this page view only */ } }

  function loadAds() {
    if (loaded || !cfg.ads) return; loaded = true;
    var s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(cfg.ads);
    document.head.appendChild(s);
    [].forEach.call(document.querySelectorAll('.ad-slot .ad-box'), function (box) {
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle'; ins.style.display = 'block';
      ins.setAttribute('data-ad-client', cfg.ads);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      box.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* ad blocker or missing slot id */ }
    });
  }

  function apply(choice) {
    document.documentElement.classList.toggle('ads-off', choice !== 'yes');
    if (choice === 'yes') loadAds();
  }

  function close() { var b = document.getElementById('consent'); if (b) b.parentNode.removeChild(b); }

  function choose(choice) {
    var wasLoaded = loaded;
    save(choice); close(); apply(choice);
    if (choice === 'no' && wasLoaded) location.reload(); // stop an ad script that is already running
    var link = document.querySelector('[data-cookie-settings]'); if (link && link.focus && document.activeElement === document.body) link.focus();
  }

  function show(focus) {
    close();
    var b = document.createElement('div');
    b.id = 'consent'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Cookie consent');
    b.innerHTML = '<p id="consent-t">We use cookies from our advertising partner to show ads. Ads load only if you accept. You can change your choice at any time with &ldquo;Cookie settings&rdquo; in the footer.</p>' +
      '<div class="consent-b"><button type="button" data-c="yes">Accept</button><button type="button" data-c="no">Decline</button></div>';
    b.setAttribute('aria-describedby', 'consent-t');
    b.addEventListener('click', function (e) { var c = e.target && e.target.getAttribute && e.target.getAttribute('data-c'); if (c) choose(c); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });
    document.body.appendChild(b);
    if (focus) b.querySelector('button').focus();
  }

  function init() {
    if (!cfg.ads) return; // analytics-only: Cloudflare Web Analytics is cookieless, so there is nothing to ask
    [].forEach.call(document.querySelectorAll('[data-cookie-settings]'), function (el) { el.addEventListener('click', function () { show(true); }); });
    var saved = read();
    if (saved === 'yes' || saved === 'no') apply(saved); else show(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
