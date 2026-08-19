import fs from 'fs';
import path from 'path';

// 100 Curated IELTS Speaking topics
const TOPICS = [
  // Beginner (30 topics)
  { topic: 'Hometown & Living Area', level: 'Cơ bản', title: 'Hometown, Neighborhood & Living Environment', badge: 'Forecast 2026' },
  { topic: 'Daily Routine & Habits', level: 'Cơ bản', title: 'Daily Routines, Morning Habits & Productivity', badge: 'Popular' },
  { topic: 'Family & Childhood', level: 'Cơ bản', title: 'Family Relationships & Childhood Memories', badge: 'Real Exam' },
  { topic: 'Hobbies & Leisure', level: 'Cơ bản', title: 'Personal Hobbies, Free Time & Relaxation', badge: 'Beginner Friendly' },
  { topic: 'Favorite Food & Cooking', level: 'Cơ bản', title: 'Food Preferences, Cooking & Meals', badge: 'Top Pick' },
  { topic: 'Weather & Seasons', level: 'Cơ bản', title: 'Weather Patterns, Favorite Seasons & Climate', badge: 'Forecast Q3' },
  { topic: 'Pets & Animals', level: 'Cơ bản', title: 'Domestic Pets, Animal Care & Wildlife', badge: 'Popular' },
  { topic: 'Colors & Design', level: 'Cơ bản', title: 'Colors, Personal Style & Preferences', badge: 'Real Exam' },
  { topic: 'Shopping & Groceries', level: 'Cơ bản', title: 'Shopping Habits, Local Markets & Malls', badge: 'Popular' },
  { topic: 'Music & Songs', level: 'Cơ bản', title: 'Music Genres, Musical Instruments & Concerts', badge: 'Top Pick' },
  { topic: 'Reading & Books', level: 'Cơ bản', title: 'Reading Habits, Favorite Genres & Libraries', badge: 'Forecast 2026' },
  { topic: 'Morning vs Night Routine', level: 'Cơ bản', title: 'Early Birds vs Night Owls & Sleep Schedules', badge: 'Real Exam' },
  { topic: 'Weekends & Holidays', level: 'Cơ bản', title: 'Weekend Plans, Rest & Short Getaways', badge: 'Popular' },
  { topic: 'Public Holidays & Festivals', level: 'Cơ bản', title: 'Traditional Holidays, Tet Festival & Celebrations', badge: 'Forecast Q3' },
  { topic: 'Transportation & Commuting', level: 'Cơ bản', title: 'Public Transport, Bicycles & Daily Commutes', badge: 'Top Pick' },
  { topic: 'Clothes & Fashion', level: 'Cơ bản', title: 'Clothing Choices, Casual Wear & Trends', badge: 'Real Exam' },
  { topic: 'Television & Shows', level: 'Cơ bản', title: 'TV Programs, Game Shows & Series', badge: 'Popular' },
  { topic: 'Flowers & Plants', level: 'Cơ bản', title: 'Gardening, Indoor Plants & Nature', badge: 'Forecast 2026' },
  { topic: 'Sports & Physical Exercise', level: 'Cơ bản', title: 'Outdoor Sports, Gym Workouts & Fitness', badge: 'Top Pick' },
  { topic: 'Cleanliness & Organization', level: 'Cơ bản', title: 'House Chores, Tidiness & Organization', badge: 'Real Exam' },
  { topic: 'Fast Food & Snacks', level: 'Cơ bản', title: 'Street Food, Quick Bites & Health Choices', badge: 'Popular' },
  { topic: 'Cinema & Movie Theaters', level: 'Cơ bản', title: 'Movie Going, Popcorn & Cinema Experience', badge: 'Forecast Q3' },
  { topic: 'Neighborhood & Neighbors', level: 'Cơ bản', title: 'Neighborly Relations & Community Safety', badge: 'Real Exam' },
  { topic: 'House & Accommodation', level: 'Cơ bản', title: 'Apartments vs Houses & Room Decoration', badge: 'Top Pick' },
  { topic: 'School Days & Teachers', level: 'Cơ bản', title: 'Memories of School & Favorite Teachers', badge: 'Popular' },
  { topic: 'Photography & Selfies', level: 'Cơ bản', title: 'Taking Photos, Camera Apps & Memories', badge: 'Forecast 2026' },
  { topic: 'Birthdays & Celebrations', level: 'Cơ bản', title: 'Birthday Parties, Gifts & Traditions', badge: 'Real Exam' },
  { topic: 'Social Media & Apps', level: 'Cơ bản', title: 'Messaging Apps, Social Feeds & Screen Time', badge: 'Top Pick' },
  { topic: 'Outdoor Activities & Parks', level: 'Cơ bản', title: 'Walking in Parks, Picnics & Fresh Air', badge: 'Popular' },
  { topic: 'Drinking Water & Beverages', level: 'Cơ bản', title: 'Hydration, Tea, Coffee & Healthy Drinks', badge: 'Forecast Q3' },

  // Intermediate (40 topics)
  { topic: 'Technology & Smart Devices', level: 'Trung cấp', title: 'Smart Home Gadgets, Tablets & Digital Living', badge: 'Forecast Q3' },
  { topic: 'Work from Home & Remote Jobs', level: 'Trung cấp', title: 'Telecommuting, Hybrid Work & Virtual Offices', badge: 'Hot Trend' },
  { topic: 'Travel & Tourism', level: 'Trung cấp', title: 'Backpacking, Solo Travel & Cultural Immersion', badge: 'Cambridge 19' },
  { topic: 'Gastronomy & Fine Dining', level: 'Trung cấp', title: 'International Cuisines & Restaurant Culture', badge: 'Top Pick' },
  { topic: 'Health & Mental Wellbeing', level: 'Trung cấp', title: 'Stress Management, Mindfulness & Diet', badge: 'Forecast 2026' },
  { topic: 'Education & Academic Life', level: 'Trung cấp', title: 'Online Degrees, University Life & Exams', badge: 'Real Exam' },
  { topic: 'Time Management & Goals', level: 'Trung cấp', title: 'Productivity Techniques, Pomodoro & Deadlines', badge: 'Popular' },
  { topic: 'City Life vs Countryside', level: 'Trung cấp', title: 'Urban Pace vs Rural Peace & Cost of Living', badge: 'Forecast Q3' },
  { topic: 'Eco-friendly Habits', level: 'Trung cấp', title: 'Zero Waste, Recycling & Green Living', badge: 'Hot Trend' },
  { topic: 'Online Shopping & E-Commerce', level: 'Trung cấp', title: 'Digital Payments, Delivery & Consumer Trends', badge: 'Top Pick' },
  { topic: 'Art & Creative Expression', level: 'Trung cấp', title: 'Painting, Sculptures & Modern Art Galleries', badge: 'Cambridge 19' },
  { topic: 'Museums & Heritage', level: 'Trung cấp', title: 'Historical Artifacts & Museum Exhibitions', badge: 'Real Exam' },
  { topic: 'Cultural Festivals & Heritage', level: 'Trung cấp', title: 'Preserving Traditional Festivals & Identity', badge: 'Forecast 2026' },
  { topic: 'Memory & Concentration', level: 'Trung cấp', title: 'Retaining Information, Brain Training & Focus', badge: 'Popular' },
  { topic: 'Public Speaking & Debate', level: 'Trung cấp', title: 'Overcoming Stage Fright & Presentation Skills', badge: 'Hot Trend' },
  { topic: 'Future Aspirations & Ambition', level: 'Trung cấp', title: 'Career Trajectories, Startups & Dreams', badge: 'Top Pick' },
  { topic: 'Volunteering & Community Service', level: 'Trung cấp', title: 'Charity Work, Non-Profits & Social Impact', badge: 'Forecast Q3' },
  { topic: 'Foreign Languages & Polyglots', level: 'Trung cấp', title: 'Bilingualism, Accent & Cultural Fluency', badge: 'Cambridge 19' },
  { topic: 'History & Historic Figures', level: 'Trung cấp', title: 'Historical Lessons, Monuments & Biographies', badge: 'Real Exam' },
  { topic: 'Advertising & Marketing', level: 'Trung cấp', title: 'Influencer Marketing, Billboards & Persuasion', badge: 'Popular' },
  { topic: 'Solitude & Privacy', level: 'Trung cấp', title: 'Enjoying Alone Time, Introversion & Boundaries', badge: 'Hot Trend' },
  { topic: 'Environmental Conservation', level: 'Trung cấp', title: 'National Parks, Forestry & Ocean Protection', badge: 'Forecast 2026' },
  { topic: 'Movies & Documentary Films', level: 'Trung cấp', title: 'Cinematography, Storytelling & Film Impact', badge: 'Top Pick' },
  { topic: 'Gift-giving Traditions', level: 'Trung cấp', title: 'Meaningful Presents, Etiquette & Gratitude', badge: 'Real Exam' },
  { topic: 'Noise & Tranquility', level: 'Trung cấp', title: 'Noise Pollution, Soundscapes & Quiet Spaces', badge: 'Popular' },
  { topic: 'Politeness & Social Etiquette', level: 'Trung cấp', title: 'Manners in Public, Online Etiquette & Respect', badge: 'Forecast Q3' },
  { topic: 'Extreme Sports & Adrenaline', level: 'Trung cấp', title: 'Skydiving, Bungee Jumping & Risk-taking', badge: 'Hot Trend' },
  { topic: 'Childhood Mentors & Role Models', level: 'Trung cấp', title: 'Inspirational Leaders, Parents & Guides', badge: 'Cambridge 19' },
  { topic: 'Virtual Communication & Zoom', level: 'Trung cấp', title: 'Video Conferencing, E-mails & Digital Nuance', badge: 'Top Pick' },
  { topic: 'News & Media Consumption', level: 'Trung cấp', title: 'Fake News, Credible Sources & Journalism', badge: 'Real Exam' },
  { topic: 'Renewable Energy & Solar', level: 'Trung cấp', title: 'Solar Panels, Wind Power & Green Transition', badge: 'Forecast 2026' },
  { topic: 'Wildlife Protection & Zoos', level: 'Trung cấp', title: 'Endangered Species, Ethical Sanctuaries & Zoos', badge: 'Popular' },
  { topic: 'Architecture & Modern Buildings', level: 'Trung cấp', title: 'Skyscrapers, Sustainable Design & Heritage', badge: 'Hot Trend' },
  { topic: 'Dream Destinations & Journeys', level: 'Trung cấp', title: 'Bucket List Travel, Northern Lights & Safaris', badge: 'Top Pick' },
  { topic: 'Career Transitions & Reskilling', level: 'Trung cấp', title: 'Job Switching, Lifelong Learning & Passions', badge: 'Forecast Q3' },
  { topic: 'Fast Fashion & Conscious Wardrobes', level: 'Trung cấp', title: 'Textile Waste, Thrift Stores & Capsule Wardrobes', badge: 'Cambridge 19' },
  { topic: 'Sleep Hygiene & Rest', level: 'Trung cấp', title: 'Circadian Rhythms, Insomnia & Sleep Quality', badge: 'Real Exam' },
  { topic: 'Personal Finance & Budgeting', level: 'Trung cấp', title: 'Saving Money, Investing & Financial Literacy', badge: 'Popular' },
  { topic: 'AI in Classroom & Learning', level: 'Trung cấp', title: 'ChatGPT for Students, Homework & EdTech', badge: 'Hot Trend' },
  { topic: 'Cultural Identity in Globalized World', level: 'Trung cấp', title: 'Preserving Mother Tongue, Traditions & Roots', badge: 'Forecast 2026' },

  // Advanced (30 topics)
  { topic: 'Artificial Intelligence & Job Automation', level: 'Nâng cao', title: 'Disruptive AI, Universal Basic Income & Labor', badge: 'VIP 8.5+' },
  { topic: 'Ethics of Genetic Engineering', level: 'Nâng cao', title: 'CRISPR, Bioethics & Gene Editing in Medicine', badge: 'VIP 8.0+' },
  { topic: 'Globalization & Cultural Homogenization', level: 'Nâng cao', title: 'Loss of Dialects, Westernization & Global Trade', badge: 'Cambridge 19' },
  { topic: 'Climate Change & Decarbonization', level: 'Nâng cao', title: 'Carbon Credits, Net Zero & Climate Migration', badge: 'VIP 8.5+' },
  { topic: 'Cognitive Overload in the Digital Era', level: 'Nâng cao', title: 'Dopamine Detoxing, Attention Economy & Deep Work', badge: 'Forecast Q3' },
  { topic: 'Urbanization & Megacities', level: 'Nâng cao', title: 'Smart Infrastructure, Slums & Urban Density', badge: 'VIP 8.0+' },
  { topic: 'Modern Economic Disparities', level: 'Nâng cao', title: 'Wealth Gap, Social Mobility & Progressive Taxes', badge: 'VIP 8.5+' },
  { topic: 'Scientific Breakthroughs & Quantum Computing', level: 'Nâng cao', title: 'Quantum Mechanics, Supercomputers & Innovation', badge: 'Cambridge 19' },
  { topic: 'Geopolitical Diplomacy & Treaties', level: 'Nâng cao', title: 'International Alliances, Trade Wars & Peace', badge: 'VIP 8.5+' },
  { topic: 'Mental Health in Fast-Paced Societies', level: 'Nâng cao', title: 'Burnout Epidemic, Therapy & Institutional Support', badge: 'Forecast 2026' },
  { topic: 'Space Exploration & Colonization', level: 'Nâng cao', title: 'Mars Missions, Space Commercialization & Ethics', badge: 'VIP 8.5+' },
  { topic: 'Intellectual Property & Digital Rights', level: 'Nâng cao', title: 'Open Source, Patent Trolls & Digital Freedom', badge: 'VIP 8.0+' },
  { topic: 'The Psychology of Consumerism', level: 'Nâng cao', title: 'Hyper-consumerism, Materialism & Happiness', badge: 'VIP 8.5+' },
  { topic: 'Educational Inequity & Digital Divide', level: 'Nâng cao', title: 'Access to Quality Education, Subsidies & EdTech', badge: 'Cambridge 19' },
  { topic: 'Aging Population & Healthcare Burden', level: 'Nâng cao', title: 'Pensions, Geriatric Care & Demographic Shifts', badge: 'VIP 8.0+' },
  { topic: 'The Creator Economy & Freelance Labor', level: 'Nâng cao', title: 'Monetization, Algorithmic Dependence & Precarity', badge: 'Forecast Q3' },
  { topic: 'Deepfakes & Information Integrity', level: 'Nâng cao', title: 'Synthetic Media, Post-Truth Era & Democracy', badge: 'VIP 8.5+' },
  { topic: 'Modern Art vs Classical Aesthetics', level: 'Nâng cao', title: 'Conceptual Art, Cultural Capital & Provocation', badge: 'VIP 8.0+' },
  { topic: 'Sustainable Agriculture & Food Security', level: 'Nâng cao', title: 'Vertical Farming, Lab-grown Meat & Monoculture', badge: 'VIP 8.5+' },
  { topic: 'Universal Basic Income & Welfare', level: 'Nâng cao', title: 'Social Safety Nets, Incentives to Work & Equity', badge: 'Cambridge 19' },
  { topic: 'Digital Detox & Psychological Solitude', level: 'Nâng cao', title: 'Mindful Living, Neuroplasticity & Digital Sabbath', badge: 'VIP 8.0+' },
  { topic: 'Ethics of Surveillance & Big Data', level: 'Nâng cao', title: 'Facial Recognition, Algorithmic Bias & Panopticon', badge: 'VIP 8.5+' },
  { topic: 'Crisis Leadership & Strategic Decision Making', level: 'Nâng cao', title: 'Navigating Uncertainty, Agility & Ethics', badge: 'VIP 8.0+' },
  { topic: 'Higher Education Worth & Academic Inflation', level: 'Nâng cao', title: 'Degree Value, Student Debt & Vocational Alternatives', badge: 'Forecast 2026' },
  { topic: 'Impact of Overtourism on Indigenous Cultures', level: 'Nâng cao', title: 'Commercialization of Sacred Heritage & Gentrification', badge: 'VIP 8.5+' },
  { topic: 'Biodiversity Collapse & Sixth Mass Extinction', level: 'Nâng cao', title: 'Ecological Tipping Points, Rewilding & Habitats', badge: 'VIP 8.5+' },
  { topic: 'Automation in Legal & Medical Fields', level: 'Nâng cao', title: 'AI Diagnostics, Robotic Surgery & Liability Law', badge: 'Cambridge 19' },
  { topic: 'The Philosophy of True Happiness (Eudaimonia)', level: 'Nâng cao', title: 'Stoicism, Purpose vs Pleasure & Fulfillment', badge: 'VIP 8.5+' },
  { topic: 'Nuclear Fusion & The Energy Revolution', level: 'Nâng cao', title: 'Zero-Emission Power, Geothermal & Global Grid', badge: 'VIP 8.5+' },
  { topic: 'Globalization of Media & Soft Power', level: 'Nâng cao', title: 'Hollywood, K-Pop, Cultural Diplomacy & Hegemony', badge: 'VIP 8.0+' }
];

