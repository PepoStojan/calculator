/* Math & school. */
var n = function (id, label, value, o) { return Object.assign({ id: id, label: label, type: 'number', value: value }, o || {}); };
var sel = function (id, label, value, opts, o) { return Object.assign({ id: id, label: label, type: 'select', value: value, opts: opts }, o || {}); };
var M = function (id, vals) { return { id: 'mode', in: vals }; };
var UNITS = [['ft', 'feet'], ['in', 'inches'], ['yd', 'yards'], ['m', 'meters'], ['cm', 'centimeters'], ['mm', 'millimeters']];
var GRADES = [['4.0', 'A+'], ['4.0', 'A'], ['3.7', 'A-'], ['3.3', 'B+'], ['3.0', 'B'], ['2.7', 'B-'], ['2.3', 'C+'], ['2.0', 'C'], ['1.7', 'C-'], ['1.3', 'D+'], ['1.0', 'D'], ['0.7', 'D-'], ['0.0', 'F']];
var gradeRows = function (a) { return a.map(function (r) { return { name: r[0], score: r[1], weight: r[2] }; }); };
var gpaRows = function (a) { return a.map(function (r) { return { course: r[0], credits: r[1], grade: r[2], level: r[3] || '0' }; }); };
var gpaFields = function () {
  return [{ id: 'cls', label: 'Courses', type: 'rows', min: 1, cols: [
    { id: 'course', label: 'Course', type: 'text', ph: 'Course name' }, { id: 'credits', label: 'Credits', type: 'number', min: 0, step: 0.5, w: 'sm' },
    { id: 'grade', label: 'Grade', type: 'select', opts: GRADES }, { id: 'level', label: 'Level', type: 'select', opts: [['0', 'Regular'], ['0.5', 'Honors'], ['1', 'AP / IB']] }],
    rows: gpaRows([['English', 3, '3.7'], ['Algebra', 3, '3.3'], ['Biology', 4, '4.0', '0.5'], ['History', 3, '3.0'], ['Spanish', 3, '4.0']]) },
    n('pg', 'Previous cumulative GPA (optional)', 0, { min: 0, max: 5, step: 0.01, optional: 1 }), n('pc', 'Previous credits earned (optional)', 0, { min: 0, optional: 1 })];
};

