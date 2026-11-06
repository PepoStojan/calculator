/* Client runtime: renders the form from window.__CALC__, runs window.__COMPUTE__ on every change. */
(function () {
  var C = window.__CALC__, compute = window.__COMPUTE__;
  var formEl = document.getElementById('form');
  if (!C || !compute || !formEl) return;
  var out = document.getElementById('results'), tbl = document.getElementById('table'), nodes = {};

  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dflt(v) {
    if (typeof v === 'string' && /^today/.test(v)) { var m = v.match(/^today([+-]\d+)?$/); return H.iso(H.addDays(H.today(), m && m[1] ? +m[1] : 0)); }
    return v;
  }
  var uid = 0;

  function control(f, value, rowCol) {
    var id = 'f' + (++uid), wrap = h('div', 'ctl'), el;
    if (f.type === 'select') {
      el = h('select'); (f.opts || []).forEach(function (o) { var op = h('option'); op.value = o[0]; op.textContent = o[1]; el.appendChild(op); });
      el.value = String(value);
      if (el.value !== String(value)) { for (var i = 0; i < el.options.length; i++) if (el.options[i].value === String(value)) el.selectedIndex = i; }
    } else {
      el = h('input'); el.type = f.type === 'number' ? 'number' : f.type; if (f.type === 'number') { el.inputMode = 'decimal'; if (f.min != null) el.min = f.min; if (f.max != null) el.max = f.max; el.step = f.step || 'any'; }
      if (f.type === 'text') { el.autocomplete = 'off'; if (f.ph) el.placeholder = f.ph; }
      el.value = value == null ? '' : dflt(value);
    }
    el.id = id; if (!rowCol) { wrap.appendChild(el); if (f.pre) wrap.insertBefore(h('span', 'aff', esc(f.pre)), el); if (f.suf) wrap.appendChild(h('span', 'aff', esc(f.suf))); wrap.className += (f.pre ? ' has-pre' : '') + (f.suf ? ' has-suf' : ''); }
    else el.setAttribute('aria-label', f.label);
    return { el: el, wrap: wrap, id: id };
  }

  function build() {
    C.fields.forEach(function (f) {
      var box = h('div', 'field'); box.dataset.id = f.id;
      if (f.type === 'rows') {
        box.appendChild(h('div', 'lbl', esc(f.label)));
        var grid = h('div', 'rows'), head = h('div', 'row head');
        f.cols.forEach(function (c) { head.appendChild(h('span', 'c ' + (c.w || ''), esc(c.label))); }); head.appendChild(h('span', 'c x', '')); grid.appendChild(head);
        var holder = h('div', 'rows-body'); grid.appendChild(holder);
        var addRow = function (vals) {
          var r = h('div', 'row'); r.cells = {};
          f.cols.forEach(function (c) { var k = control(c, vals && vals[c.id] != null ? vals[c.id] : (c.type === 'select' ? c.opts[0][0] : c.type === 'time' ? '09:00' : ''), true); k.el.className = 'c ' + (c.w || ''); r.cells[c.id] = k.el; r.appendChild(k.el); });
          var x = h('button', 'c x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Remove row'); x.onclick = function () { if (holder.children.length > (f.min || 1)) { holder.removeChild(r); run(); } }; r.appendChild(x); holder.appendChild(r);
        };
        (f.rows || []).forEach(addRow); box.appendChild(grid);
        var add = h('button', 'btn-add', '+ Add row'); add.type = 'button'; add.onclick = function () { addRow(null); run(); box.querySelector('.rows-body').lastChild.querySelector('input,select').focus(); }; box.appendChild(add);
        nodes[f.id] = { f: f, box: box, holder: holder };
      } else {
        var k = control(f, f.value); var lab = h('label', 'lbl', esc(f.label)); lab.htmlFor = k.id; box.appendChild(lab); box.appendChild(k.wrap);
        if (f.hint) box.appendChild(h('div', 'hint', esc(f.hint)));
        nodes[f.id] = { f: f, box: box, el: k.el };
      }
      formEl.appendChild(box);
    });
  }

  function read() {
    var v = {}, bad = [];
    C.fields.forEach(function (f) {
      var nd = nodes[f.id];
      if (f.type === 'rows') {
        v[f.id] = [].slice.call(nd.holder.children).map(function (r) {
          var o = {}, ok = true, any = false;
          f.cols.forEach(function (c) {
            var raw = r.cells[c.id].value;
            if (c.type === 'number') { var x = parseFloat(raw); if (isNaN(x)) { if (c.optional) x = 0; else ok = false; } else any = true; o[c.id] = x; } else { o[c.id] = raw; if (raw && c.type !== 'select' && c.type !== 'time') any = true; }
          });
          return ok ? o : null;
        }).filter(Boolean);
        if (!v[f.id].length) bad.push('Fill in at least one row in "' + f.label + '".');
        return;
      }
      var raw = nd.el.value;
      if (f.type === 'number') {
        var x = parseFloat(raw); if (isNaN(x)) { if (f.optional) x = 0; else x = NaN; } v[f.id] = x;
      } else v[f.id] = raw;
    });
    // visibility
    C.fields.forEach(function (f) {
      var vis = true; if (f.show) { var cur = String(v[f.show.id]); vis = f.show.is != null ? cur === String(f.show.is) : f.show.in.indexOf(cur) >= 0; }
      nodes[f.id].box.hidden = !vis; nodes[f.id].visible = vis;
    });
    C.fields.forEach(function (f) {
      if (!nodes[f.id].visible || f.type !== 'number') return; var x = v[f.id];
      if (isNaN(x)) bad.push('Enter a value for "' + f.label + '".');
      else if (f.min != null && x < f.min) bad.push('"' + f.label + '" must be at least ' + f.min + '.');
      else if (f.max != null && x > f.max) bad.push('"' + f.label + '" must be ' + f.max + ' or less.');
    });
    return { v: v, bad: bad };
  }

  function render(r) {
    out.innerHTML = ''; tbl.innerHTML = '';
    if (r.err) { out.appendChild(h('div', 'msg err', esc(r.err))); return; }
    var big = h('div', 'big-row'), rest = h('dl', 'list');
    r.res.forEach(function (x) { if (x.big) { var b = h('div', 'big'); b.appendChild(h('span', 'k', esc(x.l))); b.appendChild(h('strong', 'v', esc(x.v))); big.appendChild(b); } else { rest.appendChild(h('dt', '', esc(x.l))); rest.appendChild(h('dd', '', esc(x.v))); } });
    if (big.children.length) out.appendChild(big); if (rest.children.length) out.appendChild(rest);
    if (r.note) out.appendChild(h('p', 'note', esc(r.note)));
    if (r.table) {
      var t = r.table, tb = h('div', 'tbl'); tb.appendChild(h('h2', '', esc(t.title)));
      var wrap = h('div', 'tbl-scroll'), table = h('table'), th = h('thead'), tr = h('tr');
      t.head.forEach(function (c) { tr.appendChild(h('th', '', esc(c))); }); th.appendChild(tr); table.appendChild(th);
      var body = h('tbody'); t.rows.forEach(function (row) { var q = h('tr'); row.forEach(function (c) { q.appendChild(h('td', '', esc(c))); }); body.appendChild(q); }); table.appendChild(body);
      wrap.appendChild(table); tb.appendChild(wrap); tbl.appendChild(tb);
    }
  }

  function run() {
    var s = read();
    if (s.bad.length) { out.innerHTML = ''; tbl.innerHTML = ''; out.appendChild(h('div', 'msg', esc(s.bad[0]))); return; }
    var r; try { r = compute(s.v, H); } catch (e) { r = { err: 'Something went wrong with these values. Check your inputs.' }; if (window.console) console.error(e); }
    render(r);
  }

  build(); formEl.addEventListener('input', run); formEl.addEventListener('change', run); formEl.addEventListener('submit', function (e) { e.preventDefault(); }); run();
})();
