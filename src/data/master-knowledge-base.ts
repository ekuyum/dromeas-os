/**
 * OPERATION KUYUMCU 2026 - MASTER KNOWLEDGE BASE
 * Consolidated from all uploaded documents
 * Created: February 10, 2026
 * D-DAY: November 30, 2026 (293 days remaining)
 */

// ============================================================================
// OPERATOR PROFILE
// ============================================================================
export const operator = {
  name: 'Efe Kuyumcu',
  email: 'EFE.KUYUMCU@dromeasyachts.com',
  phone: '+34 676 949 303', // Spanish
  age: 40, // turns 41 by D-Day
  location: 'Barcelona, Spain',
  relocatedFrom: 'Turkey',
  relocatedDate: 'January 2026',
  cognitiveNote: 'ADHD — requires single dashboard, no context-switching',
};

// ============================================================================
// FAMILY
// ============================================================================
export const family = {
  wife: {
    name: 'Yasemin Kuyumcu',
    role: 'Wife',
  },
  daughter: {
    name: 'Derya Kuyumcu',
    age: 4.5,
    school: 'Scuola Italiana',
    activities: ['Martial arts trial scheduled (Saturday)', 'Club Gimnàstic Barcelona (email sent)'],
  },
  pets: {
    dog: {
      name: 'Lobo',
      breed: 'German Shepherd',
      weight: '45kg',
      age: 9,
      idTag: 'LOBO / EFE / +34 676 949 303',
      equipmentNeeded: [
        { item: 'Tactical vest (MOLLE, XL)', cost: '€40-65', status: 'needed' },
        { item: 'MOLLE pouches (2 + water)', cost: '€15-25', status: 'needed' },
        { item: 'Basket muzzle (Size 5-6)', cost: '€15-25', status: 'needed' },
        { item: 'Short leash (50cm)', cost: '€10-15', status: 'needed' },
        { item: 'Standard leash (1.5m)', cost: '€15-20', status: 'needed' },
        { item: 'ID tag engraved', cost: '€10', status: 'needed' },
      ],
    },
    cat: {
      name: 'Zilli',
    },
  },
};

// ============================================================================
// D-DAY MISSION
// ============================================================================
export const mission = {
  dDay: '2026-11-30',
  daysRemaining: 293, // as of Feb 10, 2026
  targets: [
    { target: 'Cash Collected', amount: '€2,000,000', status: 'not_started' },
    { target: 'Barcelona Apartment', amount: 'PURCHASED', status: 'not_started' },
    { target: 'Parents Reserve', amount: '€500,000 secured', status: 'not_started' },
    { target: 'Parents Gift Cards', amount: '€10K each', status: 'not_started' },
    { target: 'Family Relocated', amount: 'Complete', status: 'in_progress' },
  ],
  reward: {
    hawaii: '2 weeks surfing with Yasemin and Derya',
    turkey: '2 weeks family reunion',
  },
};

// ============================================================================
// FINANCIAL REALITY
// ============================================================================
export const finances = {
  startingPosition: {
    date: '2026-02-10',
    cashFamily: 10000, // €10,000 - FAMILY ONLY, max €1K on business
    dromeasReceivable: 1000000, // €1M owed TO Efe BY Dromeas UK
    soyaslanMOU: 630174, // €630,174 - 9 installments from Jan 20, 2026
    dromeasStock: 1000000, // €1M+ in boats
    dromeasPipeline: { orders: 20, value: 4800000 }, // 20+ orders, €4.8M backlog
  },
  blockers: [
    { item: 'NAVIX T-Tops', amount: 115000, status: 'BLOCKER' },
    { item: 'Dromeas Turkey konkordato', status: 'IN_PROCEEDINGS' },
  ],
  monthlyBurn: {
    rent: 2305,
    sanitasInsurance: 310,
    familyLiving: 3000,
    utilities: 200,
    transportation: 200,
    deryaSchool: 500,
    groceries: 800,
    buffer: 500,
    total: 8000, // Corrected from €12,480
  },
  beckhamLaw: {
    deadline: '2026-07-16',
    taxRate: 0.24, // 24% flat tax
    impact: 500000, // €500K+ tax savings
  },
};

