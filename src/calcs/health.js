/* Health & fitness. These are general estimates, not medical advice. */
var n = function (id, label, value, o) { return Object.assign({ id: id, label: label, type: 'number', value: value }, o || {}); };
var sel = function (id, label, value, opts, o) { return Object.assign({ id: id, label: label, type: 'select', value: value, opts: opts }, o || {}); };
var US = { id: 'unit', is: 'us' }, MET = { id: 'unit', is: 'metric' };
var body = function () {
  return [
    sel('unit', 'Units', 'us', [['us', 'US (ft, in, lb)'], ['metric', 'Metric (cm, kg)']]),
    n('ft', 'Height', 5, { suf: 'ft', min: 1, max: 8, show: US }), n('inch', 'Height', 9, { suf: 'in', min: 0, max: 11.9, step: 0.5, optional: 1, show: US }),
    n('lb', 'Weight', 160, { suf: 'lb', min: 20, max: 1400, show: US }),
    n('cm', 'Height', 175, { suf: 'cm', min: 50, max: 250, show: MET }), n('kg', 'Weight', 72, { suf: 'kg', min: 10, max: 600, show: MET })
  ];
};
var DISCLAIMER = 'These calculators give general estimates and are not medical advice. Talk to a doctor or registered dietitian before changing your diet or exercise routine.';

