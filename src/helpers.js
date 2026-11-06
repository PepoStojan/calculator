/* Shared by the browser runtime and the Node tests. Pure functions only. */
var H = (function () {
  function fin(n) { return typeof n === 'number' && isFinite(n); }
  var DAY = 864e5;
  var H = {
    fin: fin,
    money: function (n, d) {
      if (!fin(n)) return '—'; d = d == null ? 2 : d;
      return (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    },
    num: function (n, d) {
      if (!fin(n)) return '—'; d = d == null ? 2 : d;
      return n.toLocaleString('en-US', { maximumFractionDigits: d });
    },
    pct: function (n, d) { return fin(n) ? H.num(n, d == null ? 2 : d) + '%' : '—'; },
    plural: function (n, w) { return H.num(n, 0) + ' ' + w + (n === 1 ? '' : 's'); },
    dur: function (months) {
      var y = Math.floor(months / 12), m = months % 12, p = [];
      if (y) p.push(H.plural(y, 'year')); if (m || !y) p.push(H.plural(m, 'month'));
      return p.join(' ');
    },
    pmt: function (P, r, n) { return r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n; },
    /* Amortize a loan; returns months, total interest and one row per year. */
    amort: function (P, r, pay, extra) {
      var bal = P, m = 0, ti = 0, yi = 0, yp = 0, rows = [];
      extra = extra || 0;
      while (bal > 0.005 && m < 1200) {
        var i = bal * r, p = Math.min(bal, pay + extra - i);
        if (p <= 0) break;
        bal -= p; ti += i; yi += i; yp += p; m++;
        if (m % 12 === 0 || bal <= 0.005) { rows.push({ y: Math.ceil(m / 12), p: yp, i: yi, bal: Math.max(bal, 0) }); yi = 0; yp = 0; }
      }
      return { months: m, interest: ti, rows: rows };
    },
    /* ---- dates (all UTC midnight so DST never shifts a day) ---- */
    parseDate: function (s) { var p = String(s || '').split('-'); return p.length === 3 && +p[0] ? new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])) : null; },
    iso: function (d) { return d.toISOString().slice(0, 10); },
    today: function () { var n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); },
    addDays: function (d, n) { return new Date(d.getTime() + n * DAY); },
    daysBetween: function (a, b) { return Math.round((b - a) / DAY); },
    dim: function (y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); },
    addMonths: function (d, n) {
      var t = d.getUTCFullYear() * 12 + d.getUTCMonth() + n, y = Math.floor(t / 12), m = t - y * 12;
      return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), H.dim(y, m))));
    },
    date: function (d) { return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }); },
    dateShort: function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); },
    weekday: function (d) { return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }); },
    /* Calendar difference a -> b (a <= b) as years / months / days. */
    ymd: function (a, b) {
      var months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
      if (H.addMonths(a, months) > b) months--;
      return { y: Math.floor(months / 12), m: months % 12, d: H.daysBetween(H.addMonths(a, months), b) };
    },
    /* ---- clock times ---- */
    mins: function (s) { var p = String(s || '').split(':'); return p.length < 2 ? NaN : (+p[0]) * 60 + (+p[1]); },
    clock: function (m) {
      m = ((Math.round(m) % 1440) + 1440) % 1440;
      var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'PM' : 'AM';
      return ((h % 12) || 12) + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap;
    },
    hm: function (m) { var h = Math.floor(m / 60), mm = Math.round(m % 60); return h + 'h ' + (mm < 10 ? '0' : '') + mm + 'm'; },
    /* ---- numbers ---- */
    nums: function (s) { return (String(s || '').match(/-?\d*\.?\d+/g) || []).map(Number).filter(fin); },
    gcd: function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; },
    primes: function (n) {
      var f = [], p = 2; while (p * p <= n) { while (n % p === 0) { f.push(p); n /= p; } p += p === 2 ? 1 : 2; }
      if (n > 1) f.push(n); return f;
    }
  };
  return H;
})();
if (typeof module !== 'undefined') module.exports = H;