// ============================================================================
// REVENUE PROJECTIONS
// ============================================================================
export const revenueProjections = {
  byNovember30: [
    { source: 'Dromeas Yachts', target: 2800000 },
    { source: '€1M Receivable', target: 1000000 },
    { source: 'Eyadera LLC', target: 530000 },
    { source: 'Verdiq', target: 500000 },
    { source: 'Lobo Blu', target: 38000 },
    { source: 'Brújula', target: 87000 },
  ],
  grossTotal: 4955000,
  afterBeckhamTax: 3765800,
  aiConsensusSynthesis: {
    perplexity: { gross: 3700000, dromeas: 2800000, eyadera: 450000, verdiq: 350000 },
    chatgpt: { gross: 4050000, dromeas: 3000000, eyadera: 600000, verdiq: 400000 },
    gemini: { gross: 4800000, dromeas: 3500000, eyadera: 500000, verdiq: 650000 },
    grok: { gross: 4400000, dromeas: 3200000, eyadera: 600000, verdiq: 500000 },
    average: 4240000,
    conservative: 3700000,
    stretch: 4800000,
  },
};

// ============================================================================
// CORPORATE STRUCTURE
// ============================================================================
export const entities = {
  dromeasyachts: {
    name: 'Dromeas Yachts',
    jurisdiction: 'UK',
    role: 'Primary revenue driver (70%+ of target)',
    status: 'ALL-IN',
    metrics: {
      backlog: 4800000,
      ordersInPipeline: 20,
      stockValue: 1000000,
      receivableOwedToEfe: 1000000,
      production: 'Poland (D33/D38 moulds)',
      keyInvestor: 'Lotus Investment Group (2023)',
    },
    soyaslanMOU: {
      total: 630174,
      installments: 9,
      startDate: '2026-01-20',
      items: [
        { item: 'D33 WA 16', amount: 96124 },
        { item: 'D38 CC 003', amount: 105540 },
        { item: 'D38 CC 004', amount: 91614 },
        { item: 'D38 CC 005', amount: 57261 },
        { item: '38 serisi kalıp seti', amount: 155262 },
        { item: '44 serisi kalıp seti', amount: 124373 },
      ],
    },
    ceCertification: {
      moduleB_F: { cost: 55500, timeline: '39 weeks' },
      technicalDoc: { cost: 15000, timeline: '8-12 weeks' },
      ecTypeExamination: { cost: 30000, timeline: '5-11 weeks' },
      testing: { cost: 5000 },
      productVerification: { cost: 2500 },
      perBoatAfterCert: { cost: 3000, timeline: '21 weeks' },
    },
    greekMarket: {
      cities: ['Athens', 'Thessaloniki', 'Patras', 'Rhodes', 'Mykonos'],
      marinas: ['Marina Zeas', 'Alimos Marina'],
      vat: 0.24,
      action: 'Identify Greek dealer partners',
    },
    dealers: {
      count: 15,
      tier1Emails: [
        'efe@dromeasyachts.com',
        'sales@dromeasyachts.com',
        'info@dromeasyachts.com',
        'peter.meyer@dromeasyachts.com',
        'sonia@dromeasyachts.com',
        'accounting@dromeasyachts.com',
        'accounting.poland@dromeasyachts.com',
        'legal@dromeasyachts.com',
      ],
    },
  },
  eyadera: {
    name: 'Eyadera LLC',
    jurisdiction: 'Wyoming, USA',
    role: 'AI Consulting at US premium rates',
    status: 'LAUNCH',
    services: ['AI Strategy', 'Workflow Automation (n8n, Make)', 'LLM Integration', 'Operations Optimization'],
    rates: { hourly: { min: 150, max: 350, currency: 'USD' } },
    targets: {
      retainers: '3-5 clients',
      monthlyRevenue: { min: 50000, max: 75000 },
    },
    offers: [
      { name: 'AI Readiness Audit', duration: '2 weeks', price: 7500 },
      { name: 'AI Implementation Sprint', duration: '4 weeks', price: { min: 25000, max: 50000 } },
      { name: 'Fractional AI Partner', type: 'monthly', price: { min: 12000, max: 25000 } },
    ],
  },
  brujula: {
    name: 'Brújula',
    jurisdiction: 'Spain',
    role: 'Management consulting, legal invoice vehicle',
    status: 'ACTIVE',
    invoicing: {
      dromeासManagement: { min: 5000, max: 10000 },
      eयaderaEUOperations: { min: 2000, max: 5000 },
    },
  },
  verdiq: {
    name: 'Verdiq',
    type: 'AI Hallucination Detection SaaS',
    status: 'LAUNCHED',
    launchDate: '2025-12-16',
    pricing: {
      monthly: 19,
      yearly: 99,
      foundingCode: { name: 'FOUNDING', benefit: '1yr free Pro', maxUsers: 50 },
    },
    tech: ['n8n', 'LangChain', 'Pinecone', 'Multi-LLM'],
    year1Target: { users: 100 },
  },
  identio: {
    name: 'Identio',
    type: 'Pet Wellness / B2B Corporate Wellness',
    status: 'PARKED',
    reactivation: 'September 2026',
    launch: 'November/December 2026 (New Years wave)',
    market: { value: 61000000000, description: 'B2B corporate wellness' },
  },
  loboblu: {
    name: 'Lobo Blu',
    type: 'Premium Pet Dropshipping',
    status: '85-90% ready',
    platform: 'Shopify + AutoDS',
    completion: '2 weekend sprints (16 hours)',
    revenueTarget: { min: 3000, max: 5000 },
  },
  controlTower: {
    name: 'Control Tower / PROTOKOL',
    status: 'DROMEAS INTERNAL USE ONLY',
    purpose: 'Financial command center, multi-entity tracking',
  },
};

