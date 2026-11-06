/* Date, time & everyday. */
var n = function (id, label, value, o) { return Object.assign({ id: id, label: label, type: 'number', value: value }, o || {}); };
var sel = function (id, label, value, opts, o) { return Object.assign({ id: id, label: label, type: 'select', value: value, opts: opts }, o || {}); };
var date = function (id, label, value, o) { return Object.assign({ id: id, label: label, type: 'date', value: value }, o || {}); };
var week = function () { return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(function (d) { return { day: d, tin: '09:00', tout: '17:00', brk: 30 }; }); };

module.exports = [
{
  slug: 'age-calculator', cat: 'life', icon: '🎂',
  title: 'Age Calculator', h1: 'Age Calculator: Exact Age in Years, Months & Days',
  desc: 'Find your exact age in years, months and days from your date of birth. See total days lived and the countdown to your next birthday.',
  fields: [date('dob', 'Date of birth', '1990-06-15'), date('asof', 'Age at the date of', 'today')],
  compute: function (v, H) {
    var b = H.parseDate(v.dob), t = H.parseDate(v.asof); if (!b || !t) return { err: 'Choose both dates.' }; if (b > t) return { err: 'The date of birth must be before the second date.' };
    var d = H.ymd(b, t), days = H.daysBetween(b, t), y = t.getUTCFullYear(), nb = new Date(Date.UTC(y, b.getUTCMonth(), b.getUTCDate())); if (nb < t) nb = new Date(Date.UTC(y + 1, b.getUTCMonth(), b.getUTCDate()));
    var left = H.daysBetween(t, nb);
    return { res: [{ l: 'Your age', v: d.y + ' years, ' + d.m + ' months, ' + d.d + ' days', big: 1 }, { l: 'Next birthday', v: left === 0 ? 'Today. Happy birthday!' : H.dateShort(nb) + ' (in ' + H.plural(left, 'day') + ')' },
      { l: 'Born on a', v: H.weekday(b) }, { l: 'Total months', v: H.num(d.y * 12 + d.m, 0) }, { l: 'Total weeks', v: H.num(Math.floor(days / 7), 0) }, { l: 'Total days', v: H.num(days, 0) }, { l: 'Total hours', v: H.num(days * 24, 0) }] };
  },
  about: '<p>Your exact age counts full years, then the extra months and days since your last birthday. The calculator uses calendar months, so it matches how age is normally stated on forms. Change the second date to find someone\'s age on a past or future day, for example on a school cutoff date.</p>',
  formula: 'Age = difference between the two dates in complete years, months and days. Total days = end date − birth date.',
  faqs: [['How do I calculate my age in days?', 'Subtract your birth date from today\'s date. The "Total days" line shows the result.'], ['What if I was born on February 29?', 'In non-leap years most places treat your birthday as either February 28 or March 1. This calculator counts it as March 1.']],
  related: ['date-difference-calculator', 'date-calculator', 'due-date-calculator']
},
{
  slug: 'date-difference-calculator', cat: 'life', icon: '↔️',
  title: 'Date Difference Calculator', h1: 'Days Between Dates Calculator',
  desc: 'Count the days, weeks, months and business days between two dates. Works for past and future dates.',
  fields: [date('s', 'Start date', 'today'), date('e', 'End date', 'today+90'), sel('inc', 'Include the end date?', '0', [['0', 'No'], ['1', 'Yes (+1 day)']])],
  compute: function (v, H) {
    var a = H.parseDate(v.s), b = H.parseDate(v.e); if (!a || !b) return { err: 'Choose both dates.' };
    var swapped = false; if (b < a) { var t = a; a = b; b = t; swapped = true; }
    var inc = +v.inc, days = H.daysBetween(a, b) + inc, ymd = H.ymd(a, b), bd = 0, i;
    for (i = 0; i < days && i < 200000; i++) { var wd = H.addDays(a, i).getUTCDay(); if (wd !== 0 && wd !== 6) bd++; }
    return { res: [{ l: 'Days between', v: H.num(days, 0) + ' days', big: 1 }, { l: 'Weeks and days', v: Math.floor(days / 7) + ' weeks, ' + (days % 7) + ' days' }, { l: 'Years, months, days', v: ymd.y + ' years, ' + ymd.m + ' months, ' + ymd.d + ' days' },
      { l: 'Business days (Mon–Fri)', v: H.num(bd, 0) }, { l: 'Weekend days', v: H.num(days - bd, 0) }, { l: 'Hours', v: H.num(days * 24, 0) }], note: swapped ? 'The end date was earlier, so the dates were swapped.' : '' };
  },
  about: '<p>Use this tool to count the days until an event, since a past date, or the length of a project. It also splits the span into weeks, calendar months and business days (Monday to Friday, not counting public holidays).</p>',
  formula: 'Days = end date − start date (+1 if the end date is included). Business days count Monday to Friday only.',
  faqs: [['Are public holidays excluded from business days?', 'No, only weekends are excluded. Subtract any public holidays that fall on weekdays yourself.'], ['Should I include the end date?', 'Include it when both the first and last day count, for example a hotel stay or a leave request.']],
  related: ['date-calculator', 'age-calculator', 'work-hours-calculator'],
  variants: [
    { slug: 'day-counter', title: 'Day Counter', h1: 'Day Counter: How Many Days Until or Since a Date', desc: 'Count the days until or since any date. Set your start and end date to see days, weeks and business days.',
      intro: 'Set a start and end date to count the days. Leave the start as today to count down to an event.', set: {}, faqs: [] },
    { slug: 'days-between-dates-calculator', title: 'Days Between Dates Calculator', h1: 'Days Between Two Dates Calculator', desc: 'Calculate the number of days between two dates, including weeks, months and business days.',
      intro: 'Pick any two dates to find the exact number of days between them.', set: {}, faqs: [] }
  ]
},
{
  slug: 'date-calculator', cat: 'life', icon: '🗓️',
  title: 'Date Calculator', h1: 'Date Calculator: Add or Subtract Days, Weeks, Months & Years',
  desc: 'Add or subtract days, weeks, months and years from any date. Find the future or past date and its weekday.',
  fields: [date('s', 'Start date', 'today'), sel('op', 'Operation', 'add', [['add', 'Add'], ['sub', 'Subtract']]),
    n('y', 'Years', 0, { min: 0, step: 1, optional: 1 }), n('m', 'Months', 0, { min: 0, step: 1, optional: 1 }), n('w', 'Weeks', 0, { min: 0, step: 1, optional: 1 }), n('d', 'Days', 100, { min: 0, step: 1, optional: 1 })],
  compute: function (v, H) {
    var s = H.parseDate(v.s); if (!s) return { err: 'Choose a start date.' };
    var k = v.op === 'add' ? 1 : -1, r = H.addMonths(s, k * (v.y * 12 + v.m)); r = H.addDays(r, k * (v.w * 7 + v.d));
    return { res: [{ l: 'Result', v: H.date(r), big: 1 }, { l: 'Day of the week', v: H.weekday(r) }, { l: 'Total days from the start', v: H.num(Math.abs(H.daysBetween(s, r)), 0) }, { l: 'Start date', v: H.date(s) }] };
  },
  about: '<p>Use the date calculator to work out deadlines, due dates, anniversaries and expiry dates. Years and months are added first (clamping to the last day of the month when needed, so January 31 plus one month is the end of February), then weeks and days.</p>',
  formula: 'Result = start date ± (years × 12 + months) months ± (weeks × 7 + days) days.',
  faqs: [['What is 90 days from today?', 'Set Operation to Add and Days to 90. The result is shown with its weekday.'], ['How are months added?', 'The same day of the month is kept. If it does not exist in the target month, the last day of that month is used.']],
  related: ['date-difference-calculator', 'age-calculator', 'due-date-calculator']
},
{
  slug: 'time-clock-calculator', cat: 'life', icon: '⏱️',
  title: 'Time Clock Calculator', h1: 'Time Clock Calculator: Hours Worked & Pay',
  desc: 'Calculate hours worked from clock in and out times, subtract breaks, and estimate pay with overtime. Free timesheet calculator.',
  fields: [{ id: 'days', label: 'Time card', type: 'rows', min: 1, cols: [{ id: 'day', label: 'Day', type: 'text', w: 'sm' }, { id: 'tin', label: 'Clock in', type: 'time' }, { id: 'tout', label: 'Clock out', type: 'time' }, { id: 'brk', label: 'Break (min)', type: 'number', min: 0, step: 5, w: 'sm', optional: 1 }], rows: week() },
    n('rate', 'Hourly rate (optional)', 0, { pre: '$', min: 0, step: 0.25, optional: 1 }), n('ot', 'Overtime after (hours per week)', 40, { min: 0, step: 1, optional: 1 }), n('mult', 'Overtime multiplier', 1.5, { min: 1, step: 0.25, optional: 1 })],
  compute: function (v, H) {
    var tot = 0, rows = v.days.map(function (r) {
      var a = H.mins(r.tin), b = H.mins(r.tout); if (!isFinite(a) || !isFinite(b)) return [r.day || '—', '—', '—', '—'];
      var m = ((b - a) % 1440 + 1440) % 1440 - (r.brk || 0); m = Math.max(m, 0); tot += m; return [r.day || '—', H.clock(a) + ' – ' + H.clock(b), r.brk || 0, H.hm(m) + ' (' + H.num(m / 60, 2) + ')'];
    });
    var hrs = tot / 60, otH = v.ot > 0 ? Math.max(hrs - v.ot, 0) : 0, reg = hrs - otH;
    var res = [{ l: 'Total hours', v: H.hm(tot), big: 1 }, { l: 'Decimal hours', v: H.num(hrs, 2), big: 1 }];
    if (otH > 0) res.push({ l: 'Regular / overtime hours', v: H.num(reg, 2) + ' / ' + H.num(otH, 2) });
    if (v.rate > 0) res.push({ l: 'Gross pay', v: H.money(reg * v.rate + otH * v.rate * v.mult), big: 1 });
    return { res: res, table: { title: 'Daily breakdown', head: ['Day', 'Shift', 'Break (min)', 'Hours worked'], rows: rows }, note: 'Shifts that pass midnight are handled automatically. Overtime rules vary by state and employer.' };
  },
  about: '<p>Enter your clock-in and clock-out time for each day, subtract unpaid breaks, and the calculator totals your hours in both hours-and-minutes and decimal format, the one payroll systems use. Add an hourly rate to estimate gross pay with overtime.</p>',
  formula: 'Hours worked = clock out − clock in − break. Decimal hours = minutes ÷ 60. Overtime pay = overtime hours × rate × multiplier.',
  faqs: [['How do I convert minutes to decimal hours?', 'Divide the minutes by 60. 30 minutes is 0.5 hours and 45 minutes is 0.75 hours.'], ['How is overtime calculated?', 'In the U.S., federal law generally requires 1.5× pay for hours over 40 in a workweek for eligible employees. Some states also count daily overtime.']],
  related: ['salary-to-hourly-calculator', 'date-difference-calculator', 'sleep-calculator'],
  variants: [
    { slug: 'work-hours-calculator', title: 'Work Hours Calculator', h1: 'Work Hours Calculator', desc: 'Add up your work hours for the week from start and end times with breaks. See decimal hours and gross pay.',
      intro: 'Track your weekly work hours with start and end times and unpaid breaks.', set: {}, faqs: [] },
    { slug: 'hours-calculator', title: 'Hours Calculator', h1: 'Hours Calculator: Time Between Two Times', desc: 'Calculate the hours and minutes between two times, across midnight if needed. Includes decimal hours.',
      intro: 'Enter a start and end time to see the hours between. Use one row, or several for a full week.', set: { days: [{ day: 'Shift', tin: '08:15', tout: '16:45', brk: 0 }] }, faqs: [] }
  ]
},
{
  slug: 'concrete-calculator', cat: 'life', icon: '🧱',
  title: 'Concrete Calculator', h1: 'Concrete Calculator: Cubic Yards & Bags Needed',
  desc: 'Estimate how many cubic yards of concrete or 40, 60 and 80 lb bags you need for a slab, patio or round column.',
  fields: [sel('shape', 'Project', 'slab', [['slab', 'Slab / patio / driveway'], ['col', 'Round column / footing / post hole']]),
    n('l', 'Length', 10, { suf: 'ft', min: 0, step: 0.5, show: { id: 'shape', in: ['slab'] } }), n('w', 'Width', 10, { suf: 'ft', min: 0, step: 0.5, show: { id: 'shape', in: ['slab'] } }), n('t', 'Thickness', 4, { suf: 'in', min: 0, step: 0.5, show: { id: 'shape', in: ['slab'] } }),
    n('dia', 'Diameter', 12, { suf: 'in', min: 0, step: 1, show: { id: 'shape', in: ['col'] } }), n('ht', 'Depth / height', 3, { suf: 'ft', min: 0, step: 0.5, show: { id: 'shape', in: ['col'] } }), n('qty', 'Quantity', 4, { min: 1, step: 1, show: { id: 'shape', in: ['col'] } }),
    n('waste', 'Extra for waste', 10, { suf: '%', min: 0, max: 50, step: 1, optional: 1 }), n('price', 'Price per cubic yard (optional)', 0, { pre: '$', min: 0, optional: 1, step: 5 })],
  compute: function (v, H) {
    var cf = v.shape === 'slab' ? v.l * v.w * v.t / 12 : Math.PI * Math.pow(v.dia / 24, 2) * v.ht * v.qty, tot = cf * (1 + v.waste / 100), yd = tot / 27;
    var res = [{ l: 'Concrete needed', v: H.num(yd, 2) + ' cubic yards', big: 1 }, { l: 'Cubic feet', v: H.num(tot, 1) + ' ft³' }, { l: 'Cubic meters', v: H.num(yd * 0.764554858, 2) + ' m³' },
      { l: '80 lb bags (0.60 ft³)', v: H.num(Math.ceil(tot / 0.6), 0) + ' bags' }, { l: '60 lb bags (0.45 ft³)', v: H.num(Math.ceil(tot / 0.45), 0) + ' bags' }, { l: '40 lb bags (0.30 ft³)', v: H.num(Math.ceil(tot / 0.3), 0) + ' bags' }];
    if (v.price > 0) res.push({ l: 'Estimated cost (ready-mix)', v: H.money(yd * v.price) });
    return { res: res, note: 'Ready-mix is sold by the cubic yard, often with a minimum order. Bag yields are approximate; check the label.' };
  },
  about: '<p>Concrete is ordered by volume. For a slab, multiply length by width by thickness (converted to feet) and divide by 27 to get cubic yards. For round columns or post holes, the calculator uses the cylinder volume. A 10% allowance covers spillage, uneven sub-grade and over-excavation.</p><p>For small jobs, bagged concrete is easier; for anything above roughly 1 cubic yard, ready-mix delivery usually saves time.</p>',
  formula: 'Slab volume (yd³) = length (ft) × width (ft) × thickness (in) ÷ 12 ÷ 27. Column volume = π × (diameter ÷ 2)² × depth × quantity.',
  faqs: [['How many 80 lb bags make a cubic yard?', 'About 45 bags of 80 lb concrete mix make one cubic yard (27 ÷ 0.6).'], ['How thick should a concrete slab be?', 'Patios and walkways are usually 4 inches thick. Driveways and garage floors are typically 5 to 6 inches.']],
  related: ['square-footage-calculator', 'volume-calculator', 'area-calculator']
},
{
  slug: 'sleep-calculator', cat: 'life', icon: '😴',
  title: 'Sleep Calculator', h1: 'Sleep Calculator: Best Bedtime & Wake-Up Times',
  desc: 'Find the best time to go to bed or wake up based on 90-minute sleep cycles so you wake refreshed.',
  fields: [sel('mode', 'I want to…', 'wake', [['wake', 'Wake up at a set time (find my bedtime)'], ['bed', 'Go to bed at a set time (find my wake-up)']]),
    { id: 'time', label: 'Time', type: 'time', value: '07:00' }, n('lat', 'Minutes to fall asleep', 15, { min: 0, max: 90, step: 5, optional: 1 })],
  compute: function (v, H) {
    var t = H.mins(v.time); if (!isFinite(t)) return { err: 'Choose a time.' };
    var cyc = [6, 5, 4, 3], rows = cyc.map(function (c) { var m = c * 90, when = v.mode === 'wake' ? t - m - v.lat : t + v.lat + m; return [H.clock(when), c + ' cycles', H.hm(m), c >= 5 ? 'Recommended' : 'Short']; });
    return { res: [{ l: v.mode === 'wake' ? 'Best bedtime' : 'Best wake-up time', v: rows[1][0], big: 1 }, { l: 'Also good', v: rows[0][0] + ' or ' + rows[2][0] }],
      table: { title: v.mode === 'wake' ? 'Go to bed at…' : 'Wake up at…', head: [v.mode === 'wake' ? 'Bedtime' : 'Wake-up', 'Sleep cycles', 'Sleep time', 'Verdict'], rows: rows }, note: 'Adults generally need 7–9 hours of sleep. Cycle length varies by person, so treat times as a guide.' };
  },
  about: '<p>Sleep runs in cycles of roughly 90 minutes, moving from light to deep to REM sleep. Waking at the end of a cycle usually feels easier than being pulled out of deep sleep. This calculator counts back (or forward) in 90-minute steps and adds the time it takes you to fall asleep.</p>',
  formula: 'Bedtime = wake-up time − (number of cycles × 90 min) − time to fall asleep.',
  faqs: [['How many sleep cycles do I need?', 'Most adults do well with 5 or 6 cycles, which is 7.5 to 9 hours.'], ['What time should I go to bed to wake up at 6 AM?', 'Set the wake-up time to 6:00 AM. For 5 cycles, the calculator suggests about 10:15 PM with a 15-minute fall-asleep time.']],
  related: ['time-clock-calculator', 'age-calculator', 'calorie-calculator']
}
];
