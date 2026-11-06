"""Ahrefs export -> keyword map for the build + prioritized backlog. Usage: python3 scripts/analyze.py <ahrefs.csv>"""
import sys, re, json, pandas as pd
src = sys.argv[1]
df = pd.read_csv(src, encoding='utf-16', sep='\t')
df['tp'] = df['Traffic potential'].fillna(df['Volume'])
by_kw = df.drop_duplicates('Keyword').set_index('Keyword')

# 1) metrics for pages the site already builds (primary query per slug)
PRIMARY = {
 'mortgage-calculator':'mortgage calculator','loan-calculator':'loan calculator','personal-loan-calculator':'personal loan calculator',
 'auto-loan-calculator':'auto loan calculator','car-payment-calculator':'car payment calculator','car-loan-calculator':'car loan calculator',
 'compound-interest-calculator':'compound interest calculator','investment-calculator':'investment calculator','savings-calculator':'savings calculator',
 'retirement-calculator':'retirement calculator','salary-to-hourly-calculator':'salary to hourly calculator','hourly-to-salary-calculator':'hourly to salary calculator',
 'tip-calculator':'tip calculator','bmi-calculator':'bmi calculator','calorie-calculator':'calorie calculator','tdee-calculator':'tdee calculator',
 'maintenance-calorie-calculator':'maintenance calorie calculator','calorie-deficit-calculator':'calorie deficit calculator','macro-calculator':'macro calculator',
 'due-date-calculator':'due date calculator','ovulation-calculator':'ovulation calculator','one-rep-max-calculator':'one rep max calculator',
 'grade-calculator':'grade calculator','weighted-grade-calculator':'weighted grade calculator','final-grade-calculator':'final grade calculator',
 'gpa-calculator':'gpa calculator','high-school-gpa-calculator':'high school gpa calculator','percentage-calculator':'percentage calculator',
 'percent-change-calculator':'percent change calculator','percentage-increase-calculator':'percentage increase calculator','fraction-calculator':'fraction calculator',
 'lcm-calculator':'lcm calculator','gcf-calculator':'gcf calculator','area-calculator':'area calculator','square-footage-calculator':'square footage calculator',
 'volume-calculator':'volume calculator','ratio-calculator':'ratio calculator','average-calculator':'average calculator',
 'standard-deviation-calculator':'standard deviation calculator','statistics-calculator':'statistics calculator','age-calculator':'age calculator',
 'date-difference-calculator':'days between dates calculator','day-counter':'day counter','date-calculator':'date calculator',
 'time-clock-calculator':'time clock calculator','work-hours-calculator':'work hours calculator','hours-calculator':'hour calculator',
 'concrete-calculator':'concrete calculator','sleep-calculator':'sleep calculator','scientific-calculator':'scientific calculator',
 'calculator':'calculator','online-calculator':'online calculator',
}
kmap = {}
for slug, q in PRIMARY.items():
    if q in by_kw.index:
        r = by_kw.loc[q]
        kmap[slug] = dict(q=q, vol=int(r.Volume), kd=None if pd.isna(r.Difficulty) else int(r.Difficulty), tp=int(r.tp), cpc=None if pd.isna(r.CPC) else float(r.CPC))
json.dump(kmap, open('src/data/keyword-map.json','w'), indent=1)

# 2) backlog of everything the site does not cover yet (one row per parent topic, brand/tool names removed)
BRAND = r'nerdwallet|adp|bankrate|desmos|casio|texas|google|apple|iphone|android|windows|samsung|zillow|bank of america|chase|wells|fidelity|vanguard|dave ramsey|smartasset|irs|sbi|hdfc|turbotax|walmart|costco|amazon|calculator soup|omni|calculator\.net|calculator\.com|ti ?-?8|ti84|geogebra|symbolab|wolfram|mathway|photomath|\.com|\.org|chipotle|usps|ups |fedex|va |bah|cvs'
CAT = [
 ('finance', r'loan|mortgage|interest|tax|paycheck|salary|invest|retire|401k|ira|saving|annuity|credit|debt|\bcd\b|apr|amortiz|rent|house|afford|equity|heloc|dividend|roi|margin|inflation|currency|social security|rmd|payment|refi|payoff|sip|lottery|gold|trade|profit|stock|options|financial|budget|net worth|commission'),
 ('health', r'bmi|calorie|tdee|bmr|macro|protein|pregnan|due date|ovulat|conception|period|body fat|weight|sleep|water|bac\b|rep max|bench|pace|creatine|ideal|height|bra size|crcl|gfr|fertil|ketone|pregnancy|blood'),
 ('math', r'grade|gpa|percent|fraction|ratio|lcm|gcf|factor|area|volume|slope|triangle|derivative|integral|algebra|statistic|deviation|average|mean|decimal|exponent|log|angle|circle|circumference|pythagorean|proportion|long division|scientific|graphing|matrix|quadratic|equation|limit|sum|probability|z score|p value|percentile|sat|score|test'),
 ('life', r'age|date|day|time|hour|tip|concrete|gravel|square|footage|gas|distance|shipping|tire|mulch|paint|flooring|tile|fence|roof|sod|cost of living|subnet|bottleneck|mile|speed|unit|conversion'),
]
def cat(t):
    for c, rx in CAT:
        if re.search(rx, t): return c
    return 'niche/other'
g = df.groupby('Parent Keyword').agg(cluster_volume=('Volume','sum'), keywords=('Keyword','count'), traffic_potential=('tp','max'),
                                     median_kd=('Difficulty','median'), max_cpc=('CPC','max')).reset_index()
g = g[~g['Parent Keyword'].str.contains(BRAND, na=False, regex=True)]
covered = ' | '.join(sorted({q.replace(' calculator','') for q in PRIMARY.values()}))
g['category'] = g['Parent Keyword'].map(cat)
g['median_kd'] = g.median_kd.fillna(0)
g['opportunity'] = (g.traffic_potential / (g.median_kd + 15)).round(0)
topics = {q.replace(' calculator','') for q in PRIMARY.values()} - {'calculator'}
g['covered'] = g['Parent Keyword'].map(lambda t: t.replace(' calculator','').strip() in topics)
g['is_tool'] = g['Parent Keyword'].str.contains(r'calc|converter|counter|estimat|trade|chart|clock|generator|solver', regex=True)
backlog = g[(~g.covered) & g.is_tool & (g.traffic_potential >= 5000)].sort_values('opportunity', ascending=False).head(500)
backlog.drop(columns=['covered','is_tool']).to_csv('data/backlog.csv', index=False)

summary = g.groupby('category').agg(topics=('Parent Keyword','count'), volume=('cluster_volume','sum'), median_kd=('median_kd','median')).round(0)
print(summary.to_string())
print('mapped', len(kmap), 'of', len(PRIMARY), '; backlog', len(backlog))
