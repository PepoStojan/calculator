/* Finance & loans. compute(v, H) runs in the browser, so it may only use v and H. */
var n = function (id, label, value, o) { return Object.assign({ id: id, label: label, type: 'number', value: value }, o || {}); };
var sel = function (id, label, value, opts, o) { return Object.assign({ id: id, label: label, type: 'select', value: value, opts: opts }, o || {}); };

module.exports = [
{
  slug: 'mortgage-calculator', cat: 'finance', icon: '🏠',
  title: 'Mortgage Calculator', h1: 'Mortgage Calculator with Taxes, Insurance & Extra Payments',
  desc: 'Estimate your monthly mortgage payment with property tax, insurance and HOA. See total interest, payoff with extra payments and a yearly amortization table.',
  fields: [
    n('price', 'Home price', 400000, { pre: '$', min: 1, step: 1000 }),
    n('down', 'Down payment', 80000, { pre: '$', min: 0, step: 1000 }),
    sel('term', 'Loan term', '30', [['30', '30 years'], ['25', '25 years'], ['20', '20 years'], ['15', '15 years'], ['10', '10 years']]),
    n('rate', 'Interest rate', 6.5, { suf: '%', min: 0, max: 30, step: 0.05 }),
    n('tax', 'Property tax (per year)', 1.1, { suf: '% of price', min: 0, max: 10, step: 0.05, hint: 'Check your county rate; the U.S. average is roughly 1%.' }),
    n('ins', 'Home insurance (per year)', 1500, { pre: '$', min: 0, step: 50 }),
    n('hoa', 'HOA fees (per month)', 0, { pre: '$', min: 0, optional: 1 }),
    n('extra', 'Extra payment (per month)', 0, { pre: '$', min: 0, optional: 1, hint: 'Paid straight toward principal.' })
  ],
  compute: function (v, H) {
    if (v.down > v.price) return { err: 'The down payment cannot be larger than the home price.' };
    var loan = v.price - v.down, nn = +v.term * 12, r = v.rate / 1200, pi = H.pmt(loan, r, nn);
    var tax = v.price * v.tax / 1200, ins = v.ins / 12, mon = pi + tax + ins + v.hoa;
    var base = H.amort(loan, r, pi, 0), ex = H.amort(loan, r, pi, v.extra);
    var res = [{ l: 'Estimated monthly payment', v: H.money(mon), big: 1 }, { l: 'Principal & interest', v: H.money(pi) },
      { l: 'Property tax', v: H.money(tax) }, { l: 'Home insurance', v: H.money(ins) }];
    if (v.hoa > 0) res.push({ l: 'HOA fees', v: H.money(v.hoa) });
    res.push({ l: 'Loan amount', v: H.money(loan, 0) }, { l: 'Down payment', v: H.pct(v.down / v.price * 100, 1) },
      { l: 'Total interest', v: H.money(ex.interest, 0) }, { l: 'Total principal + interest', v: H.money(loan + ex.interest, 0) });
    if (v.extra > 0) res.push({ l: 'Paid off in', v: H.dur(ex.months) }, { l: 'Interest saved by paying extra', v: H.money(base.interest - ex.interest, 0) });
    return { res: res, table: { title: 'Amortization schedule by year', head: ['Year', 'Principal paid', 'Interest paid', 'Ending balance'],
      rows: ex.rows.map(function (x) { return [x.y, H.money(x.p, 0), H.money(x.i, 0), H.money(x.bal, 0)]; }) } };
  },
  about: '<p>Your monthly mortgage payment is more than the loan repayment. Lenders usually collect property tax and homeowners insurance in escrow, so this calculator adds them to principal and interest (often called PITI) to show what you will actually pay each month.</p><p>Try the extra payment box to see how much interest and time you save. Even $100 a month toward principal can remove years from a 30-year loan.</p>',
  formula: 'Monthly P&I = L × r ÷ (1 − (1 + r)^−n), where L is the loan amount, r is the monthly rate (annual rate ÷ 12) and n is the number of monthly payments.',
  faqs: [
    ['How much house can I afford?', 'A common guideline is to keep total housing costs below about 28% of gross monthly income and all debts below about 36%. Lenders look at your credit, debts and savings as well.'],
    ['Does this include PMI?', 'No. If your down payment is under 20% you will usually also pay private mortgage insurance, typically 0.3% to 1.5% of the loan per year. Add it to the insurance field for a closer estimate.'],
    ['Is a 15-year or 30-year mortgage better?', 'A 15-year loan has a higher payment but a lower rate and far less total interest. A 30-year loan gives a lower payment and more flexibility. Compare both by changing the term above.']
  ],
  related: ['loan-calculator', 'auto-loan-calculator', 'compound-interest-calculator', 'retirement-calculator']
},
{
  slug: 'loan-calculator', cat: 'finance', icon: '💳',
  title: 'Loan Calculator', h1: 'Loan Payment Calculator',
  desc: 'Calculate the monthly payment, total interest and payoff time for any fixed-rate loan. Add extra payments to see how much you save.',
  fields: [
    n('amount', 'Loan amount', 25000, { pre: '$', min: 1, step: 500 }),
    n('rate', 'Interest rate (APR)', 7, { suf: '%', min: 0, max: 60, step: 0.1 }),
    n('term', 'Loan term', 5, { min: 1, step: 1 }),
    sel('unit', 'Term unit', 'years', [['years', 'Years'], ['months', 'Months']]),
    n('extra', 'Extra payment (per month)', 0, { pre: '$', min: 0, optional: 1 })
  ],
  compute: function (v, H) {
    var nn = v.unit === 'years' ? Math.round(v.term * 12) : Math.round(v.term), r = v.rate / 1200, pay = H.pmt(v.amount, r, nn);
    var base = H.amort(v.amount, r, pay, 0), ex = H.amort(v.amount, r, pay, v.extra);
    var res = [{ l: 'Monthly payment', v: H.money(pay), big: 1 }, { l: 'Total interest', v: H.money(ex.interest) },
      { l: 'Total paid', v: H.money(v.amount + ex.interest) }, { l: 'Number of payments', v: H.num(ex.months, 0) }];
    if (v.extra > 0) res.push({ l: 'Interest saved', v: H.money(base.interest - ex.interest) }, { l: 'Paid off in', v: H.dur(ex.months) });
    return { res: res, table: { title: 'Payoff schedule by year', head: ['Year', 'Principal paid', 'Interest paid', 'Ending balance'],
      rows: ex.rows.map(function (x) { return [x.y, H.money(x.p, 0), H.money(x.i, 0), H.money(x.bal, 0)]; }) } };
  },
  about: '<p>This calculator works for any installment loan with a fixed rate: personal loans, student loans, debt consolidation, boat or RV loans. Enter the amount, the annual percentage rate and the length of the loan to see the payment.</p><p>Compare different terms. A longer term lowers the payment but raises the total interest you pay.</p>',
  formula: 'Payment = P × r ÷ (1 − (1 + r)^−n), with P the amount borrowed, r the monthly rate (APR ÷ 12) and n the number of payments.',
  faqs: [
    ['What is the difference between interest rate and APR?', 'APR includes the interest rate plus certain lender fees, so it reflects the true yearly cost of borrowing. Use the APR here when you know it.'],
    ['Can I pay a loan off early?', 'Usually yes. Enter an extra monthly payment to see the impact. Check that your loan has no prepayment penalty first.'],
    ['Does a lower payment mean a cheaper loan?', 'Not necessarily. Stretching the term lowers the payment but increases total interest, so compare the Total interest line across terms.']
  ],
  related: ['mortgage-calculator', 'auto-loan-calculator', 'compound-interest-calculator'],
  variants: [{
    slug: 'personal-loan-calculator', title: 'Personal Loan Calculator', h1: 'Personal Loan Calculator',
    desc: 'Estimate your personal loan payment, total interest and payoff date. Compare terms and rates before you borrow.',
    intro: 'See what a personal loan will really cost. Enter the amount, APR and term to compare monthly payments and total interest.',
    set: { amount: 15000, rate: 11, term: 3 },
    faqs: [['What credit score do I need for a personal loan?', 'Many lenders approve scores in the mid-600s, while the best rates usually go to scores above 720. Rates vary widely, so compare offers using this calculator.']]
  }]
},
{
  slug: 'auto-loan-calculator', cat: 'finance', icon: '🚗',
  title: 'Auto Loan Calculator', h1: 'Auto Loan & Car Payment Calculator',
  desc: 'Estimate your monthly car payment with trade-in, down payment, sales tax and fees. See total interest and the full cost of the loan.',
  fields: [
    n('price', 'Vehicle price', 35000, { pre: '$', min: 1, step: 500 }),
    n('down', 'Down payment', 5000, { pre: '$', min: 0, step: 500 }),
    n('trade', 'Trade-in value', 0, { pre: '$', min: 0, optional: 1 }),
    n('taxr', 'Sales tax', 6, { suf: '%', min: 0, max: 15, step: 0.1, hint: 'Many states tax the price minus your trade-in.' }),
    n('fees', 'Title, registration & fees', 0, { pre: '$', min: 0, optional: 1 }),
    n('rate', 'Interest rate (APR)', 6.5, { suf: '%', min: 0, max: 40, step: 0.1 }),
    sel('term', 'Loan term', '60', [['24', '24 months'], ['36', '36 months'], ['48', '48 months'], ['60', '60 months'], ['72', '72 months'], ['84', '84 months']])
  ],
  compute: function (v, H) {
    var tax = Math.max(v.price - v.trade, 0) * v.taxr / 100, loan = v.price + tax + v.fees - v.down - v.trade;
    if (loan <= 0) return { err: 'Your down payment and trade-in cover the full cost, so there is nothing to finance.' };
    var nn = +v.term, r = v.rate / 1200, pay = H.pmt(loan, r, nn), a = H.amort(loan, r, pay, 0);
    return { res: [{ l: 'Monthly payment', v: H.money(pay), big: 1 }, { l: 'Amount financed', v: H.money(loan, 0) }, { l: 'Sales tax', v: H.money(tax, 0) },
      { l: 'Total interest', v: H.money(a.interest, 0) }, { l: 'Total of payments', v: H.money(pay * nn, 0) },
      { l: 'Total cost incl. down payment & trade-in', v: H.money(pay * nn + v.down + v.trade, 0) }],
      table: { title: 'Loan balance by year', head: ['Year', 'Principal paid', 'Interest paid', 'Ending balance'],
        rows: a.rows.map(function (x) { return [x.y, H.money(x.p, 0), H.money(x.i, 0), H.money(x.bal, 0)]; }) } };
  },
  about: '<p>Dealers often quote only the monthly payment. This auto loan calculator shows the whole picture: sales tax, fees, how much you borrow after your down payment and trade-in, and the total interest over the loan.</p><p>Shorter terms such as 48 or 60 months cost far less in interest than 72 or 84 months, and they reduce the risk of owing more than the car is worth.</p>',
  formula: 'Amount financed = price + sales tax + fees − down payment − trade-in. Monthly payment = L × r ÷ (1 − (1 + r)^−n), with r = APR ÷ 12.',
  faqs: [
    ['What is a good interest rate for a car loan?', 'Rates depend on credit score, loan term and whether the car is new or used. Credit unions and banks often beat dealer financing, so get a pre-approval to compare.'],
    ['How much should I put down on a car?', 'A common target is 20% for a new car and 10% for a used car. A larger down payment lowers your payment and protects you from negative equity.'],
    ['Is sales tax charged on the trade-in?', 'It depends on your state. Many states only tax the difference between the price and your trade-in. Check local rules and adjust the sales tax rate if needed.']
  ],
  related: ['loan-calculator', 'mortgage-calculator', 'compound-interest-calculator'],
  variants: [
    { slug: 'car-payment-calculator', title: 'Car Payment Calculator', h1: 'Car Payment Calculator',
      desc: 'Find your monthly car payment in seconds. Includes down payment, trade-in, sales tax and fees, with total interest and loan cost.',
      intro: 'Enter the price, down payment, trade-in and rate to see your monthly car payment and the total cost of financing.', set: {},
      faqs: [['How is a car payment calculated?', 'The payment spreads the amount you finance plus interest evenly over the loan term. Higher rates, longer terms and bigger loan amounts all raise the total interest.']] },
    { slug: 'car-loan-calculator', title: 'Car Loan Calculator', h1: 'Car Loan Calculator',
      desc: 'Compare car loan terms and rates. See your payment, amount financed, total interest and a year-by-year balance.',
      intro: 'Compare car loans side by side by changing the rate and term. The calculator shows payment, interest and total cost.', set: { price: 28000, down: 4000, rate: 7.2, term: '60' }, faqs: [] }
  ]
},
{
  slug: 'compound-interest-calculator', cat: 'finance', icon: '📈',
  title: 'Compound Interest Calculator', h1: 'Compound Interest Calculator',
  desc: 'See how your savings or investments grow with compound interest and monthly contributions. Free calculator with a year-by-year growth table.',
  fields: [
    n('p', 'Starting balance', 10000, { pre: '$', min: 0, step: 500 }),
    n('add', 'Monthly contribution', 200, { pre: '$', min: 0, optional: 1, step: 25 }),
    n('rate', 'Annual return', 7, { suf: '%', min: 0, max: 100, step: 0.1 }),
    n('years', 'Years to grow', 20, { min: 1, max: 80, step: 1 }),
    sel('freq', 'Compounding', '12', [['365', 'Daily'], ['12', 'Monthly'], ['4', 'Quarterly'], ['1', 'Yearly']])
  ],
  compute: function (v, H) {
    var m = +v.freq, rm = Math.pow(1 + v.rate / 100 / m, m / 12) - 1, bal = v.p, put = v.p, rows = [], months = Math.round(v.years * 12);
    for (var k = 1; k <= months; k++) {
      bal = bal * (1 + rm) + v.add; put += v.add;
      if (k % 12 === 0 || k === months) rows.push([Math.ceil(k / 12), H.money(put, 0), H.money(bal - put, 0), H.money(bal, 0)]);
    }
    var ear = (Math.pow(1 + v.rate / 100 / m, m) - 1) * 100;
    return { res: [{ l: 'Future value', v: H.money(bal), big: 1 }, { l: 'Total contributions', v: H.money(put) }, { l: 'Interest earned', v: H.money(bal - put) },
      { l: 'Growth multiple', v: H.num(put ? bal / put : 0, 2) + '×' }, { l: 'Effective annual yield', v: H.pct(ear, 3) }],
      table: { title: 'Growth by year', head: ['Year', 'Total contributed', 'Interest earned', 'Balance'], rows: rows } };
  },
  about: '<p>Compound interest means you earn interest on your interest. Each period the balance grows, so the next period starts from a larger base. Over long periods this snowball effect does most of the work, which is why starting early matters more than contributing a lot.</p><p>Use the monthly contribution field to see how regular deposits change the outcome, and compare monthly with daily compounding.</p>',
  formula: 'Balance after each month = previous balance × (1 + monthly rate) + contribution. Monthly rate = (1 + annual rate ÷ m)^(m ÷ 12) − 1, where m is the compounding periods per year.',
  faqs: [
    ['What is the rule of 72?', 'Divide 72 by your annual return to estimate how many years it takes to double your money. At 8% it takes about 9 years.'],
    ['Does compounding frequency matter much?', 'Only a little. Daily compounding at 5% yields about 5.13% a year versus 5.12% monthly. Return rate and time matter far more.'],
    ['Are the results guaranteed?', 'No. Stock returns vary every year and are not guaranteed. Savings accounts and CDs pay a stated rate, but it can change. Treat the output as an illustration, not a forecast.']
  ],
  related: ['retirement-calculator', 'loan-calculator', 'mortgage-calculator'],
  variants: [
    { slug: 'investment-calculator', title: 'Investment Calculator', h1: 'Investment Calculator',
      desc: 'Project the future value of your investments with regular contributions and an expected annual return. Includes a yearly growth table.',
      intro: 'Estimate what your investments could be worth. Enter your starting amount, monthly contribution, expected return and time horizon.',
      set: { p: 5000, add: 500, rate: 7, years: 25 }, faqs: [['What return should I assume?', 'Broad U.S. stock indexes have averaged roughly 7% to 10% a year before inflation over long periods, but individual years vary a lot. Use a conservative number when planning.']] },
    { slug: 'savings-calculator', title: 'Savings Calculator', h1: 'Savings Calculator',
      desc: 'See how fast your savings grow with interest and monthly deposits. Free savings goal calculator with year-by-year totals.',
      intro: 'Find out how much your savings account could hold. Enter your balance, monthly deposit and interest rate.',
      set: { p: 2000, add: 300, rate: 4.5, years: 5 }, faqs: [['What is a high-yield savings account?', 'It is an online savings account that pays a much higher interest rate than a traditional bank account. Rates change with the market, so compare current offers.']] }
  ]
},
{
  slug: 'retirement-calculator', cat: 'finance', icon: '🌴',
  title: 'Retirement Calculator', h1: 'Retirement Savings Calculator',
  desc: 'Find out if you are on track to retire. Project your savings at retirement in today\'s dollars and the monthly income they can support.',
  fields: [
    n('age', 'Current age', 35, { min: 16, max: 90, step: 1 }),
    n('ret', 'Retirement age', 65, { min: 30, max: 100, step: 1 }),
    n('life', 'Plan to age', 92, { min: 50, max: 110, step: 1, hint: 'How long your money needs to last.' }),
    n('bal', 'Current savings', 60000, { pre: '$', min: 0, step: 1000 }),
    n('add', 'Monthly contribution', 800, { pre: '$', min: 0, optional: 1, step: 50 }),
    n('rate', 'Expected annual return', 6.5, { suf: '%', min: 0, max: 20, step: 0.1 }),
    n('inf', 'Inflation', 2.5, { suf: '%', min: 0, max: 15, step: 0.1 }),
    n('need', 'Income needed (today\'s dollars / month)', 4500, { pre: '$', min: 0, step: 100 }),
    n('other', 'Social Security & pensions (today\'s $ / month)', 1800, { pre: '$', min: 0, optional: 1, step: 100 })
  ],
  compute: function (v, H) {
    if (v.ret <= v.age) return { err: 'Retirement age must be greater than your current age.' };
    if (v.life <= v.ret) return { err: '"Plan to age" must be greater than your retirement age.' };
    var rr = (1 + v.rate / 100) / (1 + v.inf / 100) - 1, rm = Math.pow(1 + rr, 1 / 12) - 1, pre = Math.round((v.ret - v.age) * 12), post = Math.round((v.life - v.ret) * 12);
    var g = Math.pow(1 + rm, pre), fv = v.bal * g + v.add * (rm ? (g - 1) / rm : pre);
    var af = rm ? (1 - Math.pow(1 + rm, -post)) / rm : post, income = fv / af, gap = v.need - v.other, target = Math.max(gap, 0) * af, rule4 = fv * 0.04 / 12;
    var ok = income + v.other >= v.need;
    return { res: [{ l: 'Savings at retirement (today\'s dollars)', v: H.money(fv, 0), big: 1 },
      { l: 'Same amount in future dollars', v: H.money(fv * Math.pow(1 + v.inf / 100, v.ret - v.age), 0) },
      { l: 'Monthly income from savings to age ' + v.life, v: H.money(income, 0) }, { l: 'Income using the 4% rule', v: H.money(rule4, 0) },
      { l: 'Total monthly income with other sources', v: H.money(income + v.other, 0) }, { l: 'Savings needed for your goal', v: H.money(target, 0) },
      { l: ok ? 'Surplus vs. goal (per month)' : 'Shortfall vs. goal (per month)', v: H.money(Math.abs(income + v.other - v.need), 0) }],
      note: ok ? 'You are on track: projected income meets your goal.' : 'Projected income is below your goal. Try saving more, retiring later or lowering the income target.' };
  },
  about: '<p>This calculator works in today\'s dollars so the numbers are easy to compare with what you spend now. It assumes your contributions rise with inflation and that your savings keep earning the same real return after you retire.</p><p>The "Savings needed" line shows the balance that would fund your income goal until your chosen age, after subtracting Social Security or pension income.</p>',
  formula: 'Real return = (1 + return) ÷ (1 + inflation) − 1. Income from savings = balance × r ÷ (1 − (1 + r)^−n) using monthly real return r over the retirement months n.',
  faqs: [
    ['What is the 4% rule?', 'It suggests withdrawing 4% of your portfolio in the first year of retirement, then adjusting for inflation, which has historically lasted about 30 years. It is a guideline, not a guarantee.'],
    ['How much do I need to retire?', 'Many planners suggest 25 times your annual spending net of Social Security and pensions. The goal line above calculates this for your own numbers.'],
    ['Does this include taxes?', 'No. Withdrawals from traditional 401(k) and IRA accounts are taxed as income, so plan for after-tax spending when you pick your income goal.']
  ],
  related: ['compound-interest-calculator', 'mortgage-calculator', 'salary-to-hourly-calculator']
},
{
  slug: 'salary-to-hourly-calculator', cat: 'finance', icon: '💵',
  title: 'Salary to Hourly Calculator', h1: 'Salary to Hourly Calculator',
  desc: 'Convert salary to hourly pay or hourly wage to annual salary. See daily, weekly, biweekly and monthly equivalents.',
  fields: [
    n('amount', 'Pay amount', 65000, { pre: '$', min: 0, step: 500 }),
    sel('per', 'Per', 'year', [['hour', 'Hour'], ['day', 'Day'], ['week', 'Week'], ['biweek', '2 weeks'], ['month', 'Month'], ['year', 'Year']]),
    n('hpw', 'Hours per week', 40, { min: 1, max: 120, step: 1 }),
    n('wpy', 'Paid weeks per year', 52, { min: 1, max: 52, step: 1, hint: 'Use 50 if you take two unpaid weeks.' })
  ],
  compute: function (v, H) {
    var f = { hour: v.hpw * v.wpy, day: 5 * v.wpy, week: v.wpy, biweek: v.wpy / 2, month: 12, year: 1 }, yr = v.amount * f[v.per], hr = yr / (v.hpw * v.wpy);
    return { res: [{ l: 'Hourly', v: H.money(hr), big: 1 }, { l: 'Annual', v: H.money(yr, 0), big: 1 }, { l: 'Daily (5 days)', v: H.money(yr / (5 * v.wpy)) },
      { l: 'Weekly', v: H.money(yr / v.wpy) }, { l: 'Every 2 weeks', v: H.money(yr / v.wpy * 2) }, { l: 'Twice a month', v: H.money(yr / 24) }, { l: 'Monthly', v: H.money(yr / 12) }],
      note: 'Gross pay before taxes and deductions.' };
  },
  about: '<p>Salary and hourly pay are two ways of expressing the same income. Dividing your annual salary by the number of hours you work gives your hourly rate, and multiplying an hourly wage by hours per week and weeks per year gives annual pay.</p><p>This calculator shows every common pay period at once, which is handy when comparing a salaried offer with an hourly one.</p>',
  formula: 'Hourly rate = annual salary ÷ (hours per week × paid weeks per year). Annual salary = hourly rate × hours per week × paid weeks per year.',
  faqs: [
    ['How do I convert a $60,000 salary to hourly?', '$60,000 ÷ 2,080 hours (40 hours × 52 weeks) is about $28.85 an hour.'],
    ['Why use 2,080 hours?', 'A full-time schedule of 40 hours a week for 52 weeks is 2,080 hours. Change the hours or weeks above if your schedule differs.'],
    ['Is this before or after tax?', 'Before. All figures are gross pay. Your take-home pay will be lower after taxes and benefits.']
  ],
  related: ['work-hours-calculator', 'retirement-calculator', 'percentage-calculator'],
  variants: [{
    slug: 'hourly-to-salary-calculator', title: 'Hourly to Salary Calculator', h1: 'Hourly to Salary Calculator',
    desc: 'Turn an hourly wage into an annual salary. See weekly, biweekly and monthly pay for any schedule.',
    intro: 'Enter your hourly wage and schedule to see your yearly salary and pay per period.',
    set: { amount: 28, per: 'hour' }, faqs: [['How do I turn an hourly wage into a yearly salary?', 'Multiply the hourly rate by hours per week and by 52. For example, $25 × 40 × 52 = $52,000 a year.']]
  }]
},
{
  slug: 'tip-calculator', cat: 'finance', icon: '🍽️',
  title: 'Tip Calculator', h1: 'Tip Calculator & Bill Splitter',
  desc: 'Work out the tip and split the bill between any number of people. Includes a quick table of 10% to 25% tips.',
  fields: [
    n('bill', 'Bill amount', 85, { pre: '$', min: 0, step: 1 }),
    n('tip', 'Tip', 18, { suf: '%', min: 0, max: 100, step: 1 }),
    n('people', 'Number of people', 2, { min: 1, max: 100, step: 1 })
  ],
  compute: function (v, H) {
    var t = v.bill * v.tip / 100, tot = v.bill + t, p = Math.max(Math.round(v.people), 1);
    return { res: [{ l: 'Tip amount', v: H.money(t), big: 1 }, { l: 'Total with tip', v: H.money(tot), big: 1 }, { l: 'Tip per person', v: H.money(t / p) }, { l: 'Total per person', v: H.money(tot / p) }],
      table: { title: 'Common tip amounts', head: ['Tip', 'Tip amount', 'Total', 'Per person'], rows: [10, 15, 18, 20, 25].map(function (x) { var tt = v.bill * x / 100; return [x + '%', H.money(tt), H.money(v.bill + tt), H.money((v.bill + tt) / p)]; }) } };
  },
  about: '<p>In U.S. restaurants a tip of 15% to 20% of the pre-tax bill is customary for table service, with 20% or more for excellent service. Enter the bill, choose a percentage and the calculator shows the tip, the total and each person\'s share.</p>',
  formula: 'Tip = bill × tip %. Total = bill + tip. Per person = total ÷ number of people.',
  faqs: [
    ['Should I tip on the pre-tax amount?', 'Most people tip on the pre-tax subtotal, though tipping on the total is fine too. Enter whichever amount you prefer in the bill field.'],
    ['How much should I tip for takeout or delivery?', 'For takeout, 10% or a few dollars is common if service was helpful. For delivery, 15% to 20% with a minimum of a few dollars is typical.']
  ],
  related: ['percentage-calculator', 'salary-to-hourly-calculator', 'calculator']
}
];
