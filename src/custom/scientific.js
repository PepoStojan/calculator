(function () {
  var inp = document.getElementById('sci-in'), out = document.getElementById('sci-out'), grid = document.getElementById('sci-grid'), hist = document.getElementById('sci-hist');
  var deg = true, ans = 0, hs = [];
  var keys = [
    ['Deg', 'mode', 'on'], ['(', '(', ''], [')', ')', ''], ['⌫', 'bs', 'c'], ['AC', 'ac', 'c'],
    ['sin', 'sin(', ''], ['cos', 'cos(', ''], ['tan', 'tan(', ''], ['√', 'sqrt(', ''], ['xʸ', '^', ''],
    ['asin', 'asin(', ''], ['acos', 'acos(', ''], ['atan', 'atan(', ''], ['ln', 'ln(', ''], ['log', 'log(', ''],
    ['π', 'pi', ''], ['e', 'e', ''], ['n!', '!', ''], ['%', '%', ''], ['1/x', '^(-1)', ''],
    ['7', '7', 'n'], ['8', '8', 'n'], ['9', '9', 'n'], ['÷', '/', 'o'], ['x²', '^2', ''],
    ['4', '4', 'n'], ['5', '5', 'n'], ['6', '6', 'n'], ['×', '*', 'o'], ['abs', 'abs(', ''],
    ['1', '1', 'n'], ['2', '2', 'n'], ['3', '3', 'n'], ['−', '-', 'o'], ['10ˣ', '10^', ''],
    ['0', '0', 'n'], ['.', '.', 'n'], ['ANS', 'ans', ''], ['+', '+', 'o'], ['=', '=', 'eq']
  ];
  keys.forEach(function (k) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = k[0]; b.className = k[2]; b.dataset.v = k[1]; if (k[1] === 'mode') b.id = 'sci-mode';
    b.setAttribute('aria-label', { '⌫': 'Backspace', 'AC': 'All clear', 'Deg': 'Toggle degrees or radians' }[k[0]] || k[0]); grid.appendChild(b);
  });
  function show(text, isErr) { out.textContent = text; out.className = 'sci-out' + (isErr ? ' err' : ''); }
  function preview() {
    if (!inp.value.trim()) return show('0');
    try { show(Sci.format(Sci.evaluate(inp.value, { deg: deg, ans: ans }))); } catch (e) { /* keep typing */ }
  }
  function insert(t) {
    var s = inp.selectionStart == null ? inp.value.length : inp.selectionStart, e = inp.selectionEnd == null ? s : inp.selectionEnd;
    inp.value = inp.value.slice(0, s) + t + inp.value.slice(e); var p = s + t.length; inp.setSelectionRange(p, p); preview();
  }
  function equals() {
    if (!inp.value.trim()) return;
    try {
      var r = Sci.evaluate(inp.value, { deg: deg, ans: ans }), txt = Sci.format(r); hs.unshift([inp.value, txt]); hs = hs.slice(0, 6); ans = r; show(txt); inp.value = txt; renderHist();
    } catch (e) { show('Error', true); }
  }
  function renderHist() {
    hist.innerHTML = ''; hs.forEach(function (h) { var d = document.createElement('div'), a = document.createElement('span'), b = document.createElement('span'); a.textContent = h[0]; b.textContent = '= ' + h[1]; d.appendChild(a); d.appendChild(b); d.onclick = function () { inp.value = h[0]; preview(); inp.focus(); }; hist.appendChild(d); });
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var v = b.dataset.v;
    if (v === 'ac') { inp.value = ''; show('0'); } else if (v === 'bs') { inp.value = inp.value.slice(0, -1); preview(); }
    else if (v === 'mode') { deg = !deg; b.textContent = deg ? 'Deg' : 'Rad'; preview(); }
    else if (v === '=') equals(); else insert(v);
    if (v !== 'mode') inp.focus({ preventScroll: true });
  });
  inp.addEventListener('input', preview);
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); equals(); } else if (e.key === 'Escape') { inp.value = ''; show('0'); } });
})();
