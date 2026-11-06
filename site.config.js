/* Edit these before you deploy. SITE_URL can also be set as an environment variable. */
module.exports = {
  name: 'CalcHaven',
  tagline: 'Free online calculators for money, health, school and everyday life',
  url: process.env.SITE_URL || 'https://www.example.com',   // no trailing slash
  contactEmail: 'contact@online-calculator.live',
  // Paste your analytics / AdSense <script> tag here; it is added to every page's <head>.
  headScripts: '<meta name="google-site-verification" content="kLUQITp8T_PWLmDvQmsMRJQwiXZnIfol1EyBuFXNJMo" />'
};
