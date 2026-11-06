/* Expands calculator definitions (and their keyword variants) into the flat list of pages. */
const defs = ['finance', 'health', 'math', 'life', 'custom'].flatMap(f => require('./calcs/' + f + '.js'));
const applySet = (fields, set) => fields.map(f => !(f.id in set) ? f : f.type === 'rows' ? Object.assign({}, f, { rows: set[f.id] }) : Object.assign({}, f, { value: set[f.id] }));
const pages = [];
for (const d of defs) {
  pages.push(Object.assign({}, d, { baseSlug: d.slug, lede: d.intro || d.desc, own: d.faqs || [] }));
  for (const v of d.variants || []) {
    pages.push(Object.assign({}, d, v, { fields: d.fields ? applySet(d.fields, v.set || {}) : undefined, baseSlug: d.slug, variant: true, lede: v.intro, own: v.faqs || [],
      faqs: (v.faqs || []).concat(d.faqs || []), related: [d.slug].concat(d.related || []), variants: undefined }));
  }
}
module.exports = { defs, pages };