// ============================================================================
// KEY DEADLINES
// ============================================================================
export const deadlines = [
  { date: '2026-02-10', event: 'DGT verification START', priority: 'critical', status: 'today' },
  { date: '2026-02-11', event: 'Padrón appointment (OAC Monumental)', priority: 'critical', status: 'tomorrow' },
  { date: '2026-02-15', event: 'First date night', priority: 'medium', status: 'pending' },
  { date: '2026-02-28', event: 'First Dromeas deposits', priority: 'critical', status: 'pending' },
  { date: '2026-03-16', event: 'Barcelona Marathon', priority: 'high', status: 'pending' },
  { date: '2026-04-30', event: 'Motorcycle trigger check', priority: 'reward', status: 'pending' },
  { date: '2026-07-16', event: 'Beckham Law deadline', priority: 'critical', status: 'pending' },
  { date: '2026-11-30', event: 'D-DAY', priority: 'mission', status: 'pending' },
];

// ============================================================================
// MOTORCYCLE TRIGGER (Reward System)
// ============================================================================
export const motorcycleTrigger = {
  deadline: '2026-04-30',
  reward: { item: 'Motorcycle', budget: 8000 },
  criteria: [
    { metric: 'Cumulative Gross', target: 400000, current: 0 },
    { metric: 'Dromeas Deposits', target: 200000, current: 0 },
    { metric: 'Eyadera Revenue', target: 60000, current: 0 },
    { metric: 'Verdiq Pilots', target: 2, current: 0 },
    { metric: 'Cash in Bank', target: 100000, current: 10000 },
  ],
  allMet: false,
};

