/**
 * Context-Aware Event Image Selection System for Gatherly
 *
 * Automatically matches an appropriate, high-quality event image
 * based on event title, category, and description using specific keyword
 * and semantic pattern matching.
 *
 * Rules:
 * 1. An explicitly provided user image takes highest priority.
 * 2. Specific event keywords take precedence over generic categories
 *    (e.g., "Garba Night" matches Garba, not generic Cultural).
 * 3. Text normalization and case-insensitive matching with synonyms.
 * 4. Fallback to category-based image if no specific keyword matches.
 * 5. Fallback to universal campus image if no category matches.
 * 6. Never produces random images or broken links.
 */

export const FALLBACK_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';

export interface ImageMatchRule {
  id: string;
  name: string;
  keywords: string[];
  imageUrl: string;
  description: string;
}

export const EVENT_IMAGE_RULES: ImageMatchRule[] = [
  // 1. Garba / Dandiya (Specific Cultural Tradition)
  {
    id: 'garba',
    name: 'Garba / Dandiya Night',
    keywords: [
      'garba',
      'dandiya',
      'navratri',
      'raas',
      'dandia',
      'garba night',
      'dandiya night',
      'navratri celebration'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
    description: 'People dancing and celebrating Garba and Dandiya festival'
  },

  // 2. Hackathons / Coding Marathons
  {
    id: 'hackathon',
    name: 'Hackathon',
    keywords: [
      'hackathon',
      'hack',
      'codefest',
      'buildathon',
      'datathon',
      'appathon',
      'makeathon',
      'ideathon',
      'devpost',
      'hack night'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
    description: 'Students coding and collaborating on computers in a hackathon'
  },

  // 3. Singing / Music Competitions & Concerts
  {
    id: 'singing',
    name: 'Singing Competition & Concert',
    keywords: [
      'singing',
      'singer',
      'vocals',
      'vocal',
      'solo song',
      'battle of the bands',
      'karaoke',
      'music competition',
      'idol',
      'acoustic night',
      'choir',
      'acapella',
      'unplugged',
      'musical concert'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    description: 'Singer performing on stage with microphone and concert lighting'
  },

  // 4. Dance Competitions & Showcases
  {
    id: 'dance',
    name: 'Dance Competition',
    keywords: [
      'dance',
      'dancer',
      'dancers',
      'choreography',
      'hip hop',
      'classical dance',
      'folk dance',
      'western dance',
      'salsa',
      'breakdance',
      'flashmob',
      'dance battle',
      'dance showcase'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    description: 'Dancers performing dynamic choreography on stage'
  },

  // 5. Cricket Tournaments & Matches
  {
    id: 'cricket',
    name: 'Cricket Tournament',
    keywords: [
      'cricket',
      'ipl',
      'box cricket',
      'cricket match',
      'cricket tournament',
      'cricket league',
      'batsman',
      'gully cricket',
      'inter-college cricket'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    description: 'Cricket match on a stadium pitch'
  },

  // 6. Football / Soccer Tournaments
  {
    id: 'football',
    name: 'Football Tournament',
    keywords: [
      'football',
      'soccer',
      'futsal',
      'fifa',
      'football match',
      'football tournament',
      'soccer tournament',
      'penalty shootout'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    description: 'Football match with soccer ball on grass stadium pitch'
  },

  // 7. Basketball Tournaments
  {
    id: 'basketball',
    name: 'Basketball Tournament',
    keywords: ['basketball', 'hoops', 'nba', 'slam dunk', 'dribble', '3v3 basketball'],
    imageUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    description: 'Basketball court and hoop arena'
  },

  // 8. Art Workshops & Exhibitions
  {
    id: 'art',
    name: 'Art Workshop & Exhibition',
    keywords: [
      'art workshop',
      'art',
      'painting',
      'sketching',
      'drawing',
      'pottery',
      'calligraphy',
      'doodling',
      'craft',
      'sculpture',
      'canvas',
      'oil painting',
      'watercolor',
      'art exhibition',
      'fine arts'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    description: 'Artist creating colorful paintings with palette and brushes'
  },

  // 9. Coding & Technical Workshops
  {
    id: 'coding-workshop',
    name: 'Coding & Tech Workshop',
    keywords: [
      'coding workshop',
      'coding',
      'web development',
      'web dev',
      'python',
      'javascript',
      'typescript',
      'react',
      'programming',
      'software development',
      'full stack',
      'data structures',
      'algorithms',
      'machine learning',
      'ai workshop',
      'deep learning',
      'cybersecurity',
      'cloud computing',
      'docker',
      'kubernetes',
      'devops',
      'smart contracts',
      'web3',
      'solidity',
      'blockchain',
      'backend',
      'frontend'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    description: 'Student learning programming and writing code on a laptop'
  },

  // 10. Freshers' Party & Welcome Events
  {
    id: 'freshers',
    name: "Freshers' Party & Welcome Bash",
    keywords: [
      'freshers',
      'fresher',
      'freshers party',
      'freshers bash',
      'farewell',
      'prom',
      'orientation',
      'welcome party',
      'icebreaker',
      'dj night',
      'afterparty',
      'social mixer'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    description: 'College celebration party with lights, music, and confetti'
  },

  // 11. Cultural Fest & Celebrations
  {
    id: 'cultural-fest',
    name: 'Cultural Fest',
    keywords: [
      'cultural fest',
      'cultural festival',
      'cultural',
      'traditional day',
      'ethnic day',
      'fiesta',
      'carnival',
      'heritage',
      'diwali',
      'holi',
      'onam',
      'pongal',
      'spring fest',
      'annual fest'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    description: 'Vibrant cultural fest with colorful lights and stage performances'
  },

  // 12. Photography Workshop & Photowalk
  {
    id: 'photography',
    name: 'Photography Workshop',
    keywords: [
      'photography',
      'photo walk',
      'photowalk',
      'photoshoot',
      'lens',
      'camera',
      'shutterbug',
      'videography',
      'cinematography',
      'editing workshop'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    description: 'Professional camera and photography equipment'
  },

  // 13. Sports Fest & General Athletics
  {
    id: 'sports-fest',
    name: 'Sports Fest & Athletics',
    keywords: [
      'sports fest',
      'sports day',
      'athletics',
      'sports tournament',
      'marathon',
      'badminton',
      'volleyball',
      'table tennis',
      'tennis',
      'chess',
      'sports meet'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    description: 'Athletes competing on a running track and sports arena'
  },

  // 14. Debate & Public Speaking Competition
  {
    id: 'debate',
    name: 'Debate Competition & MUN',
    keywords: [
      'debate',
      'debating',
      'model united nations',
      'mun',
      'public speaking',
      'elocution',
      'speech',
      'extempore',
      'parliamentary',
      'quiz',
      'trivia',
      'oratory'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    description: 'Speaker addressing an audience at a podium microphone'
  },

  // 15. Tech Talk & Keynote Seminars
  {
    id: 'tech-talk',
    name: 'Tech Talk & Keynote',
    keywords: [
      'tech talk',
      'keynote',
      'seminar',
      'guest lecture',
      'conference',
      'summit',
      'symposium',
      'developer conference',
      'panel discussion',
      'industry talk',
      'webinar'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    description: 'Speaker presenting technology slides at a conference stage'
  },

  // 16. Career Fair & Networking
  {
    id: 'career',
    name: 'Career Fair & Placement',
    keywords: [
      'career fair',
      'job fair',
      'placement',
      'internship',
      'networking',
      'recruitment',
      'hiring',
      'resume review',
      'interview prep',
      'career expo'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'Students networking with recruiters at a career fair'
  },

  // 17. Robotics & Hardware / IoT
  {
    id: 'robotics',
    name: 'Robotics & Hardware Expo',
    keywords: [
      'robotics',
      'robot',
      'drone',
      'arduino',
      'iot',
      'hardware',
      'embedded systems',
      'maker',
      'electronics'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    description: 'Robotic technology and modern electronic hardware'
  },

  // 18. Gaming & Esports
  {
    id: 'gaming',
    name: 'Gaming & Esports Tournament',
    keywords: [
      'gaming',
      'esports',
      'lan party',
      'bgmi',
      'valorant',
      'game night',
      'video game',
      'fifa tournament',
      'counter strike',
      'battle royale'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    description: 'Competitive gamers at illuminated tournament arena'
  },

  // 19. Drama & Theatre
  {
    id: 'theatre',
    name: 'Drama & Theatre Showcase',
    keywords: [
      'drama',
      'theatre',
      'theater',
      'street play',
      'nukkad natak',
      'monologue',
      'skit',
      'play',
      'acting',
      'standup',
      'comedy night'
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    description: 'Actors performing a dramatic play under stage spotlight'
  }
];

// Fallback images strictly mapped to standard categories
export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'tech workshop':
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  hackathon:
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
  career:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  cultural:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  sports:
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
  academic:
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
  music:
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  dance:
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
  arts:
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'
};

/**
 * Normalizes text for reliable substring and keyword comparison.
 */
function normalizeText(text?: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Context-aware event image selector.
 *
 * @param params Event details including title, category, description, and optional explicit image.
 * @returns An appropriate, curated image URL.
 */
export function selectEventImage(params: {
  title?: string;
  category?: string;
  type?: string;
  description?: string;
  explicitImage?: string;
}): string {
  // 1. Explicitly provided custom image always wins (unless blank or default quad fallback)
  if (params.explicitImage && params.explicitImage.trim().length > 0) {
    const trimmed = params.explicitImage.trim();
    // Prioritize explicit URL if it's a valid web URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }
  }

  const normalizedTitle = normalizeText(params.title);
  const normalizedDesc = normalizeText(params.description);
  const normalizedCategory = normalizeText(params.category);
  const normalizedType = normalizeText(params.type);

  // 2. High Priority: Specific match in Title (e.g., "Garba Night", "Hackathon Prep", "Cricket Championship")
  for (const rule of EVENT_IMAGE_RULES) {
    for (const kw of rule.keywords) {
      const normalizedKw = normalizeText(kw);
      if (normalizedTitle.includes(normalizedKw)) {
        return rule.imageUrl;
      }
    }
  }

  // 3. Medium Priority: Specific match in Description
  for (const rule of EVENT_IMAGE_RULES) {
    for (const kw of rule.keywords) {
      const normalizedKw = normalizeText(kw);
      if (normalizedDesc.includes(normalizedKw)) {
        return rule.imageUrl;
      }
    }
  }

  // 4. Low Priority: Specific match in Category / Type
  for (const rule of EVENT_IMAGE_RULES) {
    for (const kw of rule.keywords) {
      const normalizedKw = normalizeText(kw);
      if (normalizedCategory.includes(normalizedKw) || normalizedType.includes(normalizedKw)) {
        return rule.imageUrl;
      }
    }
  }

  // 5. Category-based fallback
  const catKey = (normalizedCategory || normalizedType || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (catKey.includes(key) || key.includes(catKey)) {
      return url;
    }
  }

  // 6. Universal campus fallback
  return FALLBACK_EVENT_IMAGE;
}

/**
 * Helper to get the human-readable matched topic name for preview UI.
 */
export function getMatchedTopicLabel(params: {
  title?: string;
  category?: string;
  type?: string;
  description?: string;
}): string {
  const normalizedTitle = normalizeText(params.title);
  const normalizedDesc = normalizeText(params.description);
  const normalizedCategory = normalizeText(params.category);
  const normalizedType = normalizeText(params.type);

  for (const rule of EVENT_IMAGE_RULES) {
    for (const kw of rule.keywords) {
      const normalizedKw = normalizeText(kw);
      if (
        normalizedTitle.includes(normalizedKw) ||
        normalizedDesc.includes(normalizedKw) ||
        normalizedCategory.includes(normalizedKw) ||
        normalizedType.includes(normalizedKw)
      ) {
        return rule.name;
      }
    }
  }

  const catKey = (normalizedCategory || normalizedType || '').toLowerCase();
  for (const [key] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (catKey.includes(key)) {
      return `Category: ${params.category || params.type}`;
    }
  }

  return 'Campus General';
}
