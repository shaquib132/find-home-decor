// Demo Mode data. These are SAMPLE buyers, not real businesses. They use the reserved ".example"
// top-level domain (RFC 2606) so nothing here can ever point at a real company or inbox.
const lead = (contact, company, domain, location, category, description) => ({
  contact,
  company,
  category,
  email: `${contact.split(' ')[0].toLowerCase()}@${domain}.example`,
  website: `https://www.${domain}.example`,
  location,
  description
});

export const demoLeads = [
  lead('Sarah Mitchell', 'Urban Nest Interiors', 'urbannestinteriors', 'Austin, TX', 'Interior Design', 'Boutique studio focused on modern residential spaces.'),
  lead('James Carter', 'Coastal Living Decor', 'coastallivingdecor', 'Miami, FL', 'Home Decor Store', 'Independent coastal-style decor and furnishings retailer.'),
  lead('Emily Zhang', 'Modern Home Studio', 'modernhomestudio', 'San Francisco, CA', 'Interior Design', 'Design-led studio sourcing premium home accessories.'),
  lead('Marcus Johnson', 'Southern Charm Home', 'southerncharmhome', 'Nashville, TN', 'Home Decor Boutique', 'Curated boutique with a warm, traditional collection.'),
  lead('Olivia Reyes', 'The Design Collective', 'thedesigncollective', 'New York, NY', 'Interior Design', 'Residential design collective and sourcing partner.'),
  lead('Daniel Park', 'Pacific Home Gallery', 'pacifichomegallery', 'Seattle, WA', 'Furniture & Decor', 'Independent showroom for premium residential interiors.'),
  lead('Rachel Torres', 'Bloom & Nest Boutique', 'bloomandnest', 'Denver, CO', 'Home Decor Boutique', 'Small shop for gifts, textiles and decorative accessories.'),
  lead('Kevin Brown', 'Heartland Home Decor', 'heartlandhome', 'Chicago, IL', 'Home Decor Store', 'Retailer specializing in warm, contemporary interiors.'),
  lead('Amanda Patel', 'Luxe Living Interiors', 'luxelivinginteriors', 'Scottsdale, AZ', 'Interior Design', 'Luxury residential and hospitality design practice.'),
  lead('Thomas Williams', 'New England Home Works', 'nehomeworks', 'Boston, MA', 'Furniture & Decor', 'Design-forward shop for furniture and decorative accessories.'),
  lead('Priya Nair', 'Brooklyn Loft Studio', 'brooklynloftstudio', 'Brooklyn, NY', 'Interior Design', 'Loft and apartment design studio.'),
  lead('Carlos Mendez', 'Lone Star Furnishings', 'lonestarfurnishings', 'Houston, TX', 'Furniture Store', 'Large-format furniture and decor showroom.'),
  lead('Hannah Lee', 'Golden Coast Interiors', 'goldencoastinteriors', 'Los Angeles, CA', 'Interior Design', 'Boutique design firm for modern coastal homes.'),
  lead('Ryan O\'Connor', 'Sunshine Home Co.', 'sunshinehomeco', 'Orlando, FL', 'Home Decor Store', 'Family-run home decor and gifts retailer.'),
  lead('Megan Foster', 'Great Lakes Living', 'greatlakesliving', 'Detroit, MI', 'Home Decor Boutique', 'Midwest boutique with a rustic-modern edit.'),
  lead('Nathan Brooks', 'Gulf Breeze Decor', 'gulfbreezedecor', 'Tampa, FL', 'Home Decor Store', 'Coastal decor retailer with two locations.')
];

const STATES = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
  connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA',
  maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN',
  mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR',
  pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA',
  'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY'
};
const MIDWEST = new Set(['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI']);
const STOP = new Set(['the', 'and', 'for', 'near', 'best', 'top', 'in', 'of']);

// Ranks the demo set against the query (state / region first, then keywords) and returns up to `limit`.
export function searchDemo(query, limit = 10) {
  const q = query.toLowerCase();
  const wantedStates = new Set(
    Object.entries(STATES).filter(([name]) => new RegExp(`\\b${name}\\b`).test(q)).map(([, abbr]) => abbr)
  );
  const wantsMidwest = /\bmidwest\b/.test(q);
  const words = q.split(/[^a-z0-9&]+/).filter((w) => w.length > 2 && !STOP.has(w));

  return demoLeads
    .map((l, index) => {
      const state = l.location.split(', ')[1];
      let score = 0;
      if (wantedStates.has(state)) score += 10;
      if (wantsMidwest && MIDWEST.has(state)) score += 10;
      const haystack = `${l.company} ${l.category} ${l.description} ${l.location}`.toLowerCase();
      for (const w of words) if (haystack.includes(w)) score += 1;
      return { l, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((x) => ({ ...x.l }));
}