// ============================================================================
// BARCELONA RELOCATION CHECKLIST
// ============================================================================
export const barcelonaRelocation = {
  completed: [
    { task: 'NIE obtained', via: 'Illay Legal' },
    { task: 'Bank account opened', provider: 'Santander' },
    { task: 'Sanitas insurance signed', cost: 310, coverage: 'humans + pets' },
    { task: 'Padrón appointment booked', date: '2026-02-11', location: 'OAC Monumental, C. Sicilia 216' },
    { task: 'Driver license research complete', note: 'bilateral agreement confirmed' },
    { task: '3 expat Facebook groups joined' },
    { task: 'Orange Spanish SIMs acquired' },
  ],
  criticalThisWeek: [
    { task: 'Empadronamiento (Padrón)', deadline: '2026-02-11', status: 'BOOKED' },
    { task: 'DGT driver license verification', deadline: 'ASAP', status: 'URGENT' },
    { task: 'TIE application', deadline: 'After Padrón', status: 'pending' },
    { task: 'Update phone to Spanish number', deadline: 'This week', status: 'pending' },
  ],
  firstMonth: [
    { task: 'TIE card application', note: 'After Padrón, fingerprint appointment' },
    { task: 'Clave (digital ID)', note: 'CRITICAL for all online gov services' },
    { task: 'CATSALUT registration', note: 'Public health, get TSI card' },
    { task: 'Driver license exchange', note: 'After TIE received (March/April)' },
    { task: 'Social Security number', note: 'If self-employed' },
  ],
  firstSixMonths: [
    { task: 'Beckham Law application', deadline: '2026-07-16', priority: 'CRITICAL' },
    { task: 'Find permanent apartment', timeline: 'Month 2-3' },
    { task: 'Spanish language basics', timeline: 'Post-marathon' },
  ],
  driverLicenseProcess: {
    phase1: {
      name: 'NOW',
      steps: [
        'sede.dgt.gob.es → Cita Previa → Canjes → Turkey',
        'Enter: NIE + Turkish license number',
        'Submit (background verification starts)',
      ],
    },
    phase2: {
      name: 'After Feb 11',
      steps: ['Apply for TIE immediately', 'Monitor DGT status ("Contestado" = ready)'],
    },
    phase3: {
      name: 'Once TIE received (March/April)',
      steps: [
        'Book DGT appointment',
        'Get medical certificate (€40-50, valid 90 days)',
        'Location: Gran Via de les Corts Catalanes, 184',
      ],
    },
    documents: {
      turkishLicense: true,
      passport: true,
      nie: true,
      tie: false,
      padron: false,
      medicalCert: false,
      photo32x26: false,
      fee: 28.87,
    },
  },
};

// ============================================================================
// WEEKLY RHYTHM
// ============================================================================
export const weeklyRhythm = {
  monday: { theme: 'CASH DAY', focus: 'Collections, receivables, money hunting' },
  tuesday: { theme: 'ADMIN DAY', focus: 'Legal, bureaucracy, paperwork', block: '10AM-12PM' },
  wednesday: { theme: 'BUILD DAY', focus: 'Dromeas production, Soyaslan, technical' },
  thursday: { theme: 'DEAL DAY', focus: 'Dealers, negotiations, Greeks, sales' },
  friday: { theme: 'REVIEW DAY', focus: 'Email zero, weekly scorecard, planning' },
  saturday: { theme: 'FAMILY DAY', focus: 'Yasemin, Derya, Barcelona adventures' },
  sunday: { theme: 'WAR ROOM', focus: '60-min planning, Yasemin 1:1, meal prep' },
};

// ============================================================================
// 50-50-50 BARCELONA EXPERIENCE CHALLENGE
// ============================================================================
export const barcelona505050 = {
  restaurants: { target: 50, current: 0, items: [] as string[] },
  culturalActivities: { target: 50, current: 0, items: [] as string[] },
  dayTrips: { target: 50, current: 0, items: [] as string[] },
};

