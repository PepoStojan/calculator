/* node test.js : runs every calculator with its default inputs plus known-answer checks. */
const H = require('./src/helpers.js'), { pages } = require('./src/pages.js'), Sci = require('./src/custom/sci-parser.js');
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
const near = (a, b, t = 0.01) => Math.abs(a - b) <= t;
const dflt = v => { if (typeof v === 'string' && /^today/.test(v)) { const m = v.match(/^today([+-]\d+)?$/); return H.iso(H.addDays(H.today(), m && m[1] ? +m[1] : 0)); } return v; };
const inputs = p => { const v = {}; for (const f of p.fields) v[f.id] = f.type === 'rows' ? f.rows.map(r => { const o = {}; f.cols.forEach(c => { o[c.id] = c.type === 'number' ? (r[c.id] === '' || r[c.id] == null ? 0 : +r[c.id]) : r[c.id]; }); return o; }) : f.type === 'number' ? +f.value : dflt(f.value); return v; };
const run = (slug, over) => { const p = pages.find(x => x.slug === slug), v = Object.assign(inputs(p), over || {}); return p.compute(v, H); };
const get = (r, label) => { const x = r.res.find(y => y.l.indexOf(label) === 0); return x ? x.v : undefined; };
const num = s => parseFloat(String(s).replace(/[^0-9.\-]/g, ''));

for (const p of pages.filter(p => p.compute)) { const r = run(p.slug); ok(r && !r.err && r.res && r.res.length, p.slug + ' default run: ' + JSON.stringify(r && r.err)); r && r.res && r.res.forEach(x => ok(!/NaN|undefined|Infinity/.test(x.v), p.slug + ' bad value in ' + x.l + ' = ' + x.v)); }

// known answers
let r = run('mortgage-calculator'); ok(near(num(get(r, 'Principal & interest')), 2022.62), 'mortgage P&I ' + get(r, 'Principal & interest'));
r = run('loan-calculator'); ok(near(num(get(r, 'Monthly payment')), 495.03), 'loan payment ' + get(r, 'Monthly payment'));
r = run('loan-calculator', { extra: 100 }); ok(/years|months/.test(get(r, 'Paid off in')) && num(get(r, 'Interest saved')) > 0, 'loan extra');
r = run('bmi-calculator', { unit: 'metric', cm: 175, kg: 70 }); ok(get(r, 'Your BMI') === '22.9', 'bmi ' + get(r, 'Your BMI'));
r = run('compound-interest-calculator', { p: 10000, add: 0, rate: 7, years: 20, freq: '12' }); ok(near(num(get(r, 'Future value')), 40387.39, 0.5), 'compound ' + get(r, 'Future value'));
r = run('calorie-calculator', { sex: 'm', age: 30, unit: 'metric', cm: 180, kg: 80, act: '1.2' }); ok(num(get(r, 'Basal')) === 1780, 'bmr ' + get(r, 'Basal'));
r = run('final-grade-calculator', { cur: 84, want: 90, w: 30 }); ok(get(r, 'Score needed') === '104%', 'final grade ' + get(r, 'Score needed'));
r = run('percentage-calculator', { mode: 'of', a1: 15, b1: 200 }); ok(get(r, '15% of') === '30', 'pct of');
r = run('percentage-calculator', { mode: 'chg', a3: 80, b3: 100 }); ok(get(r, 'Percentage') === '25%', 'pct change');
r = run('fraction-calculator', { w1: 0, n1: 1, d1: 2, op: '+', w2: 0, n2: 1, d2: 3 }); ok(get(r, 'Result') === '5/6', 'fraction ' + get(r, 'Result'));
r = run('fraction-calculator', { w1: 1, n1: 1, d1: 2, op: '*', w2: 0, n2: 2, d2: 3 }); ok(get(r, 'Result') === '1', 'fraction mult ' + get(r, 'Result'));
r = run('lcm-calculator', { list: '12 18' }); ok(get(r, 'LCM') === '36' && get(r, 'GCF') === '6', 'lcm');
r = run('average-calculator', { list: '1 2 2 3 7' }); ok(get(r, 'Mean') === '3' && get(r, 'Median') === '2' && get(r, 'Mode') === '2', 'average');
r = run('area-calculator', { shape: 'circ', r: 5, u: 'ft' }); ok(get(r, 'Area').startsWith('78.5398'), 'circle area ' + get(r, 'Area'));
r = run('volume-calculator', { shape: 'cyl', r: 3, h: 5, u: 'ft' }); ok(get(r, 'Volume').startsWith('141.3717'), 'cyl vol ' + get(r, 'Volume'));
r = run('age-calculator', { dob: '2000-01-31', asof: '2020-03-01' }); ok(get(r, 'Your age') === '20 years, 1 months, 1 days', 'age ' + get(r, 'Your age'));
r = run('date-difference-calculator', { s: '2026-01-01', e: '2026-01-31', inc: '0' }); ok(get(r, 'Days between') === '30 days' && get(r, 'Business') === '22', 'date diff ' + get(r, 'Business'));
r = run('date-calculator', { s: '2026-01-31', op: 'add', y: 0, m: 1, w: 0, d: 0 }); ok(/Feb 28, 2026/.test(get(r, 'Result')), 'add month clamp ' + get(r, 'Result'));
r = run('due-date-calculator', { lmp: '2026-01-01', cycle: 28 }); ok(/Oct 8, 2026/.test(get(r, 'Estimated due')), 'due date ' + get(r, 'Estimated due'));
r = run('time-clock-calculator', { rate: 20, ot: 40, mult: 1.5 }); ok(get(r, 'Total hours') === '37h 30m' && get(r, 'Gross pay') === '$750.00', 'time clock ' + get(r, 'Total hours') + get(r, 'Gross pay'));
r = run('concrete-calculator', { shape: 'slab', l: 10, w: 10, t: 4, waste: 0 }); ok(get(r, 'Concrete needed').startsWith('1.23'), 'concrete ' + get(r, 'Concrete needed'));
r = run('sleep-calculator', { mode: 'wake', time: '07:00', lat: 15 }); ok(get(r, 'Best bedtime') === '11:15 PM', 'sleep ' + get(r, 'Best bedtime'));
r = run('salary-to-hourly-calculator', { amount: 60000, per: 'year', hpw: 40, wpy: 52 }); ok(get(r, 'Hourly') === '$28.85', 'salary ' + get(r, 'Hourly'));
r = run('gpa-calculator'); ok(near(num(get(r, 'Unweighted')), 3.63, 0.005), 'gpa ' + get(r, 'Unweighted'));
r = run('retirement-calculator'); ok(r.res[0].v.startsWith('$'), 'retirement');
r = run('mortgage-calculator', { down: 500000 }); ok(r.err, 'mortgage guard');
ok(Sci.evaluate('2+3*4') === 14, 'sci'); ok(new Set(pages.map(p => p.slug)).size === pages.length, 'unique slugs');
console.log(fail ? fail + ' FAILED' : 'All tests passed (' + pages.filter(p => p.compute).length + ' calculators run with defaults)');
process.exit(fail ? 1 : 0);