module.exports = [
{
  slug: 'bmi-calculator', cat: 'health', icon: '⚖️',
  title: 'BMI Calculator', h1: 'BMI Calculator for Adults',
  desc: 'Calculate your body mass index (BMI) in US or metric units. See your weight category and the healthy weight range for your height.',
  fields: body(),
  compute: function (v, H) {
    var us = v.unit === 'us', kg = us ? v.lb * 0.45359237 : v.kg, m = us ? (v.ft * 12 + v.inch) * 0.0254 : v.cm / 100;
    if (!(m > 0)) return { err: 'Enter your height.' };
    var b = kg / (m * m), c = b < 18.5 ? 'Underweight' : b < 25 ? 'Healthy weight' : b < 30 ? 'Overweight' : 'Obesity';
    var lo = 18.5 * m * m, hi = 24.9 * m * m, f = function (x) { return us ? H.num(x / 0.45359237, 0) + ' lb' : H.num(x, 1) + ' kg'; };
    return { res: [{ l: 'Your BMI', v: H.num(b, 1), big: 1 }, { l: 'Category', v: c, big: 1 }, { l: 'Healthy weight range for your height', v: f(lo) + ' – ' + f(hi) },
      { l: 'Difference to reach 24.9', v: b > 24.9 ? f(kg - hi) + ' to lose' : 'Within or below range' }],
      table: { title: 'Adult BMI categories (WHO)', head: ['BMI', 'Category'], rows: [['Below 18.5', 'Underweight'], ['18.5 – 24.9', 'Healthy weight'], ['25.0 – 29.9', 'Overweight'], ['30.0 and above', 'Obesity']] },
      note: 'BMI is a screening tool for adults 20 and older. It does not measure body fat or account for muscle mass, age or sex.' };
  },
  about: '<p>Body mass index (BMI) compares your weight with your height and is widely used to screen for weight categories that may affect health. This calculator uses the standard adult formula and the World Health Organization categories.</p><p>BMI is only a starting point. Athletes with a lot of muscle can have a high BMI at a healthy body fat level, and BMI can underestimate risk in older adults. For children and teens, BMI is interpreted using age and sex percentiles, which this tool does not provide.</p>',
  formula: 'BMI = weight (kg) ÷ height (m)². In US units: BMI = 703 × weight (lb) ÷ height (in)².',
  faqs: [
    ['What is a healthy BMI?', 'For adults, a BMI from 18.5 to 24.9 is considered the healthy weight range by the WHO and CDC.'],
    ['Is BMI accurate for athletes?', 'Not always. BMI cannot tell muscle from fat, so very muscular people may be classed as overweight. Waist size and body fat percentage give extra context.'],
    ['How do I lower my BMI?', 'Lasting changes in eating and activity help most. Use the calorie calculator to estimate your daily needs, and ask a health professional for personal advice.']
  ],
  related: ['calorie-calculator', 'macro-calculator', 'one-rep-max-calculator', 'sleep-calculator'], disclaimer: DISCLAIMER
},
{
  slug: 'calorie-calculator', cat: 'health', icon: '🔥',
  title: 'Calorie Calculator', h1: 'Calorie Calculator: Daily Calories to Maintain, Lose or Gain Weight',
  desc: 'Estimate how many calories you burn each day (BMR and TDEE) and how many to eat to lose or gain weight. Uses the Mifflin-St Jeor equation.',
  fields: [sel('sex', 'Sex', 'f', [['f', 'Female'], ['m', 'Male']]), n('age', 'Age', 32, { min: 15, max: 100, step: 1 })].concat(body()).concat([
    sel('act', 'Activity level', '1.55', [['1.2', 'Sedentary: little or no exercise'], ['1.375', 'Light: exercise 1–3 days a week'], ['1.55', 'Moderate: exercise 3–5 days a week'], ['1.725', 'Very active: exercise 6–7 days a week'], ['1.9', 'Extra active: hard training or physical job']])
  ]),
  compute: function (v, H) {
    var us = v.unit === 'us', kg = us ? v.lb * 0.45359237 : v.kg, cm = us ? (v.ft * 12 + v.inch) * 2.54 : v.cm;
    var bmr = 10 * kg + 6.25 * cm - 5 * v.age + (v.sex === 'm' ? 5 : -161), tdee = bmr * +v.act, floor = v.sex === 'm' ? 1500 : 1200;
    var goals = [['Lose 2 lb per week', -1000], ['Lose 1 lb per week', -500], ['Lose 0.5 lb per week', -250], ['Maintain weight', 0], ['Gain 0.5 lb per week', 250], ['Gain 1 lb per week', 500]];
    return { res: [{ l: 'Maintenance calories (TDEE)', v: H.num(tdee, 0) + ' kcal/day', big: 1 }, { l: 'Basal metabolic rate (BMR)', v: H.num(bmr, 0) + ' kcal/day' },
      { l: 'Mild weight loss (−250 kcal)', v: H.num(tdee - 250, 0) + ' kcal/day' }, { l: 'Weight loss (−500 kcal)', v: H.num(tdee - 500, 0) + ' kcal/day' }],
      table: { title: 'Daily calories for your goal', head: ['Goal', 'Calories per day', 'Note'],
        rows: goals.map(function (g) { var c = tdee + g[1]; return [g[0], H.num(c, 0), c < floor ? 'Below ' + H.num(floor, 0) + ': only under medical supervision' : '']; }) },
      note: 'About 3,500 calories equals one pound of body weight. Real results vary, so adjust after 2–3 weeks based on your progress.' };
  },
  about: '<p>This calculator estimates your basal metabolic rate (BMR), the calories your body burns at rest, using the Mifflin-St Jeor equation. Multiplying BMR by an activity factor gives your total daily energy expenditure (TDEE), the calories needed to maintain your current weight.</p><p>To lose weight, eat below your TDEE; to gain, eat above it. A deficit of 250 to 500 calories a day is a common, sustainable starting point.</p>',
  formula: 'BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5 (men) or − 161 (women). TDEE = BMR × activity factor.',
  faqs: [
    ['How many calories should I eat to lose weight?', 'Start by subtracting 250 to 500 calories from your maintenance calories. Avoid going below about 1,200 (women) or 1,500 (men) a day without medical guidance.'],
    ['What is the difference between BMR and TDEE?', 'BMR is what you burn at complete rest. TDEE adds the calories you burn through movement and exercise, so it is the number to use for planning.'],
    ['How accurate is this estimate?', 'Equations like Mifflin-St Jeor are usually within about 10% for most people. Track your weight for a few weeks and adjust.']
  ],
  related: ['bmi-calculator', 'macro-calculator', 'one-rep-max-calculator'], disclaimer: DISCLAIMER,
  variants: [
    { slug: 'tdee-calculator', title: 'TDEE Calculator', h1: 'TDEE Calculator: Total Daily Energy Expenditure',
      desc: 'Find your total daily energy expenditure (TDEE) from your age, size and activity level. Get calorie targets for cutting and bulking.',
      intro: 'Your TDEE is the number of calories you burn in a day, including activity. Use it as the starting point for any diet.', set: {}, faqs: [['What does TDEE stand for?', 'Total Daily Energy Expenditure: the calories you burn each day from resting metabolism, movement, exercise and digesting food.']] },
    { slug: 'maintenance-calorie-calculator', title: 'Maintenance Calorie Calculator', h1: 'Maintenance Calorie Calculator',
      desc: 'Calculate the calories you need each day to maintain your current weight, plus targets for losing or gaining.',
      intro: 'Maintenance calories are the amount you can eat each day without gaining or losing weight.', set: { act: '1.375' }, faqs: [] },
    { slug: 'calorie-deficit-calculator', title: 'Calorie Deficit Calculator', h1: 'Calorie Deficit Calculator',
      desc: 'Find the daily calorie deficit you need to lose weight at a safe pace. See calories for losing 0.5, 1 or 2 pounds a week.',
      intro: 'A calorie deficit means eating fewer calories than you burn. This tool shows the daily target for each weekly loss rate.', set: {}, faqs: [['How big should my calorie deficit be?', 'A 500-calorie daily deficit leads to about 1 pound lost per week. Smaller deficits are easier to sustain and help protect muscle.']] }
  ]
},
{
  slug: 'macro-calculator', cat: 'health', icon: '🥗',
  title: 'Macro Calculator', h1: 'Macro Calculator: Protein, Carbs & Fat Targets',
  desc: 'Turn your daily calorie goal into grams of protein, carbs and fat. Choose balanced, high-protein, low-carb or keto splits.',
  fields: [
    n('cal', 'Daily calories', 2000, { suf: 'kcal', min: 800, max: 10000, step: 50, hint: 'Use the calorie calculator if you are not sure.' }),
    sel('split', 'Macro split', 'bal', [['bal', 'Balanced (40% carbs / 30% protein / 30% fat)'], ['hp', 'High protein (30% carbs / 40% protein / 30% fat)'], ['lc', 'Low carb (25% carbs / 35% protein / 40% fat)'], ['keto', 'Keto (5% carbs / 25% protein / 70% fat)'], ['dri', 'Standard (50% carbs / 20% protein / 30% fat)']])
  ],
  compute: function (v, H) {
    var S = { bal: [40, 30, 30], hp: [30, 40, 30], lc: [25, 35, 40], keto: [5, 25, 70], dri: [50, 20, 30] }[v.split], k = [4, 4, 9], nm = ['Carbohydrates', 'Protein', 'Fat'];
    var g = S.map(function (p, i) { return v.cal * p / 100 / k[i]; });
    return { res: [{ l: 'Protein', v: H.num(g[1], 0) + ' g', big: 1 }, { l: 'Carbohydrates', v: H.num(g[0], 0) + ' g', big: 1 }, { l: 'Fat', v: H.num(g[2], 0) + ' g', big: 1 }],
      table: { title: 'Breakdown', head: ['Macro', 'Share of calories', 'Calories', 'Grams per day', 'Per meal (3 meals)'],
        rows: S.map(function (p, i) { return [nm[i], p + '%', H.num(v.cal * p / 100, 0), H.num(g[i], 0), H.num(g[i] / 3, 0) + ' g']; }) } };
  },
  about: '<p>Macronutrients are the three sources of calories in food: protein and carbohydrates provide 4 calories per gram and fat provides 9. Once you know your calorie target, a macro split tells you how many grams of each to aim for.</p><p>Higher protein intake helps preserve muscle during weight loss, while the right carbohydrate and fat balance mostly comes down to preference and how you train.</p>',
  formula: 'Grams = calories × share of that macro ÷ calories per gram (protein 4, carbs 4, fat 9).',
  faqs: [
    ['How much protein do I need?', 'Many active adults aim for about 0.7 to 1 gram per pound of body weight (1.6 to 2.2 g/kg). The general minimum for adults is 0.8 g/kg.'],
    ['Do I need to hit macros exactly?', 'No. Staying within a few percent of your targets most days is enough for most goals.']
  ],
  related: ['calorie-calculator', 'bmi-calculator', 'one-rep-max-calculator'], disclaimer: DISCLAIMER
},
{
  slug: 'due-date-calculator', cat: 'health', icon: '👶',
  title: 'Due Date Calculator', h1: 'Pregnancy Due Date Calculator',
  desc: 'Estimate your baby\'s due date from the first day of your last period. See your current week of pregnancy, trimester and key milestones.',
  fields: [
    { id: 'lmp', label: 'First day of last period', type: 'date', value: 'today-56' },
    n('cycle', 'Average cycle length', 28, { suf: 'days', min: 21, max: 45, step: 1 })
  ],
  compute: function (v, H) {
    var lmp = H.parseDate(v.lmp); if (!lmp) return { err: 'Choose the first day of your last period.' };
    var adj = H.addDays(lmp, v.cycle - 28), due = H.addDays(adj, 280), td = H.today(), d = H.daysBetween(adj, td), wk = Math.floor(d / 7);
    var tri = d < 0 ? '' : wk < 13 ? 'First trimester' : wk < 27 ? 'Second trimester' : 'Third trimester';
    var res = [{ l: 'Estimated due date', v: H.date(due), big: 1 }];
    if (d >= 0 && d <= 300) res.push({ l: 'Today you are', v: wk + ' weeks, ' + (d % 7) + ' days', big: 1 }, { l: 'Trimester', v: tri }, { l: 'Days to go', v: H.num(Math.max(H.daysBetween(td, due), 0), 0) });
    res.push({ l: 'Estimated conception', v: H.dateShort(H.addDays(adj, 14)) });
    var ms = [['End of first trimester', 13], ['Anatomy scan (about)', 20], ['Third trimester begins', 27], ['Full term begins', 37], ['Due date', 40]];
    return { res: res, table: { title: 'Pregnancy milestones', head: ['Milestone', 'Week', 'Date'], rows: ms.map(function (m) { return [m[0], m[1], H.dateShort(H.addDays(adj, m[1] * 7))]; }) },
      note: 'Only about 4% of babies arrive on their due date. A first ultrasound can refine the estimate.' };
  },
  about: '<p>Doctors estimate a due date by counting 40 weeks (280 days) from the first day of your last menstrual period, known as Naegele\'s rule. If your cycle is longer or shorter than 28 days, the date shifts to match when you likely ovulated, which this calculator accounts for.</p><p>Your due date is an estimate. Most babies are born between 37 and 42 weeks.</p>',
  formula: 'Due date = first day of last period + 280 days + (cycle length − 28 days).',
  faqs: [
    ['How accurate is a due date?', 'Only about 4% of babies are born on the due date, but most arrive within two weeks either side. An early ultrasound can improve accuracy.'],
    ['How many weeks pregnant am I?', 'Pregnancy is counted from the first day of your last period, so you are considered 4 weeks pregnant around the time of a missed period.']
  ],
  related: ['ovulation-calculator', 'age-calculator', 'date-calculator'], disclaimer: DISCLAIMER
},
{
  slug: 'ovulation-calculator', cat: 'health', icon: '📅',
  title: 'Ovulation Calculator', h1: 'Ovulation & Fertile Window Calculator',
  desc: 'Predict your ovulation day and fertile window from your last period and cycle length. Plan the next three cycles.',
  fields: [
    { id: 'lmp', label: 'First day of last period', type: 'date', value: 'today-10' },
    n('cycle', 'Average cycle length', 28, { suf: 'days', min: 21, max: 45, step: 1 }),
    n('luteal', 'Luteal phase length', 14, { suf: 'days', min: 10, max: 16, step: 1, hint: 'Most people have 12–14 days.' })
  ],
  compute: function (v, H) {
    var lmp = H.parseDate(v.lmp); if (!lmp) return { err: 'Choose the first day of your last period.' };
    var rows = [], i; for (i = 0; i < 3; i++) {
      var s = H.addDays(lmp, i * v.cycle), ov = H.addDays(s, v.cycle - v.luteal);
      rows.push([H.dateShort(s), H.dateShort(H.addDays(ov, -5)) + ' – ' + H.dateShort(H.addDays(ov, 1)), H.dateShort(ov), H.dateShort(H.addDays(s, v.cycle))]);
    }
    var ov0 = H.addDays(lmp, v.cycle - v.luteal);
    return { res: [{ l: 'Estimated ovulation day', v: H.date(ov0), big: 1 }, { l: 'Fertile window', v: H.dateShort(H.addDays(ov0, -5)) + ' – ' + H.dateShort(H.addDays(ov0, 1)), big: 1 }, { l: 'Next period expected', v: H.date(H.addDays(lmp, v.cycle)) }],
      table: { title: 'Next three cycles', head: ['Cycle starts', 'Fertile window', 'Ovulation', 'Next period'], rows: rows },
      note: 'This is a prediction, not birth control. Cycles vary, so ovulation tests or tracking can help.' };
  },
  about: '<p>Ovulation usually happens about 14 days before your next period starts. The fertile window is the six days ending on ovulation day, because sperm can live up to five days and the egg survives about 24 hours.</p><p>If your cycles are irregular, this estimate is less reliable. Tracking basal body temperature, cervical mucus or using ovulation tests gives a better signal.</p>',
  formula: 'Ovulation day = cycle start + (cycle length − luteal phase). Fertile window = 5 days before ovulation through 1 day after.',
  faqs: [
    ['When am I most fertile?', 'The two days before and the day of ovulation have the highest chance of conception.'],
    ['Can I rely on this to avoid pregnancy?', 'No. Calendar predictions are not a reliable form of birth control, especially with irregular cycles.']
  ],
  related: ['due-date-calculator', 'date-calculator', 'age-calculator'], disclaimer: DISCLAIMER
},
{
  slug: 'one-rep-max-calculator', cat: 'health', icon: '🏋️',
  title: 'One Rep Max Calculator', h1: 'One Rep Max (1RM) Calculator',
  desc: 'Estimate your one-rep max for bench press, squat or deadlift from any weight and rep count. Includes a training percentage chart.',
  fields: [
    n('w', 'Weight lifted', 185, { min: 1, step: 5 }),
    n('r', 'Reps completed', 5, { min: 1, max: 30, step: 1, hint: 'Estimates are most accurate for 10 reps or fewer.' }),
    sel('u', 'Unit', 'lb', [['lb', 'lb'], ['kg', 'kg']])
  ],
  compute: function (v, H) {
    var w = v.w, r = Math.round(v.r), ep = w * (1 + r / 30), br = r < 37 ? w * 36 / (37 - r) : NaN, la = w * 100 / (101.3 - 2.67123 * r);
    if (r === 1) ep = br = la = w;
    var avg = (ep + br + la) / 3, f = function (x) { return H.num(x, 1) + ' ' + v.u; };
    return { res: [{ l: 'Estimated 1RM (average)', v: f(avg), big: 1 }, { l: 'Epley', v: f(ep) }, { l: 'Brzycki', v: f(br) }, { l: 'Lander', v: f(la) }],
      table: { title: 'Training weights by % of 1RM', head: ['% of 1RM', 'Weight', 'Typical reps'], rows: [[100, 1], [95, 2], [90, 4], [85, 6], [80, 8], [75, 10], [70, 12], [65, 15], [60, 20], [50, 30]].map(function (p) { return [p[0] + '%', H.num(avg * p[0] / 100, 1) + ' ' + v.u, p[1]]; }) } };
  },
  about: '<p>Your one-rep max (1RM) is the most weight you can lift once with good form. Testing it directly is tiring and risky, so these formulas estimate it from a lighter set taken close to failure.</p><p>Use the percentage chart to plan working sets. Most strength programs use 70% to 85% of 1RM for sets of 3 to 10 reps.</p>',
  formula: 'Epley: 1RM = w × (1 + reps ÷ 30). Brzycki: 1RM = w × 36 ÷ (37 − reps). Lander: 1RM = 100 × w ÷ (101.3 − 2.67123 × reps).',
  faqs: [
    ['Which 1RM formula is the most accurate?', 'No formula is perfect. For low reps (2 to 6) they agree closely; for higher reps, estimates diverge, so the average is a reasonable choice.'],
    ['Is it safe to test a true 1RM?', 'It carries more injury risk than lighter sets. Use a spotter or safeties, warm up well, or rely on the estimate instead.']
  ],
  related: ['calorie-calculator', 'macro-calculator', 'bmi-calculator'], disclaimer: DISCLAIMER
}
];
