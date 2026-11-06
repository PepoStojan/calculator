
(function () {
  "use strict";

  /* ---------- 7-segment display ---------- */
  var NS = "http://www.w3.org/2000/svg";
  var SEG_POLY = {
    a: "11,5 15,1 45,1 49,5 45,9 15,9",
    b: "55,7 59,11 59,43 55,47 51,43 51,11",
    c: "55,53 59,57 59,89 55,93 51,89 51,57",
    d: "11,95 15,91 45,91 49,95 45,99 15,99",
    e: "5,53 9,57 9,89 5,93 1,89 1,57",
    f: "5,7 9,11 9,43 5,47 1,43 1,11",
    g: "11,50 15,46 45,46 49,50 45,54 15,54"
  };
  var GLYPH = {
    "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg",
    "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg",
    "-": "g", "E": "adefg", " ": ""
  };
  var NUM_DIGITS = 8;
  var digitsEl = document.getElementById("digits");
  var cells = []; // index 0 = sign cell, 1..8 = digit cells

  function makeCell(isSign) {
    var cell = document.createElement("div");
    cell.className = "cell" + (isSign ? " sign" : "");
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", isSign ? "0 0 60 100" : "0 0 72 100");
    svg.setAttribute("aria-hidden", "true");
    var segs = {};
    "abcdefg".split("").forEach(function (k) {
      var p = document.createElementNS(NS, "polygon");
      p.setAttribute("points", SEG_POLY[k]);
      p.setAttribute("class", "seg");
      svg.appendChild(p);
      segs[k] = p;
    });
    var dp = null;
    if (!isSign) {
      dp = document.createElementNS(NS, "circle");
      dp.setAttribute("cx", "66"); dp.setAttribute("cy", "95"); dp.setAttribute("r", "4.5");
      dp.setAttribute("class", "seg");
      svg.appendChild(dp);
    }
    cell.appendChild(svg);
    digitsEl.appendChild(cell);
    return { segs: segs, dp: dp };
  }
  for (var i = 0; i <= NUM_DIGITS; i++) cells.push(makeCell(i === 0));

  function setCell(c, ch, dot) {
    var on = GLYPH[ch] || "";
    for (var k in c.segs) c.segs[k].setAttribute("class", "seg" + (on.indexOf(k) >= 0 ? " on" : ""));
    if (c.dp) c.dp.setAttribute("class", "seg" + (dot ? " on" : ""));
  }

  function render() {
    var chars = new Array(NUM_DIGITS).fill(" ");
    var dots = new Array(NUM_DIGITS).fill(false);
    var neg = false;
    if (err) {
      chars[0] = "E";
    } else {
      var s = entry;
      if (s.charAt(0) === "-") { neg = true; s = s.slice(1); }
      var seq = []; // digits with dot flags
      for (var j = 0; j < s.length; j++) {
        if (s[j] === ".") { if (seq.length) seq[seq.length - 1].dot = true; }
        else seq.push({ ch: s[j], dot: false });
      }
      var start = NUM_DIGITS - seq.length;
      for (var m = 0; m < seq.length; m++) { chars[start + m] = seq[m].ch; dots[start + m] = seq[m].dot; }
    }
    setCell(cells[0], neg ? "-" : " ", false);
    for (var n = 0; n < NUM_DIGITS; n++) setCell(cells[n + 1], chars[n], dots[n]);
    digitsEl.parentNode.parentNode.dataset.text = err ? "E" : entry; // handy for testing
  }

  /* ---------- calculator logic ---------- */
  var entry = "0";      // text currently shown
  var acc = null;       // left operand
  var op = null;        // pending operator
  var fresh = true;     // next digit starts a new number
  var hasOperand = false;
  var err = false;

  function digitCount(s) { return s.replace(/[-.]/g, "").length; }

  // Round away float noise and fit to 8 digits. Returns string, or null on overflow.
  function fmt(n) {
    if (!isFinite(n)) return null;
    n = parseFloat(n.toPrecision(12));
    var abs = Math.abs(n);
    if (abs >= 1e8) return null;
    var intDigits = String(Math.trunc(abs)).length;
    var dec = Math.max(0, NUM_DIGITS - intDigits);
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    if (digitCount(s) > NUM_DIGITS) return null;
    return s;
  }

  function setResult(n) {
    var s = (n === null) ? null : fmt(n);
    if (s === null) { err = true; entry = "0"; acc = null; op = null; }
    else entry = s;
  }

  function calc(a, o, b) {
    switch (o) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? null : a / b;
    }
    return b;
  }

  function press(k) {
    if (err && k !== "C") return;

    if (k >= "0" && k <= "9" && k.length === 1) {
      if (fresh) { entry = k; fresh = false; }
      else if (entry === "0") entry = k;
      else if (entry === "-0") entry = "-" + k;
      else if (digitCount(entry) < NUM_DIGITS) entry += k;
      hasOperand = true;
    } else if (k === ".") {
      if (fresh) { entry = "0."; fresh = false; }
      else if (entry.indexOf(".") < 0 && digitCount(entry) < NUM_DIGITS) entry += ".";
      hasOperand = true;
    } else if (k === "C") {
      entry = "0"; acc = null; op = null; fresh = true; hasOperand = false; err = false;
    } else if (k === "CE") {
      entry = "0"; fresh = false; hasOperand = false;
    } else if (k === "±") {
      if (entry.charAt(0) === "-") entry = entry.slice(1);
      else if (parseFloat(entry) !== 0 || entry.indexOf(".") >= 0) entry = "-" + entry;
      hasOperand = true;
    } else if (k === "%") {
      var v = parseFloat(entry);
      var r = (op === "+" || op === "-") && acc !== null ? acc * v / 100 : v / 100;
      setResult(r);
      fresh = true; hasOperand = true;
    } else if (k === "+" || k === "-" || k === "*" || k === "/") {
      var cur = parseFloat(entry);
      if (op && hasOperand) {
        setResult(calc(acc, op, cur));
        if (err) { render(); return; }
        acc = parseFloat(entry);
      } else if (!op) {
        acc = cur;
      }
      op = k; fresh = true; hasOperand = false;
    } else if (k === "=") {
      if (op) {
        setResult(calc(acc, op, parseFloat(entry)));
        if (err) { render(); return; }
      }
      acc = null; op = null; fresh = true; hasOperand = false;
    }
    render();
  }

  /* ---------- click sound ---------- */
  var soundOn = false, ctx = null;
  var sndBtn = document.getElementById("snd");
  sndBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    sndBtn.setAttribute("aria-pressed", String(soundOn));
    if (soundOn) { click(); }
  });
  function click() {
    if (!soundOn) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(1900, t);
      o.frequency.exponentialRampToValueAtTime(700, t + 0.025);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.035);
    } catch (e) { /* audio unavailable: ignore */ }
  }

  /* ---------- input wiring ---------- */
  document.getElementById("pad").addEventListener("click", function (e) {
    var b = e.target.closest(".key");
    if (!b) return;
    click();
    press(b.dataset.k);
    if (e.detail > 0) b.blur(); // keep Enter/space from re-triggering after a mouse click
  });

  var KEYMAP = { "Enter": "=", "=": "=", "Backspace": "CE", "Escape": "C", "Delete": "CE",
                 "+": "+", "-": "-", "*": "*", "/": "/", "%": "%", ".": "." };
  document.addEventListener("keydown", function (e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = null;
    if (e.key >= "0" && e.key <= "9" && e.key.length === 1) k = e.key;
    else if (KEYMAP.hasOwnProperty(e.key)) k = KEYMAP[e.key];
    if (k === null) return;
    e.preventDefault();
    if (e.repeat) return;
    var el = document.querySelector('.key[data-k="' + k.replace(/"/g, '\\"') + '"]');
    if (el) { el.classList.add("down"); setTimeout(function () { el.classList.remove("down"); }, 110); }
    click();
    press(k);
  });

  render();
})();