// ============================================================================
// MARATHON TRAINING
// ============================================================================
export const marathon = {
  date: '2026-03-16',
  currentWeight: 130, // kg
  targetWeight: 110, // kg
  protocol: '49-day minimal mileage protocol',
  equipment: {
    shoes: { name: 'ON Cloudsurfer Next', status: 'PURCHASED' },
    nutrition: { name: 'SIS electrolytes', status: 'ORDERED' },
  },
  tasks: [
    { task: 'Confirm electrolytes arrived', status: 'pending' },
    { task: 'First test run with new shoes', status: 'pending' },
    { task: 'Weigh in (baseline)', status: 'pending' },
    { task: 'Schedule weekly massage', status: 'pending' },
  ],
};

// ============================================================================
// THE COUNCIL (Advisors)
// ============================================================================
export const council = {
  innerCircle: [
    { name: 'Marcus Aurelius', domain: 'Focus', phrase: 'Focus only on what you control' },
    { name: 'Jocko Willink', domain: 'Discipline', phrase: 'Discipline equals freedom' },
    { name: 'Alex Hormozi', domain: 'Revenue', phrase: 'Hell Yes or No' },
    { name: 'Naval Ravikant', domain: 'Leverage', phrase: 'Long-term games with long-term people' },
    { name: 'Sun Tzu', domain: 'Strategy', phrase: 'Every battle is won before it\'s fought' },
    { name: 'Atatürk', domain: 'Vision', phrase: 'The future is in the skies' },
  ],
  performance: [
    { name: 'David Goggins', domain: 'Toughness', phrase: 'You\'re only 40% done' },
    { name: 'Kobe Bryant', domain: 'Excellence', phrase: 'Mamba mentality' },
    { name: 'Tim Ferriss', domain: '80/20', phrase: 'What would this look like if it were easy?' },
    { name: 'Mel Robbins', domain: 'Activation', phrase: '5-4-3-2-1 ACT' },
    { name: 'Tony Robbins', domain: 'State', phrase: 'Where focus goes, energy flows' },
  ],
  additional: [
    { name: 'Jensen Huang', specialty: 'Top 5 Things' },
    { name: 'Elon Musk', specialty: 'First Principles' },
    { name: 'Dan Martell', specialty: 'Buy Back Time' },
    { name: 'Greg Isenberg', specialty: 'Micro-SaaS' },
    { name: 'Sam Altman', specialty: 'Compounding' },
    { name: 'Andrew Ng', specialty: 'AI-First' },
    { name: 'Pieter Levels', specialty: 'Ship Fast' },
    { name: 'Sahil Lavingia', specialty: 'Minimalist' },
    { name: 'David Perell', specialty: 'Personal Monopoly' },
    { name: 'Patrick Bet-David', specialty: 'Speed' },
  ],
  creed: [
    'Focus only on what I control (Aurelius)',
    'Discipline equals freedom (Jocko)',
    'Hell Yes or No (Hormozi)',
    'I\'m only 40% done when I want to quit (Goggins)',
    'The future is in the skies, but first build the runway (Atatürk)',
  ],
};

// ============================================================================
// OPEN QUESTIONS (Need Resolution)
// ============================================================================
export const openQuestions = [
  { question: 'TIE timing — When exactly after Padrón?', action: 'Confirm with Illay' },
  { question: 'Sanitas pre-existing — Is Metformin/diabetes covered?', action: 'Call Sanitas' },
  { question: 'Derya vaccination card — Status?', action: 'Ask Yasemin' },
  { question: 'Turkish embassy Barcelona — Passport renewal? Document auth?', action: 'Research' },
  { question: 'Verdiq metrics — How many signups since Dec 16 launch?', action: 'Check dashboard' },
  { question: 'Pet insurance — Bundled with Sanitas or separate?', action: 'Verify' },
  { question: 'NAVIX €115K — Resolution timeline?', action: 'Negotiation priority' },
];