module.exports = [
{
  slug: 'grade-calculator', cat: 'math', icon: '📝',
  title: 'Grade Calculator', h1: 'Weighted Grade Calculator',
  desc: 'Calculate your overall class grade from assignment scores and weights. Add as many categories as you need and see your letter grade.',
  fields: [{ id: 'items', label: 'Assignments & categories', type: 'rows', min: 1, cols: [
    { id: 'name', label: 'Name', type: 'text', ph: 'e.g. Homework' }, { id: 'score', label: 'Score %', type: 'number', min: 0, step: 0.1, w: 'sm' }, { id: 'weight', label: 'Weight %', type: 'number', min: 0, step: 0.1, w: 'sm' }],
    rows: gradeRows([['Homework', 92, 20], ['Quizzes', 85, 20], ['Midterm', 78, 25], ['Final exam', 88, 35]]) }],
  compute: function (v, H) {
    var it = v.items, tw = 0, pts = 0; it.forEach(function (r) { tw += r.weight; pts += r.score * r.weight; });
    if (!tw) return { err: 'Add at least one row with a score and a weight.' };
    var g = pts / tw, L = g >= 90 ? 'A' : g >= 80 ? 'B' : g >= 70 ? 'C' : g >= 60 ? 'D' : 'F';
    return { res: [{ l: 'Weighted grade', v: H.pct(g, 2), big: 1 }, { l: 'Letter grade', v: L, big: 1 }, { l: 'Total weight entered', v: H.pct(tw, 1) }],
      table: { title: 'How each part contributes', head: ['Item', 'Score', 'Weight', 'Points contributed'], rows: it.map(function (r) { return [r.name || '—', H.pct(r.score, 1), H.pct(r.weight, 1), H.num(r.score * r.weight / tw, 2)]; }) },
      note: tw === 100 ? '' : 'Your weights add up to ' + H.num(tw, 1) + '%, not 100%. The grade is calculated from the weight entered so far.' };
  },
  about: '<p>Most courses weight categories differently: a final exam might count for 35% while homework is worth 20%. The calculator multiplies each score by its weight, adds the results and divides by the total weight, so you can see your standing at any point in the term.</p><p>If you have not finished all categories, enter only the completed ones. The grade shown reflects the work counted so far.</p>',
  formula: 'Weighted grade = Σ (score × weight) ÷ Σ weights.',
  faqs: [
    ['How do I calculate my grade with different weights?', 'Multiply each score by its weight (as a decimal), then add the products. If the weights add up to 100%, that sum is your grade.'],
    ['What if my weights do not add up to 100%?', 'The tool divides by the total weight you entered, which gives your grade for the work completed so far.'],
    ['How do I find the score I need on the final?', 'Use the final grade calculator to find the exact score you need on your exam.']
  ],
  related: ['final-grade-calculator', 'gpa-calculator', 'percentage-calculator', 'average-calculator'],
  variants: [
    { slug: 'weighted-grade-calculator', title: 'Weighted Grade Calculator', h1: 'Weighted Grade Calculator', desc: 'Find your weighted average grade from scores and category weights. Free online weighted grade calculator with letter grade.',
      intro: 'Enter each score with its weight to get your weighted course grade.', set: {}, faqs: [] },
    { slug: 'grade-average-calculator', title: 'Grade Average Calculator', h1: 'Grade Average Calculator', desc: 'Calculate the average of your grades. Enter each score; all rows are weighted equally by default.',
      intro: 'Every row has a weight of 1, so the result is a simple average of your scores. Change weights if some count more.',
      set: { items: gradeRows([['Test 1', 88, 1], ['Test 2', 92, 1], ['Test 3', 79, 1], ['Test 4', 85, 1]]) }, faqs: [] }
  ]
},
{
  slug: 'final-grade-calculator', cat: 'math', icon: '🎯',
  title: 'Final Grade Calculator', h1: 'Final Grade Calculator: What Do I Need on the Final?',
  desc: 'Find the score you need on your final exam to reach the course grade you want. Instant results for A, B and C targets.',
  fields: [
    n('cur', 'Current grade', 84, { suf: '%', min: 0, max: 200, step: 0.1 }), n('want', 'Grade you want', 90, { suf: '%', min: 0, max: 200, step: 0.1 }),
    n('w', 'Final exam weight', 30, { suf: '%', min: 1, max: 100, step: 1 })
  ],
  compute: function (v, H) {
    var need = function (t) { return (t - v.cur * (1 - v.w / 100)) / (v.w / 100); }, x = need(v.want);
    var msg = x > 100 ? 'You would need more than 100%, so this target may need extra credit or a curve.' : x <= 0 ? 'You already have this grade locked in, even with a 0 on the final.' : 'Aim for at least ' + H.num(x, 1) + '% on the final.';
    return { res: [{ l: 'Score needed on the final', v: H.pct(Math.max(x, 0), 1), big: 1 }, { l: 'Current grade', v: H.pct(v.cur, 1) }, { l: 'Target', v: H.pct(v.want, 1) }],
      table: { title: 'What you need for other grades', head: ['Target grade', 'Final exam score needed'], rows: [[93, 'A'], [90, 'A-'], [87, 'B+'], [83, 'B'], [80, 'B-'], [77, 'C+'], [70, 'C'], [60, 'D']].map(function (t) { var s = need(t[0]); return [t[0] + '% (' + t[1] + ')', s <= 0 ? 'Already secured' : s > 100 ? 'Not possible (' + H.num(s, 0) + '%)' : H.pct(s, 1)]; }) }, note: msg };
  },
  about: '<p>Your final grade is the sum of your current grade (the part of the course already completed) and your final exam score, each multiplied by its weight. Rearranging that equation tells you the minimum exam score that gets you to the grade you want.</p>',
  formula: 'Needed score = (target − current × (1 − w)) ÷ w, where w is the final exam weight as a decimal.',
  faqs: [
    ['How do I calculate what I need on my final?', 'Subtract the portion of your grade already earned from your target, then divide by the weight of the final. This calculator does it for you.'],
    ['What if the result is over 100%?', 'The target is out of reach with the exam alone. Ask your teacher about extra credit or choose a lower target.']
  ],
  related: ['grade-calculator', 'gpa-calculator', 'percentage-calculator']
},
{
  slug: 'gpa-calculator', cat: 'math', icon: '🎓',
  title: 'GPA Calculator', h1: 'GPA Calculator (Weighted & Unweighted)',
  desc: 'Calculate your semester and cumulative GPA on a 4.0 scale. Supports honors and AP weighting. Add as many courses as you need.',
  fields: gpaFields(),
  compute: function (v, H) {
    var cr = 0, pts = 0, wp = 0; v.cls.forEach(function (c) { var g = parseFloat(c.grade), b = g > 0 ? parseFloat(c.level) : 0; cr += c.credits; pts += c.credits * g; wp += c.credits * (g + b); });
    if (!cr) return { err: 'Add at least one course with credits.' };
    var res = [{ l: 'Unweighted GPA', v: H.num(pts / cr, 2), big: 1 }, { l: 'Weighted GPA', v: H.num(wp / cr, 2), big: 1 }, { l: 'Credits this term', v: H.num(cr, 1) }];
    if (v.pc > 0) res.push({ l: 'Cumulative GPA (unweighted)', v: H.num((v.pg * v.pc + pts) / (v.pc + cr), 2), big: 1 }, { l: 'Total credits', v: H.num(v.pc + cr, 1) });
    return { res: res, note: 'Uses a standard 4.0 scale. Some schools use different values, such as A+ = 4.3. Honors adds 0.5 and AP/IB adds 1.0 to weighted GPA for passing grades.' };
  },
  about: '<p>Grade point average (GPA) converts letter grades to points, multiplies each by the course credits and divides by total credits. Add a previous GPA and credit total to see your cumulative GPA after this term.</p><p>Many high schools add a bonus for honors or AP courses, which is why a weighted GPA can exceed 4.0. Colleges usually look at unweighted GPA or recalculate it their own way.</p>',
  formula: 'GPA = Σ (grade points × credits) ÷ Σ credits. Grade points: A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0.',
  faqs: [
    ['How is GPA calculated?', 'Convert each letter grade to points, multiply by the credit hours, add everything and divide by the total credits.'],
    ['What is a good GPA?', 'A 3.0 is a common benchmark for solid performance, 3.5 and above is strong, and many selective programs expect 3.7 or higher.'],
    ['What is the difference between weighted and unweighted GPA?', 'Unweighted GPA uses the 4.0 scale for every course. Weighted GPA gives extra points for honors, AP or IB classes.']
  ],
  related: ['grade-calculator', 'final-grade-calculator', 'average-calculator'],
  variants: [
    { slug: 'high-school-gpa-calculator', title: 'High School GPA Calculator', h1: 'High School GPA Calculator', desc: 'Calculate your high school GPA with weighted honors and AP classes. See unweighted and weighted results.',
      intro: 'Add your classes and mark honors or AP/IB courses to see both unweighted and weighted GPA.', set: {}, faqs: [['Do colleges use weighted or unweighted GPA?', 'Policies differ. Many colleges recalculate GPA on a standard scale and also consider course rigor, so take challenging classes where you can succeed.']] },
    { slug: 'college-gpa-calculator', title: 'College GPA Calculator', h1: 'College GPA Calculator', desc: 'Calculate your semester and cumulative college GPA from course credits and grades.',
      intro: 'Enter credit hours and grades, then add your previous GPA and credits for a cumulative result.', set: { pg: 3.2, pc: 30 }, faqs: [] }
  ]
},
{
  slug: 'percentage-calculator', cat: 'math', icon: '％',
  title: 'Percentage Calculator', h1: 'Percentage Calculator',
  desc: 'Calculate percentages in seconds: percent of a number, what percent one number is of another, percentage increase and decrease.',
  fields: [
    sel('mode', 'What do you want to find?', 'of', [['of', 'What is X% of Y?'], ['is', 'X is what % of Y?'], ['chg', '% change from X to Y'], ['inc', 'Increase Y by X%'], ['dec', 'Decrease Y by X%']]),
    n('a1', 'Percent (X)', 15, { suf: '%', step: 0.01, show: M('', ['of']) }), n('b1', 'Number (Y)', 200, { step: 0.01, show: M('', ['of']) }),
    n('a2', 'Number (X)', 30, { step: 0.01, show: M('', ['is']) }), n('b2', 'Total (Y)', 120, { step: 0.01, show: M('', ['is']) }),
    n('a3', 'From (X)', 80, { step: 0.01, show: M('', ['chg']) }), n('b3', 'To (Y)', 100, { step: 0.01, show: M('', ['chg']) }),
    n('a4', 'Percent (X)', 10, { suf: '%', step: 0.01, show: M('', ['inc']) }), n('b4', 'Number (Y)', 250, { step: 0.01, show: M('', ['inc']) }),
    n('a5', 'Percent (X)', 20, { suf: '%', step: 0.01, show: M('', ['dec']) }), n('b5', 'Number (Y)', 250, { step: 0.01, show: M('', ['dec']) })
  ],
  compute: function (v, H) {
    var m = v.mode, r;
    if (m === 'of') { r = v.a1 / 100 * v.b1; return { res: [{ l: v.a1 + '% of ' + v.b1, v: H.num(r, 6), big: 1 }], note: v.a1 + ' ÷ 100 × ' + v.b1 + ' = ' + H.num(r, 6) }; }
    if (m === 'is') { if (!v.b2) return { err: 'The total cannot be zero.' }; r = v.a2 / v.b2 * 100; return { res: [{ l: v.a2 + ' is what percent of ' + v.b2, v: H.pct(r, 4), big: 1 }], note: v.a2 + ' ÷ ' + v.b2 + ' × 100 = ' + H.num(r, 4) + '%' }; }
    if (m === 'chg') { if (!v.a3) return { err: 'The starting value cannot be zero.' }; r = (v.b3 - v.a3) / Math.abs(v.a3) * 100; return { res: [{ l: 'Percentage ' + (r >= 0 ? 'increase' : 'decrease'), v: H.pct(Math.abs(r), 4), big: 1 }, { l: 'Absolute change', v: H.num(v.b3 - v.a3, 6) }], note: '(' + v.b3 + ' − ' + v.a3 + ') ÷ |' + v.a3 + '| × 100 = ' + H.num(r, 4) + '%' }; }
    if (m === 'inc') { r = v.b4 * (1 + v.a4 / 100); return { res: [{ l: v.b4 + ' increased by ' + v.a4 + '%', v: H.num(r, 6), big: 1 }, { l: 'Amount added', v: H.num(r - v.b4, 6) }] }; }
    r = v.b5 * (1 - v.a5 / 100); return { res: [{ l: v.b5 + ' decreased by ' + v.a5 + '%', v: H.num(r, 6), big: 1 }, { l: 'Amount removed', v: H.num(v.b5 - r, 6) }] };
  },
  about: '<p>A percentage is a fraction out of 100. Use the first option to find a share of a number, such as a 15% tip or 30% discount; the second to see how large one value is compared with another; and the last three for markups, discounts and growth rates.</p>',
  formula: 'X% of Y = X ÷ 100 × Y. Percent change = (new − old) ÷ |old| × 100.',
  faqs: [
    ['How do I calculate a percentage of a number?', 'Divide the percentage by 100 and multiply by the number. For example, 15% of 200 is 0.15 × 200 = 30.'],
    ['How do I calculate percentage change?', 'Subtract the old value from the new value, divide by the old value and multiply by 100. A negative result is a decrease.'],
    ['How do I take a discount off a price?', 'Use "Decrease Y by X%". A 20% discount on $250 gives $200.']
  ],
  related: ['fraction-calculator', 'ratio-calculator', 'tip-calculator', 'average-calculator'],
  variants: [
    { slug: 'percent-change-calculator', title: 'Percent Change Calculator', h1: 'Percent Change Calculator', desc: 'Calculate the percentage change between two numbers. Shows percent increase or decrease and the absolute difference.',
      intro: 'Enter the starting value and the new value to see the percentage increase or decrease.', set: { mode: 'chg' }, faqs: [['What if the old value is negative?', 'This calculator divides by the absolute value of the starting number, so the sign of the result shows the direction of the change.']] },
    { slug: 'percentage-increase-calculator', title: 'Percentage Increase Calculator', h1: 'Percentage Increase Calculator', desc: 'Increase a number by a percentage, such as a markup, raise or price rise. See the new value instantly.',
      intro: 'Add a percentage to any number to get the new total.', set: { mode: 'inc' }, faqs: [] }
  ]
},
{
  slug: 'fraction-calculator', cat: 'math', icon: '½',
  title: 'Fraction Calculator', h1: 'Fraction Calculator: Add, Subtract, Multiply & Divide',
  desc: 'Add, subtract, multiply and divide fractions and mixed numbers. Get the simplified fraction, mixed number and decimal.',
  fields: [
    n('w1', 'Whole', 0, { min: 0, step: 1, optional: 1 }), n('n1', 'Numerator', 1, { step: 1 }), n('d1', 'Denominator', 2, { step: 1 }),
    sel('op', 'Operation', '+', [['+', 'Add (+)'], ['-', 'Subtract (−)'], ['*', 'Multiply (×)'], ['/', 'Divide (÷)']]),
    n('w2', 'Whole', 0, { min: 0, step: 1, optional: 1 }), n('n2', 'Numerator', 1, { step: 1 }), n('d2', 'Denominator', 3, { step: 1 })
  ],
  compute: function (v, H) {
    var ints = [v.w1, v.n1, v.d1, v.w2, v.n2, v.d2]; if (ints.some(function (x) { return Math.round(x) !== x; })) return { err: 'Use whole numbers only.' };
    if (!v.d1 || !v.d2) return { err: 'A denominator cannot be zero.' };
    var a = v.w1 * v.d1 + v.n1, b = v.d1, c = v.w2 * v.d2 + v.n2, d = v.d2, nu, de;
    if (v.op === '+') { nu = a * d + c * b; de = b * d; } else if (v.op === '-') { nu = a * d - c * b; de = b * d; } else if (v.op === '*') { nu = a * c; de = b * d; } else { if (!c) return { err: 'You cannot divide by zero.' }; nu = a * d; de = b * c; }
    if (de < 0) { nu = -nu; de = -de; }
    var g = H.gcd(nu, de) || 1, sn = nu / g, sd = de / g, whole = Math.trunc(sn / sd), rem = Math.abs(sn % sd);
    var mixed = sd === 1 ? String(sn) : (whole === 0 ? (sn < 0 ? '-' : '') + rem + '/' + sd : whole + ' ' + rem + '/' + sd);
    return { res: [{ l: 'Result (simplified)', v: sd === 1 ? String(sn) : sn + '/' + sd, big: 1 }, { l: 'Mixed number', v: mixed }, { l: 'Decimal', v: H.num(sn / sd, 8) }, { l: 'Unsimplified', v: nu + '/' + de }] };
  },
  about: '<p>To add or subtract fractions you need a common denominator; to multiply you multiply across the top and bottom; to divide you multiply by the reciprocal of the second fraction. This calculator does the steps and reduces the answer to lowest terms with the greatest common factor.</p>',
  formula: 'a/b + c/d = (ad + bc) ÷ bd. a/b × c/d = ac ÷ bd. a/b ÷ c/d = ad ÷ bc. Simplify by dividing top and bottom by their GCF.',
  faqs: [
    ['How do I add fractions with different denominators?', 'Convert both to a common denominator, add the numerators and simplify. For 1/2 + 1/3: 3/6 + 2/6 = 5/6.'],
    ['How do I enter a mixed number?', 'Type the whole part in the first box, such as 2 for 2 1/4, then the numerator and denominator.']
  ],
  related: ['lcm-calculator', 'percentage-calculator', 'ratio-calculator']
},
{
  slug: 'lcm-calculator', cat: 'math', icon: '🔢',
  title: 'LCM Calculator', h1: 'LCM & GCF Calculator (Least Common Multiple, Greatest Common Factor)',
  desc: 'Find the least common multiple (LCM) and greatest common factor (GCF) of two or more numbers, with prime factorizations.',
  fields: [{ id: 'list', label: 'Numbers (separated by commas or spaces)', type: 'text', value: '12, 18, 24', ph: '12, 18, 24' }],
  compute: function (v, H) {
    var a = H.nums(v.list).filter(function (x) { return x > 0 && Math.round(x) === x; });
    if (a.length < 2) return { err: 'Enter at least two positive whole numbers.' };
    var g = a[0], l = a[0]; a.slice(1).forEach(function (x) { g = H.gcd(g, x); l = l / H.gcd(l, x) * x; });
    if (l > 9e15) return { err: 'The LCM is too large to calculate exactly.' };
    return { res: [{ l: 'LCM', v: H.num(l, 0), big: 1 }, { l: 'GCF (GCD)', v: H.num(g, 0), big: 1 }],
      table: { title: 'Prime factorization', head: ['Number', 'Prime factors'], rows: a.map(function (x) { var p = x < 1e12 ? H.primes(x) : []; return [x, p.length ? (p.length === 1 && p[0] === x ? x + ' (prime)' : p.join(' × ')) : '—']; }) } };
  },
  about: '<p>The least common multiple is the smallest number that every input divides into evenly. It is what you need to find a common denominator. The greatest common factor is the largest number that divides all inputs, used to simplify fractions and ratios.</p>',
  formula: 'GCF by the Euclidean algorithm. LCM(a, b) = a × b ÷ GCF(a, b); extend to more numbers one at a time.',
  faqs: [
    ['What is the LCM of 12 and 18?', 'The LCM of 12 and 18 is 36, and their GCF is 6.'],
    ['What is the difference between LCM and GCF?', 'The LCM is the smallest shared multiple (always the same size or larger than the inputs); the GCF is the largest shared factor (the same size or smaller).']
  ],
  related: ['fraction-calculator', 'ratio-calculator', 'average-calculator'],
  variants: [{ slug: 'gcf-calculator', title: 'GCF Calculator', h1: 'GCF Calculator (Greatest Common Factor)', desc: 'Find the greatest common factor (GCF or GCD) of two or more numbers. Also shows the LCM and prime factors.',
    intro: 'Enter two or more whole numbers to find their greatest common factor, also called the greatest common divisor.', set: { list: '48, 180' }, faqs: [['Is GCF the same as GCD?', 'Yes. Greatest common factor (GCF), greatest common divisor (GCD) and highest common factor (HCF) all mean the same thing.']] }]
},
{
  slug: 'area-calculator', cat: 'math', icon: '📐',
  title: 'Area Calculator', h1: 'Area Calculator for Common Shapes',
  desc: 'Calculate the area and perimeter of a rectangle, triangle, circle, trapezoid, parallelogram or ellipse. Choose your unit.',
  fields: [
    sel('shape', 'Shape', 'rect', [['rect', 'Rectangle'], ['tri', 'Triangle'], ['circ', 'Circle'], ['trap', 'Trapezoid'], ['para', 'Parallelogram'], ['ell', 'Ellipse']]),
    sel('u', 'Unit', 'ft', UNITS),
    n('l', 'Length', 12, { min: 0, step: 0.1, show: { id: 'shape', in: ['rect'] } }), n('w', 'Width', 8, { min: 0, step: 0.1, show: { id: 'shape', in: ['rect'] } }),
    n('b', 'Base', 10, { min: 0, step: 0.1, show: { id: 'shape', in: ['tri', 'para'] } }), n('h', 'Height', 6, { min: 0, step: 0.1, show: { id: 'shape', in: ['tri', 'para', 'trap'] } }),
    n('r', 'Radius', 5, { min: 0, step: 0.1, show: { id: 'shape', in: ['circ'] } }),
    n('t1', 'Top (a)', 6, { min: 0, step: 0.1, show: { id: 'shape', in: ['trap'] } }), n('t2', 'Bottom (b)', 10, { min: 0, step: 0.1, show: { id: 'shape', in: ['trap'] } }),
    n('ea', 'Semi-axis a', 6, { min: 0, step: 0.1, show: { id: 'shape', in: ['ell'] } }), n('eb', 'Semi-axis b', 4, { min: 0, step: 0.1, show: { id: 'shape', in: ['ell'] } })
  ],
  compute: function (v, H) {
    var s = v.shape, A, P = null, pi = Math.PI;
    if (s === 'rect') { A = v.l * v.w; P = 2 * (v.l + v.w); } else if (s === 'tri') A = v.b * v.h / 2; else if (s === 'circ') { A = pi * v.r * v.r; P = 2 * pi * v.r; }
    else if (s === 'trap') A = (v.t1 + v.t2) / 2 * v.h; else if (s === 'para') A = v.b * v.h; else { A = pi * v.ea * v.eb; var hh = Math.pow(v.ea - v.eb, 2) / Math.pow(v.ea + v.eb, 2); P = pi * (v.ea + v.eb) * (1 + 3 * hh / (10 + Math.sqrt(4 - 3 * hh))); }
    var res = [{ l: 'Area', v: H.num(A, 4) + ' ' + v.u + '²', big: 1 }]; if (P != null) res.push({ l: s === 'circ' ? 'Circumference' : 'Perimeter', v: H.num(P, 4) + ' ' + v.u });
    var f = { ft: 1, in: 1 / 144, yd: 9, m: 10.7639104167, cm: 0.00107639104167, mm: 0.0000107639104167 }[v.u];
    res.push({ l: 'In square feet', v: H.num(A * f, 4) + ' sq ft' }, { l: 'In square meters', v: H.num(A * f * 0.09290304, 4) + ' m²' });
    return { res: res };
  },
  about: '<p>Area measures the surface inside a flat shape, in square units. Pick a shape, enter its dimensions and the calculator returns the area, the perimeter or circumference where one exists, and conversions to square feet and square meters.</p>',
  formula: 'Rectangle = l × w. Triangle = ½ × b × h. Circle = π × r². Trapezoid = ½ × (a + b) × h. Parallelogram = b × h. Ellipse = π × a × b.',
  faqs: [
    ['How do I find the area of a circle?', 'Square the radius and multiply by π (3.14159). A circle with radius 5 has area 78.54.'],
    ['What is the difference between area and perimeter?', 'Area is the space inside a shape (square units); perimeter is the distance around it (linear units).']
  ],
  related: ['square-footage-calculator', 'volume-calculator', 'concrete-calculator'],
},
{
  slug: 'square-footage-calculator', cat: 'math', icon: '🏡',
  title: 'Square Footage Calculator', h1: 'Square Footage Calculator',
  desc: 'Add up the square footage of rooms or areas. Enter length and width for each space and optionally estimate cost per square foot.',
  fields: [{ id: 'rooms', label: 'Rooms or areas (feet)', type: 'rows', min: 1, cols: [{ id: 'name', label: 'Name', type: 'text', ph: 'Room' }, { id: 'l', label: 'Length ft', type: 'number', min: 0, step: 0.1, w: 'sm' }, { id: 'w', label: 'Width ft', type: 'number', min: 0, step: 0.1, w: 'sm' }],
    rows: [{ name: 'Living room', l: 18, w: 14 }, { name: 'Kitchen', l: 12, w: 11 }, { name: 'Bedroom', l: 13, w: 12 }] },
    n('cost', 'Cost per sq ft (optional)', 0, { pre: '$', min: 0, optional: 1, step: 0.5 }),
    n('waste', 'Waste allowance (optional)', 0, { suf: '%', min: 0, max: 50, optional: 1, step: 1, hint: 'Flooring and tile jobs usually add 5–10%.' })],
  compute: function (v, H) {
    var tot = 0, rows = v.rooms.map(function (r) { var a = r.l * r.w; tot += a; return [r.name || '—', H.num(r.l, 2) + ' × ' + H.num(r.w, 2), H.num(a, 2) + ' sq ft']; });
    var w = tot * (1 + v.waste / 100), res = [{ l: 'Total area', v: H.num(tot, 2) + ' sq ft', big: 1 }, { l: 'Square meters', v: H.num(tot * 0.09290304, 2) + ' m²' }, { l: 'Square yards', v: H.num(tot / 9, 2) + ' yd²' }];
    if (v.waste > 0) res.push({ l: 'With waste allowance', v: H.num(w, 2) + ' sq ft' }); if (v.cost > 0) res.push({ l: 'Estimated cost', v: H.money(w * v.cost) });
    return { res: res, table: { title: 'Area by room', head: ['Room', 'Size (ft)', 'Area'], rows: rows } };
  },
  about: '<p>Square footage is the standard way to size homes, floors, paint jobs and landscaping. Measure each rectangular space, enter its length and width, and the calculator totals them. Split L-shaped rooms into two rectangles and add each as a row.</p>',
  formula: 'Area (sq ft) = length (ft) × width (ft). Total = sum of all rooms. 1 sq ft = 0.0929 m².',
  faqs: [['How do I measure square footage of a room?', 'Measure the length and width in feet and multiply them. For irregular rooms, split the floor plan into rectangles and add the results.'], ['How much extra flooring should I buy?', 'Order about 5% to 10% extra to cover cuts and mistakes, more for diagonal or patterned layouts.']],
  related: ['area-calculator', 'concrete-calculator', 'volume-calculator']
},
{
  slug: 'volume-calculator', cat: 'math', icon: '🧊',
  title: 'Volume Calculator', h1: 'Volume Calculator for 3D Shapes',
  desc: 'Calculate the volume and surface area of a box, cylinder, sphere, cone or pyramid. Converts to liters and gallons.',
  fields: [
    sel('shape', 'Shape', 'box', [['box', 'Box / rectangular prism'], ['cyl', 'Cylinder'], ['sph', 'Sphere'], ['cone', 'Cone'], ['pyr', 'Square pyramid']]), sel('u', 'Unit', 'ft', UNITS),
    n('l', 'Length', 6, { min: 0, step: 0.1, show: { id: 'shape', in: ['box'] } }), n('w', 'Width', 4, { min: 0, step: 0.1, show: { id: 'shape', in: ['box'] } }),
    n('s', 'Base side', 4, { min: 0, step: 0.1, show: { id: 'shape', in: ['pyr'] } }),
    n('r', 'Radius', 3, { min: 0, step: 0.1, show: { id: 'shape', in: ['cyl', 'sph', 'cone'] } }),
    n('h', 'Height', 5, { min: 0, step: 0.1, show: { id: 'shape', in: ['box', 'cyl', 'cone', 'pyr'] } })
  ],
  compute: function (v, H) {
    var s = v.shape, pi = Math.PI, V, S = null;
    if (s === 'box') { V = v.l * v.w * v.h; S = 2 * (v.l * v.w + v.l * v.h + v.w * v.h); } else if (s === 'cyl') { V = pi * v.r * v.r * v.h; S = 2 * pi * v.r * (v.r + v.h); }
    else if (s === 'sph') { V = 4 / 3 * pi * Math.pow(v.r, 3); S = 4 * pi * v.r * v.r; } else if (s === 'cone') { V = pi * v.r * v.r * v.h / 3; S = pi * v.r * (v.r + Math.sqrt(v.r * v.r + v.h * v.h)); }
    else { V = v.s * v.s * v.h / 3; S = v.s * v.s + 2 * v.s * Math.sqrt(v.s * v.s / 4 + v.h * v.h); }
    var m = { ft: 0.3048, in: 0.0254, yd: 0.9144, m: 1, cm: 0.01, mm: 0.001 }[v.u], L = V * m * m * m * 1000;
    var res = [{ l: 'Volume', v: H.num(V, 4) + ' ' + v.u + '³', big: 1 }, { l: 'Surface area', v: H.num(S, 4) + ' ' + v.u + '²' }, { l: 'Liters', v: H.num(L, 3) + ' L' }, { l: 'US gallons', v: H.num(L / 3.785411784, 3) + ' gal' }, { l: 'Cubic feet', v: H.num(L / 28.316846592, 3) + ' ft³' }];
    return { res: res };
  },
  about: '<p>Volume is the amount of space inside a three-dimensional object. Choose a shape, enter the dimensions in one unit and you get volume, surface area and the equivalent in liters, gallons and cubic feet. This is handy for tanks, planters, pools and packaging.</p>',
  formula: 'Box = l × w × h. Cylinder = π r² h. Sphere = 4/3 π r³. Cone = 1/3 π r² h. Square pyramid = 1/3 s² h.',
  faqs: [['How do I convert cubic feet to gallons?', 'Multiply cubic feet by 7.48. One cubic foot holds about 7.48 US gallons.'], ['What is the volume of a cylinder?', 'Multiply π by the radius squared by the height.']],
  related: ['area-calculator', 'concrete-calculator', 'square-footage-calculator']
},
{
  slug: 'ratio-calculator', cat: 'math', icon: '⚗️',
  title: 'Ratio Calculator', h1: 'Ratio Calculator: Simplify & Solve Ratios',
  desc: 'Simplify a ratio to lowest terms or solve for a missing value in a proportion such as A:B = C:X.',
  fields: [
    sel('mode', 'What do you want to do?', 'simp', [['simp', 'Simplify a ratio'], ['solve', 'Solve A : B = C : X']]),
    n('a', 'A', 24, { min: 0, step: 'any' }), n('b', 'B', 36, { min: 0, step: 'any' }),
    n('c', 'C', 10, { min: 0, step: 'any', show: { id: 'mode', in: ['solve'] } })
  ],
  compute: function (v, H) {
    if (v.mode === 'simp') {
      var k = 1; while ((v.a * k % 1 || v.b * k % 1) && k < 1e6) k *= 10;
      var x = Math.round(v.a * k), y = Math.round(v.b * k), g = H.gcd(x, y) || 1;
      return { res: [{ l: 'Simplified ratio', v: (x / g) + ' : ' + (y / g), big: 1 }, { l: 'As a fraction', v: (x / g) + '/' + (y / g) }, { l: 'A as % of total', v: H.pct(v.a / (v.a + v.b) * 100, 2) }, { l: 'Decimal (A ÷ B)', v: H.num(v.a / v.b, 6) }] };
    }
    if (!v.a) return { err: 'A cannot be zero when solving.' };
    var xv = v.b * v.c / v.a; return { res: [{ l: 'X', v: H.num(xv, 6), big: 1 }, { l: 'Proportion', v: H.num(v.a, 4) + ' : ' + H.num(v.b, 4) + ' = ' + H.num(v.c, 4) + ' : ' + H.num(xv, 4) }], note: 'X = B × C ÷ A' };
  },
  about: '<p>A ratio compares two quantities. To simplify one, divide both terms by their greatest common factor. To solve a proportion, cross-multiply: if A:B = C:X then X = B × C ÷ A. Use it for recipes, scale models, mixing, maps and aspect ratios.</p>',
  formula: 'Simplify: divide A and B by GCF(A, B). Solve: X = B × C ÷ A.',
  faqs: [['How do I simplify a ratio?', 'Divide both numbers by their greatest common factor. 24:36 divided by 12 gives 2:3.'], ['How do I scale a recipe?', 'Use "Solve": if 2 cups serve 4 people, A = 2, B = 4 and C = the number of people you need.']],
  related: ['fraction-calculator', 'percentage-calculator', 'lcm-calculator']
},
{
  slug: 'average-calculator', cat: 'math', icon: '📊',
  title: 'Average Calculator', h1: 'Average Calculator: Mean, Median, Mode & Standard Deviation',
  desc: 'Find the mean, median, mode, range and standard deviation of any list of numbers. Free statistics calculator with sample and population results.',
  fields: [{ id: 'list', label: 'Numbers (separated by commas, spaces or new lines)', type: 'text', long: 1, value: '12, 15, 9, 22, 15, 18, 30', ph: '12, 15, 9, 22' }],
  compute: function (v, H) {
    var a = H.nums(v.list); if (!a.length) return { err: 'Enter at least one number.' };
    var N = a.length, s = a.reduce(function (x, y) { return x + y; }, 0), mean = s / N, sorted = a.slice().sort(function (x, y) { return x - y; });
    var med = N % 2 ? sorted[(N - 1) / 2] : (sorted[N / 2 - 1] + sorted[N / 2]) / 2, cnt = {}, best = 0; a.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; if (cnt[x] > best) best = cnt[x]; });
    var modes = Object.keys(cnt).filter(function (k) { return cnt[k] === best; }).map(Number).sort(function (x, y) { return x - y; });
    var ss = a.reduce(function (t, x) { return t + (x - mean) * (x - mean); }, 0), pv = ss / N, sv = N > 1 ? ss / (N - 1) : NaN;
    var res = [{ l: 'Mean (average)', v: H.num(mean, 6), big: 1 }, { l: 'Median', v: H.num(med, 6), big: 1 }, { l: 'Mode', v: best === 1 && N > 1 ? 'None (all values unique)' : modes.map(function (x) { return H.num(x, 6); }).join(', '), big: 1 },
      { l: 'Count', v: H.num(N, 0) }, { l: 'Sum', v: H.num(s, 6) }, { l: 'Minimum', v: H.num(sorted[0], 6) }, { l: 'Maximum', v: H.num(sorted[N - 1], 6) }, { l: 'Range', v: H.num(sorted[N - 1] - sorted[0], 6) },
      { l: 'Standard deviation (sample)', v: H.num(Math.sqrt(sv), 6) }, { l: 'Standard deviation (population)', v: H.num(Math.sqrt(pv), 6) }, { l: 'Variance (sample)', v: H.num(sv, 6) }, { l: 'Variance (population)', v: H.num(pv, 6) }];
    return { res: res, note: 'Sorted: ' + sorted.map(function (x) { return H.num(x, 6); }).join(', ') };
  },
  about: '<p>Paste or type a list of numbers and see the main summary statistics at once. The mean adds the values and divides by how many there are; the median is the middle value when sorted; the mode is the most common value. Standard deviation measures how spread out the numbers are.</p><p>Use the sample standard deviation when your numbers are a sample from a larger group, and the population version when they are the entire group.</p>',
  formula: 'Mean = Σx ÷ n. Sample standard deviation = √(Σ(x − mean)² ÷ (n − 1)). Population standard deviation = √(Σ(x − mean)² ÷ n).',
  faqs: [['What is the difference between mean and median?', 'The mean is the arithmetic average; the median is the middle value. The median is less affected by extreme values.'], ['Sample or population standard deviation?', 'Use sample (n − 1) when the data is a subset of a larger group, population (n) when you have every value.']],
  related: ['percentage-calculator', 'grade-calculator', 'ratio-calculator'],
  variants: [
    { slug: 'standard-deviation-calculator', title: 'Standard Deviation Calculator', h1: 'Standard Deviation Calculator', desc: 'Calculate sample and population standard deviation and variance for any data set, with the mean and median.',
      intro: 'Enter your data to get sample and population standard deviation and variance.', set: {}, faqs: [] },
    { slug: 'statistics-calculator', title: 'Statistics Calculator', h1: 'Statistics Calculator', desc: 'Free statistics calculator: mean, median, mode, range, variance and standard deviation for any list of numbers.',
      intro: 'Get a full set of descriptive statistics from a list of numbers.', set: {}, faqs: [] }
  ]
}
];
