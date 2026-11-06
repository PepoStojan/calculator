/* Edit these before you deploy. SITE_URL can also be set as an environment variable. */
module.exports = {
  name: 'CalcHaven',
  tagline: 'Free online calculators for money, health, school and everyday life',
  url: process.env.SITE_URL || 'https://www.example.com',   // no trailing slash
  contactEmail: 'contact@online-calculator.live',
  // Paste your analytics / AdSense <script> tag here; it is added to every page's <head>.
  headScripts: '<meta name="google-site-verification" content="kLUQITp8T_PWLmDvQmsMRJQwiXZnIfol1EyBuFXNJMo" />',

  /* Monetization. Everything below is OFF while empty. Set via environment variables (e.g. in Cloudflare Pages), not in git. */
  adsClient: process.env.ADS_CLIENT || '',                  // ad publisher ID, e.g. "ca-pub-1234567890123456". Empty = no ad slots, no ad script
  adsTxt: process.env.ADS_TXT_LINES || '',                  // ads.txt lines, newline-separated. Empty = no ads.txt file
  analyticsToken: process.env.CF_ANALYTICS_TOKEN || ''      // Cloudflare Web Analytics token. Empty = no beacon
};
