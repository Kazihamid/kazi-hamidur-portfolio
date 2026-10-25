const strings = (keys) => Object.fromEntries(keys.split(' ').map(key => [key, 'string']));
const schema = {
  profile: strings('name title eyebrow heroTitle heroDescription summary location email phone image github linkedin cv'),
  highlights: [strings('label title detail')],
  skills: [{ group: 'string', items: ['string'] }],
  experience: [{ ...strings('role company start end summary'), focus: ['string'] }],
  projects: [{ ...strings('id title category description'), tools: ['string'], featured: 'boolean' }],
  leadership: { ...strings('title subtitle'), philosophy: [strings('title text')], process: ['string'], leadAreas: ['string'], mentoring: ['string'], principles: ['string'] },
  certifications: [strings('name issuer year')], education: [strings('degree school year')],
  navigation: [{ ...strings('label href'), visible: 'boolean' }],
  seo: strings('title description'), appearance: { ...strings('theme accent'), animations: 'boolean' },
  recommendations: [strings('id name headline relationship date text')],
};

function matches(value, spec) {
  if (typeof spec === 'string') return typeof value === spec;
  if (Array.isArray(spec)) return Array.isArray(value) && value.length <= 500 && value.every(item => matches(item, spec[0]));
  return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.entries(spec).every(([key, child]) => matches(value[key], child));
}

export function isPortfolio(value) {
  if (!matches(value, schema)) return false;
  if (!value.projects.every(p => ['startDate', 'endDate'].every(key => p[key] === undefined || typeof p[key] === 'string'))) return false;
  if (!value.recommendations.every(p => ['image', 'source'].every(key => p[key] === undefined || typeof p[key] === 'string'))) return false;
  // Prevent imported content from introducing executable link protocols.
  const safe = value => !/^\s*(?:javascript|vbscript):/i.test(value);
  return [value.profile.github, value.profile.linkedin, value.profile.cv, ...value.navigation.map(n => n.href)].every(safe);
}