// ============================================================================
// RISKS TO MONITOR
// ============================================================================
export const risks = [
  { risk: 'TIE delayed', probability: 25, impact: 'Blocks license, CATSALUT', mitigation: 'Follow up with Illay weekly' },
  { risk: 'Marathon injury', probability: 20, impact: 'Derails March goal', mitigation: 'Minimal mileage protocol' },
  { risk: 'Verdiq traction stalls', probability: 30, impact: 'Revenue gap', mitigation: 'Weekly metrics' },
  { risk: 'Dromeas collection delays', probability: 35, impact: 'Cash flow stress', mitigation: 'Receivables tracker' },
  { risk: 'Burnout', probability: 40, impact: 'Everything suffers', mitigation: 'Sunday rest, family time' },
  { risk: 'NAVIX €115K unresolved', probability: 50, impact: 'Production blocker', mitigation: 'Negotiation priority' },
  { risk: 'No Dromeas deposits by April', probability: 30, impact: 'Catastrophic', mitigation: 'Eyadera consulting backup' },
  { risk: 'Beckham Law deadline missed', probability: 10, impact: 'Severe (€500K+ tax hit)', mitigation: 'Gestoría hired Week 1' },
  { risk: 'US consulting slow start', probability: 35, impact: 'Moderate', mitigation: 'EU market pivot' },
];

// ============================================================================
// HIGHEST LEVERAGE ACTION (4-AI Consensus)
// ============================================================================
export const highestLeverageAction = {
  action: 'Call Lotus Investment Group - TODAY',
  reasons: [
    'Already invested in Dromeas (2023)',
    'They have skin in the game - they WANT success',
    'One call could unlock €200-500K financing',
    'Could accelerate €1M receivable collection',
    'Portfolio company AI consulting opportunities',
    'Sets the tone for the entire sprint',
  ],
  script: `"Hi [Contact],

I'm calling because Dromeas is at an inflection point. We have 20+ orders
in pipeline, €1M+ in stock, and demand is strong. But we need €200-500K
to restart production at our Poland facility.

Three questions:
1. Is there appetite for bridge/growth capital from Lotus?
2. Can we discuss a timeline for my €1M receivable collection?
3. Are there any Lotus portfolio companies that need AI/ops consulting?

I'd like to propose a call this week to map out 2026 together."`,
  expectedOutcomes: {
    best: '€200K+ commitment within 30 days',
    good: 'Receivable collection plan accelerated',
    baseline: 'Portfolio company AI consulting intro',
  },
};

// ============================================================================
// BARCELONA CONTACTS
// ============================================================================
export const barcelonaContacts = {
  emergency: [
    { name: 'General Emergency', number: '112' },
    { name: 'Mossos (Police)', number: '088' },
    { name: 'Medical', number: '061' },
  ],
  government: [
    { name: 'Barcelona City', number: '010' },
    { name: 'DGT (Traffic)', website: 'sede.dgt.gob.es' },
    { name: 'CatSalut', website: 'catsalut.gencat.cat' },
  ],
  transport: [{ name: 'TMB (Metro)', website: 'tmb.cat' }],
  services: [
    { name: 'Hola Gestoría', website: 'holagestoria.es' },
    { name: 'GestoríaDGT', website: 'gestoriadgt.es' },
  ],
  petCare: [
    { name: 'Dondersteen', type: 'Dog hotel' },
    { name: 'El Vilà', type: 'Dog hotel' },
    { name: 'Dosrosas', type: 'Dog hotel' },
    { name: 'PetBacker', type: 'Home visits (Zilli)' },
  ],
  babysitters: ['BCN Babysitter', 'Marypop', 'MissBabysitter'],
};

// ============================================================================
// EXPORT ALL
// ============================================================================
export const masterKnowledgeBase = {
  operator,
  family,
  mission,
  finances,
  revenueProjections,
  entities,
  deadlines,
  motorcycleTrigger,
  barcelonaRelocation,
  weeklyRhythm,
  barcelona505050,
  marathon,
  council,
  openQuestions,
  risks,
  highestLeverageAction,
  barcelonaContacts,
};

export default masterKnowledgeBase;
