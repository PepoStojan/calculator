/* Hand-built interactive pages (no form engine). */
module.exports = [
{
  slug: 'calculator', cat: 'math', icon: '🧮', custom: 'retro', popular: 1,
  title: 'Online Calculator', h1: 'Free Online Calculator with a Retro 1970s Look',
  desc: 'A free online calculator for quick sums, with a glowing green display and chunky keys inspired by 1970s desktop calculators. Works with mouse, touch and keyboard.',
  about: '<p>This basic calculator handles the everyday jobs: adding, subtracting, multiplying, dividing, percentages and sign changes. It works left to right like the electronic desk calculators of the 1970s, and its green vacuum-fluorescent style display shows up to eight digits.</p><p>Use your keyboard for speed: number keys, <kbd>+ − * /</kbd>, <kbd>Enter</kbd> for equals, <kbd>Backspace</kbd> to clear the entry and <kbd>Esc</kbd> to clear everything. Need functions such as sine, logarithms or exponents? Try the <a data-link="scientific-calculator">scientific calculator</a>.</p>',
  formula: 'Operations run left to right in the order you press them: 2 + 3 × 4 = 20 on this calculator, just like a basic desktop model. Use the scientific calculator for standard order of operations.',
  faqs: [['Why does 2 + 3 × 4 equal 20 here?', 'Basic calculators evaluate each operation as you press it, so 2 + 3 = 5 and then 5 × 4 = 20. The scientific calculator follows the standard order of operations and gives 14.'], ['What happens with an error?', 'An E on the display means divide by zero or a number longer than eight digits. Press C to reset.'], ['Does it round decimals?', 'Results are rounded to fit eight digits and to remove floating-point noise, so 0.1 + 0.2 shows 0.3.']],
  related: ['scientific-calculator', 'percentage-calculator', 'fraction-calculator', 'tip-calculator']
},
{
  slug: 'scientific-calculator', cat: 'math', icon: '🔬', custom: 'scientific', popular: 1,
  title: 'Scientific Calculator', h1: 'Scientific Calculator Online',
  desc: 'Free online scientific calculator with trig functions, logarithms, powers, roots, factorials, parentheses and degree or radian mode.',
  about: '<p>This scientific calculator follows the standard order of operations (parentheses, exponents, multiplication and division, then addition and subtraction). Type an expression or tap the keys, and the result updates as you go. Press <kbd>Enter</kbd> or <kbd>=</kbd> to store it and use <strong>ANS</strong> to reuse the last answer.</p><p>Switch between degrees and radians with the Deg/Rad key. Supported functions include sin, cos, tan and their inverses, ln, log (base 10), square root, absolute value, factorial, percent and the constants π and e.</p>',
  formula: 'Order of operations: parentheses → exponents and functions → multiplication and division → addition and subtraction. Example: 2 + 3 × 4 = 14 and −2² = −4.',
  faqs: [['How do I switch between degrees and radians?', 'Tap the Deg/Rad key. In degree mode sin(30) = 0.5; in radian mode use sin(pi/6).'], ['How do I calculate a root or power?', 'Use the √ key for square roots and the xʸ key for powers. For a cube root, type x^(1/3), for example 27^(1/3).'], ['Can I type instead of tapping?', 'Yes. Click the display and type expressions such as 2*(3+4)^2 or sin(45), then press Enter.']],
  related: ['calculator', 'percentage-calculator', 'fraction-calculator', 'average-calculator']
}
];
