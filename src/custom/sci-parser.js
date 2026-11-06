/* Safe expression evaluator (no eval). Works in the browser and in Node. */
var Sci = (function () {
  var FN = {
    sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1, sinh: 1, cosh: 1, tanh: 1, ln: 1, log: 1, log2: 1, sqrt: 1, cbrt: 1, abs: 1, exp: 1, floor: 1, ceil: 1, round: 1
  };
  function fact(x) { if (x < 0 || x > 170 || Math.round(x) !== x) throw new Error('fact'); var r = 1; for (var i = 2; i <= x; i++) r *= i; return r; }
  function tidy(x) { return Math.abs(x) < 1e-12 ? 0 : x; }
  function evaluate(src, opt) {
    opt = opt || {};
    var deg = !!opt.deg, ans = opt.ans || 0;
    var s = String(src).toLowerCase().replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/\s+/g, '');
    var t = [], re = /(\d+\.?\d*|\.\d+)|([a-z][a-z0-9]*)|(.)/g, m;
    while ((m = re.exec(s))) t.push(m[1] ? { n: parseFloat(m[1]) } : m[2] ? { id: m[2] } : { op: m[3] });
    var i = 0;
    function peek() { return t[i]; }
    function isOp(o) { return t[i] && t[i].op === o; }
    function expr() {
      var v = term();
      while (isOp('+') || isOp('-')) { var o = t[i++].op, r = term(); v = o === '+' ? v + r : v - r; }
      return v;
    }
    function startsPrimary() { var p = peek(); return p && (p.n !== undefined || p.id || p.op === '('); }
    function term() {
      var v = unary();
      for (;;) {
        if (isOp('*')) { i++; v *= unary(); } else if (isOp('/')) { i++; v /= unary(); }
        else if (startsPrimary()) v *= unary();
        else return v;
      }
    }
    function unary() {
      if (isOp('-')) { i++; return -unary(); }
      if (isOp('+')) { i++; return unary(); }
      return power();
    }
    function power() {
      var b = postfix();
      if (isOp('^')) { i++; return Math.pow(b, unary()); }
      return b;
    }
    function postfix() {
      var v = primary();
      for (;;) {
        if (isOp('!')) { i++; v = fact(v); } else if (isOp('%')) { i++; v /= 100; } else return v;
      }
    }
    function primary() {
      var p = t[i++];
      if (!p) throw new Error('syntax');
      if (p.n !== undefined) return p.n;
      if (p.op === '(') { var v = expr(); if (!isOp(')')) throw new Error('paren'); i++; return v; }
      if (p.id === 'pi') return Math.PI;
      if (p.id === 'e') return Math.E;
      if (p.id === 'ans') return ans;
      if (FN[p.id]) {
        if (!isOp('(')) throw new Error('fn'); i++; var a = expr(); if (!isOp(')')) throw new Error('paren'); i++;
        var k = deg ? Math.PI / 180 : 1;
        switch (p.id) {
          case 'sin': return tidy(Math.sin(a * k)); case 'cos': return tidy(Math.cos(a * k));
          case 'tan': if (deg && Math.abs(a % 180) === 90) throw new Error('tan'); return tidy(Math.tan(a * k));
          case 'asin': return Math.asin(a) / k; case 'acos': return Math.acos(a) / k; case 'atan': return Math.atan(a) / k;
          case 'sinh': return Math.sinh(a); case 'cosh': return Math.cosh(a); case 'tanh': return Math.tanh(a);
          case 'ln': return Math.log(a); case 'log': return Math.log10(a); case 'log2': return Math.log2(a);
          case 'sqrt': return Math.sqrt(a); case 'cbrt': return Math.cbrt(a); case 'abs': return Math.abs(a); case 'exp': return Math.exp(a);
          case 'floor': return Math.floor(a); case 'ceil': return Math.ceil(a); case 'round': return Math.round(a);
        }
      }
      throw new Error('unknown');
    }
    var out = expr();
    if (i < t.length) throw new Error('syntax');
    if (!isFinite(out)) throw new Error('math');
    return tidy(parseFloat(out.toPrecision(12)));
  }
  function format(x) {
    var a = Math.abs(x);
    if (a !== 0 && (a >= 1e15 || a < 1e-9)) return x.toExponential(8).replace(/\.?0+e/, 'e');
    return String(x);
  }
  return { evaluate: evaluate, format: format };
})();
if (typeof module !== 'undefined') module.exports = Sci;