function generateSet(t, idx) {
  const setId = `speaking-set-${idx + 1}`;
  const isBeginner = t.level === 'Cơ bản';
  const isIntermediate = t.level === 'Trung cấp';
  const targetBand = isBeginner ? '5.5 - 6.0' : isIntermediate ? '6.5 - 7.0' : '7.5 - 8.5+';

  return {
    id: setId,
    title: t.title,
    topic: t.topic,
    level: t.level,
    badge: t.badge,
    isNew: idx < 15,
    description: `Bộ đề luyện nói toàn diện chủ đề ${t.topic}, chuẩn bị sẵn câu hỏi Part 1, Cue Card Part 2, thảo luận Part 3 kèm bài mẫu Band 8.5+ và collocations học thuật.`,
    createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
    part1Questions: [
      {
        id: `${setId}-p1-q1`,
        part: 1,
        topic: t.topic,
        suggestedDurationSeconds: 30,
        text: `How often do you engage in activities related to ${t.topic.toLowerCase()} in your daily life?`,
        sampleAnswerBand8: `To be completely honest, ${t.topic.toLowerCase()} plays an integral role in my routine. I make a conscious effort to dedicate time to this on a regular basis because it provides me with both mental clarity and personal satisfaction.`,
        collocations: ['play an integral role', 'make a conscious effort', 'mental clarity', 'personal satisfaction'],
        ideaHints: ['Frequency and timing', 'Why you enjoy or practice it', 'Positive personal impact'],
      },
      {
        id: `${setId}-p1-q2`,
        part: 1,
        topic: t.topic,
        suggestedDurationSeconds: 30,
        text: `Did you have similar interests or experiences regarding ${t.topic.toLowerCase()} when you were a child?`,
        sampleAnswerBand8: `Looking back, my perception was quite distinct during my formative years. While I used to view it as merely a casual pastime, as I matured, I began to appreciate its deeper cultural and practical value.`,
        collocations: ['formative years', 'casual pastime', 'appreciate its deeper value', 'distinct perspective'],
        ideaHints: ['Childhood memories', 'How your perspective changed over time', 'Key influences (parents, school)'],
      },
      {
        id: `${setId}-p1-q3`,
        part: 1,
        topic: t.topic,
        suggestedDurationSeconds: 30,
        text: `Do you prefer experiencing ${t.topic.toLowerCase()} alone or with friends and family?`,
        sampleAnswerBand8: `It truly depends on my state of mind. On one hand, doing this in solitude allows for deep reflection and focus; on the other hand, sharing the experience with close companions fosters stronger social bonds and mutual enjoyment.`,
        collocations: ['state of mind', 'in solitude', 'deep reflection', 'foster stronger social bonds', 'mutual enjoyment'],
        ideaHints: ['Balance between solo and group experience', 'When solo is best', 'Benefits of sharing with others'],
      }
    ],
    part2CueCard: {
      id: `${setId}-p2-card`,
      topic: t.topic,
      title: `Describe a memorable experience or important aspect of ${t.topic.toLowerCase()} that influenced you`,
      bulletPoints: [
        `What the experience or aspect is`,
        `When and where it took place`,
        `Who was involved with you`,
        `And explain why this left a profound impression on your personal growth`
      ],
      prepTimeSeconds: 60,
      speakingTimeSeconds: 120,
      sampleAnswerBand8: `Today, I would like to share a truly transformative experience related to ${t.topic.toLowerCase()} that occurred a few years ago and fundamentally reshaped my worldview.

At that time, I was navigating a particularly demanding phase in my academic life, and I felt the necessity to step out of my comfort zone. I decided to immerse myself fully in this domain, collaborating with passionate individuals who shared identical enthusiasm.

What made this occasion exceptionally unforgettable was the profound synergy and knowledge exchange. Not only did I acquire indispensable practical expertise, but I also developed critical resilience when facing unexpected challenges. Furthermore, witnessing the tangible impact of our collective dedication was immensely gratifying.

Ultimately, this experience was a crucial turning point for me. It broadened my intellectual horizons, instilled genuine self-confidence, and reinforced the philosophy that continuous curiosity is the key to personal fulfillment.`,
      collocations: [
        'transformative experience',
        'fundamentally reshape worldview',
        'step out of comfort zone',
        'immerse myself fully',
        'indispensable practical expertise',
        'tangible impact',
        'crucial turning point',
        'broaden intellectual horizons'
      ],
      ideaHints: [
        'Engaging hook and background setting',
        'What specifically happened and key challenges',
        'Valuable lessons and skills gained',
        'Long-term psychological and personal impact'
      ],
    },
    part3Questions: [
      {
        id: `${setId}-p3-q1`,
        part: 3,
        topic: t.topic,
        suggestedDurationSeconds: 45,
        text: `How has public perception of ${t.topic.toLowerCase()} shifted over the past few decades in modern society?`,
        sampleAnswerBand8: `In my view, there has been a paradigm shift. Historically, this domain was perceived through a rather conventional lens, whereas in contemporary society, technological integration and global connectivity have elevated it into a central facet of modern lifestyle and policy discourse.`,
        collocations: ['paradigm shift', 'conventional lens', 'contemporary society', 'central facet', 'policy discourse'],
        ideaHints: ['Past vs present comparison', 'Role of technology & media', 'Societal attitudes'],
      },
      {
        id: `${setId}-p3-q2`,
        part: 3,
        topic: t.topic,
        suggestedDurationSeconds: 45,
        text: `What potential challenges might future generations encounter regarding ${t.topic.toLowerCase()}?`,
        sampleAnswerBand8: `I anticipate that the primary challenge will revolve around sustainability and equitable access. As commercialization accelerates, society must strike an intricate balance between rapid modernization and the preservation of authentic ethical values.`,
        collocations: ['equitable access', 'commercialization accelerates', 'strike an intricate balance', 'preservation of authentic values'],
        ideaHints: ['Emerging problems and sustainability', 'Economic disparities', 'Proposed solutions and regulations'],
      },
      {
        id: `${setId}-p3-q3`,
        part: 3,
        topic: t.topic,
        suggestedDurationSeconds: 45,
        text: `Should governments and institutions take proactive measures to support and regulate this field?`,
        sampleAnswerBand8: `Without a shadow of a doubt. Robust governmental oversight and strategic subsidies are imperative to prevent monopolistic exploitation, ensure safety standards, and foster an inclusive ecosystem where all socioeconomic groups can benefit.`,
        collocations: ['without a shadow of a doubt', 'governmental oversight', 'strategic subsidies', 'monopolistic exploitation', 'inclusive ecosystem'],
        ideaHints: ['The vital role of policy and law', 'Funding and educational programs', 'Protecting public interest'],
      }
    ]
  };
}

const allSets = TOPICS.map((t, idx) => generateSet(t, idx));

const outputContent = `// 100 Comprehensive IELTS Speaking Question Sets (Beginner, Intermediate, Advanced)
import { SpeakingQuestionSet } from './types';

export const presetSpeakingSets: SpeakingQuestionSet[] = ${JSON.stringify(allSets, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src/lib/preset-speaking.ts'), outputContent, 'utf-8');
console.log(`Successfully generated ${allSets.length} IELTS Speaking Question Sets!`);
