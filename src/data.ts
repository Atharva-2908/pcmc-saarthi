import { Complaint, DepartmentStats, CitizenHero, LeaderboardUser } from './types';

export const DEPARTMENTS: { [key: string]: string } = {
  Roads: 'Civil Engineering (Roads) Department',
  Water: 'Water Supply Department',
  Electricity: 'Electrical Department',
  Garbage: 'Health & Urban Sanitation Department',
  Drainage: 'Sewerage & Drainage Department',
  Encroachment: 'Encroachment & Anti-encroachment Dept',
  Traffic: 'Traffic & BRTS Engineering Department',
  Environment: 'Environment & Garden Department',
  Fire: 'Fire & Disaster Management Department',
  Health: 'Public Health & Medical Services Department',
};

export const WARDS = [
  'Ward 1 - Chinchwad - Pradhikaran',
  'Ward 2 - Bhosari - Landewadi',
  'Ward 3 - Pimpri - Kalbhor Nagar',
  'Ward 4 - Wakad - Thergaon',
  'Ward 5 - Hinjawadi - Tathawade',
  'Ward 6 - Akurdi - Yamuna Nagar',
  'Ward 7 - Sangvi - Pimple Gurav',
  'Ward 8 - Nigdi - Sector 24',
  'Ward 9 - Ravet - Kiwale',
  'Ward 10 - Talawade - Rupeenagar'
];

export const ENGINEERS = [
  'Sub-Engineer Sanjay Deshmukh (Zone 1)',
  'Assistant Engineer Amit Shinde (Zone 2)',
  'Junior Engineer Priya Kulkarni (Zone 3)',
  'Senior Engineer Vinayak Patil (Zone 4)',
  'Site Engineer Ramesh Chavan (Zone 5)',
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'PCMC-2026-102',
    citizenName: 'Amit Patil',
    citizenEmail: 'amit.patil@example.com',
    category: 'Roads',
    description: 'Extremely deep pothole near Wakad Chowk main flyover landing. Multiple two-wheelers have experienced near-accidents in the dark. It covers nearly half of the left lane and gets filled with rainwater, making it invisible at night.',
    landmark: 'Adjacent to Datta Mandir road turn, under flyover pillar 18',
    ward: 'Ward 4 - Wakad - Thergaon',
    latitude: 18.5987,
    longitude: 73.7656,
    address: 'Near Datta Mandir Mandir, Wakad Flyover Road, Wakad, Pimpri-Chinchwad, Pune - 411057',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
    status: 'Submitted',
    priority: 'High',
    department: DEPARTMENTS.Roads,
    dateCreated: '2026-06-22T09:30:00Z',
    dateUpdated: '2026-06-22T09:30:00Z',
    isStalled: false,
    daysStalled: 0,
    upvotes: 14,
    upvoters: ['user1@example.com', 'user2@example.com', 'user3@example.com', 'user4@example.com', 'user5@example.com', 'user6@example.com', 'user7@example.com', 'user8@example.com', 'user9@example.com', 'user10@example.com', 'user11@example.com', 'user12@example.com', 'user13@example.com', 'user14@example.com'],
    history: [
      {
        id: 'ev-1',
        status: 'Submitted',
        title: 'Complaint Registered',
        description: 'Complaint submitted by citizen Amit Patil. Token generation successful.',
        date: '2026-06-22T09:30:00Z',
        actor: 'Citizen',
      }
    ],
    corporatorRemarks: []
  },
  {
    id: 'PCMC-2026-081',
    citizenName: 'Sunita Joshi',
    citizenEmail: 'sunita.joshi@example.com',
    category: 'Water',
    description: 'Severe water pipeline rupture on the main sector road. Water has been continuously gushing out and flooding the pavement for the past 9 days with no department response. Thousands of liters of drinking water are being wasted daily.',
    landmark: 'Opposite Sector 24 PCMC School Playground gateway',
    ward: 'Ward 8 - Nigdi - Sector 24',
    latitude: 18.6654,
    longitude: 73.7844,
    address: 'Sector 24 Main Road, near PCMC Primary School, Nigdi, Pimpri-Chinchwad - 411044',
    imageUrl: 'https://images.unsplash.com/photo-1542013936693-8848e5742383?q=80&w=600&auto=format&fit=crop',
    status: 'Submitted',
    priority: 'Critical',
    department: DEPARTMENTS.Water,
    dateCreated: '2026-06-13T07:15:00Z', // 10 days ago (Stalled!)
    dateUpdated: '2026-06-13T07:15:00Z',
    isStalled: true,
    daysStalled: 10,
    upvotes: 18,
    upvoters: ['u1@pcmc.gov.in', 'u2@pcmc.gov.in', 'u3@pcmc.gov.in', 'u4@pcmc.gov.in', 'u5@pcmc.gov.in', 'u6@pcmc.gov.in', 'u7@pcmc.gov.in', 'u8@pcmc.gov.in', 'u9@pcmc.gov.in', 'u10@pcmc.gov.in', 'u11@pcmc.gov.in', 'u12@pcmc.gov.in', 'u13@pcmc.gov.in', 'u14@pcmc.gov.in', 'u15@pcmc.gov.in', 'u16@pcmc.gov.in', 'u17@pcmc.gov.in', 'u18@pcmc.gov.in'],
    history: [
      {
        id: 'ev-2',
        status: 'Submitted',
        title: 'Complaint Filed Online',
        description: 'Auto-assigned to Water Supply Department. Awaiting primary admin verification.',
        date: '2026-06-13T07:15:00Z',
        actor: 'Citizen System Integration',
      }
    ],
    corporatorRemarks: [{ remark: 'Pending review for over a week. Residents are facing low pressure due to this leak. Speed up resolve.', timestamp: '2026-06-16T12:00:00Z' }]
  },
  {
    id: 'PCMC-2026-095',
    citizenName: 'Rahul More',
    citizenEmail: 'rahul.more@example.com',
    category: 'Garbage',
    description: 'Unregulated commercial dumping of organic waste from local wedding halls behind Kalbhor Nagar. Stray cattle and dogs are scattering it all over the residential pathways. Intolerable stench is spreading across the neighborhood.',
    landmark: 'Behind Shanti Palace Marriage Hall, boundary brick wall',
    ward: 'Ward 3 - Pimpri - Kalbhor Nagar',
    latitude: 18.6259,
    longitude: 73.8055,
    address: 'Internal Lane 2, Kalbhor Nagar, Chinchwad Station Road, Pimpri, Chinchwad - 411019',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600&auto=format&fit=crop',
    status: 'Resolved',
    priority: 'Medium',
    department: DEPARTMENTS.Garbage,
    assignedEngineer: 'Junior Engineer Priya Kulkarni (Zone 3)',
    dateCreated: '2026-06-18T11:00:00Z',
    dateUpdated: '2026-06-20T16:45:00Z',
    isStalled: false,
    daysStalled: 0,
    upvotes: 3,
    upvoters: ['g1@test.com', 'g2@test.com', 'g3@test.com'],
    history: [
      {
        id: 'ev-3',
        status: 'Submitted',
        title: 'Uploaded via Saarthi Portal',
        description: 'Waste management request logged.',
        date: '2026-06-18T11:00:00Z',
        actor: 'Citizen',
      },
      {
        id: 'ev-4',
        status: 'Under Review',
        title: 'Admin Verified',
        description: 'Sanitation admin reviewed and verified details.',
        date: '2026-06-18T14:30:00Z',
        actor: 'Department Admin',
      },
      {
        id: 'ev-5',
        status: 'Assigned',
        title: 'Assigned to Ward Engineer',
        description: 'Assigned to Junior Engineer Priya Kulkarni (Zone 3) for immediate site clearance.',
        date: '2026-06-19T09:00:00Z',
        actor: 'Department Admin',
      },
      {
        id: 'ev-6',
        status: 'In Progress',
        title: 'Clearance Initiated',
        description: 'Compactor vehicle and 4 personnel dispatched to garbage pile.',
        date: '2026-06-20T10:15:00Z',
        actor: 'Junior Engineer Priya Kulkarni (Zone 3)',
      },
      {
        id: 'ev-7',
        status: 'Resolved',
        title: 'Area Fully Cleared',
        description: 'Dumping pocket fully cleared and sanitized with bleaching powder. Warning board erected.',
        date: '2026-06-20T16:45:00Z',
        actor: 'Junior Engineer Priya Kulkarni (Zone 3)',
      }
    ],
    corporatorRemarks: []
  },
  {
    id: 'PCMC-2026-098',
    citizenName: 'Snehal Deshmukh',
    citizenEmail: 'snehal.d@example.com',
    category: 'Electricity',
    description: 'High-voltage live wire hanging dangerous low from an electric pole directly over a children’s coaching center entryway. Sparks occur intermittently during light gusts.',
    landmark: 'Directly in front of Wisdom Classes portal, near Shani Mandir',
    ward: 'Ward 1 - Chinchwad - Pradhikaran',
    latitude: 18.6433,
    longitude: 73.7822,
    address: 'Sector 27-A, Near Wisdom Classes, Pradhikaran, Chinchwad - 411044',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=600&auto=format&fit=crop',
    status: 'In Progress',
    priority: 'Critical',
    department: DEPARTMENTS.Electricity,
    assignedEngineer: 'Senior Engineer Vinayak Patil (Zone 4)',
    dateCreated: '2026-06-20T08:00:00Z',
    dateUpdated: '2026-06-21T10:30:00Z',
    isStalled: false,
    daysStalled: 0,
    upvotes: 11,
    upvoters: ['el1@test.com', 'el2@test.com', 'el3@test.com', 'el4@test.com', 'el5@test.com', 'el6@test.com', 'el7@test.com', 'el8@test.com', 'el9@test.com', 'el10@test.com', 'el11@test.com'],
    history: [
      {
        id: 'ev-8',
        status: 'Submitted',
        title: 'Emergency Complaint Opened',
        description: 'Urgent hazard reported.',
        date: '2026-06-20T08:00:00Z',
        actor: 'Citizen',
      },
      {
        id: 'ev-9',
        status: 'Assigned',
        title: 'Dispatched to Senior Engineer',
        description: 'Assigned to Senior Engineer Vinayak Patil (Zone 4) under high priority protocol.',
        date: '2026-06-20T12:00:00Z',
        actor: 'Department Admin',
      },
      {
        id: 'ev-10',
        status: 'In Progress',
        title: 'Line Isolated & Insulated',
        description: 'Technicians cut power temporarily and wrapped major joints. Ground line tightening in progress.',
        date: '2026-06-21T10:30:00Z',
        actor: 'Senior Engineer Vinayak Patil (Zone 4)',
      }
    ],
    corporatorRemarks: []
  },
  {
    id: 'PCMC-2026-077',
    citizenName: 'Prasad Walekar',
    citizenEmail: 'prasad@example.com',
    category: 'Drainage',
    description: 'Main manhole cover cracked and caved in. It is dangerous for pedestrians and cars, especially with monsoon fast approaching as it is at a busy intersection.',
    landmark: 'Near Walekar Petrol Pump Crossing',
    ward: 'Ward 9 - Ravet - Kiwale',
    latitude: 18.6444,
    longitude: 73.7544,
    address: 'Kiwale Main Road, Near Walekar Phata, Ravet, Pimpri-Chinchwad - 412101',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop',
    status: 'Under Review',
    priority: 'Low',
    department: DEPARTMENTS.Drainage,
    dateCreated: '2026-06-15T14:20:00Z', // 8 days ago (Stalled!)
    dateUpdated: '2026-06-16T10:00:00Z',
    isStalled: true,
    daysStalled: 8,
    upvotes: 2,
    upvoters: ['dr1@test.com', 'dr2@test.com'],
    history: [
      {
        id: 'ev-11',
        status: 'Submitted',
        title: 'Registered on Portal',
        description: 'Complaint regarding damaged manhole cover filed.',
        date: '2026-06-15T14:20:00Z',
        actor: 'Citizen',
      },
      {
        id: 'ev-12',
        status: 'Under Review',
        title: 'Site Verified',
        description: 'Site layout cross-checked. Scheduled for next batch of repairs.',
        date: '2026-06-16T10:00:00Z',
        actor: 'Department Admin',
      }
    ],
    corporatorRemarks: [{ remark: 'This is on a high speed junction. Please replace this manhole cover as soon as possible before any casualty!', timestamp: '2026-06-18T15:30:00Z' }]
  }
];

export const DEPARTMENT_SCORECARDS: DepartmentStats[] = [
  {
    category: 'Water',
    name: 'Water Supply Department',
    total: 3120,
    resolved: 2980,
    rating: 4.6,
    color: 'from-blue-550 to-indigo-600'
  },
  {
    category: 'Electricity',
    name: 'Electrical Infrastructure',
    total: 2450,
    resolved: 2390,
    rating: 4.8,
    color: 'from-amber-500 to-yellow-600'
  },
  {
    category: 'Garbage',
    name: 'Health & Urban Sanitation',
    total: 5120,
    resolved: 4780,
    rating: 4.3,
    color: 'from-green-550 to-emerald-600'
  },
  {
    category: 'Roads',
    name: 'Civil (Roads) Department',
    total: 4200,
    resolved: 3220,
    rating: 3.9,
    color: 'from-orange-550 to-red-600'
  },
  {
    category: 'Drainage',
    name: 'Sewerage & Drainage',
    total: 1850,
    resolved: 1540,
    rating: 4.0,
    color: 'from-cyan-550 to-blue-600'
  }
];

export const CITIZEN_HEROES: CitizenHero[] = [
  {
    id: 'hero-1',
    name: 'Dnyaneshwar Shinde',
    ward: 'Ward 4 - Wakad',
    resolutions: 24,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    badge: 'Civic Guardian',
    quote: 'PCMC Saarthi makes it incredibly easy to snap a photo and alert authorities. By checking daily issues near my shop, we kept Wakad pothole-free!'
  },
  {
    id: 'hero-2',
    name: 'Kavita Ranade',
    ward: 'Ward 8 - Nigdi',
    resolutions: 19,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    badge: 'Sanitation Champion',
    quote: 'Our housing society had chronic waste separation complaints. Using the report channel and tracking till resolution helped us gain 100% compliance.'
  },
  {
    id: 'hero-3',
    name: 'Amol Kalbhor',
    ward: 'Ward 3 - Pimpri',
    resolutions: 16,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    badge: 'Enviro Sentry',
    quote: 'Auto-detecting locations on illegal water drainage near our playground let engineers intervene on the duplicate route and stop contamination within 2 days.'
  }
];

export const MONTHLY_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    name: 'Dnyaneshwar Shinde',
    ward: 'Ward 4 - Wakad',
    points: 1240,
    complaintsResolved: 24,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
  },
  {
    rank: 2,
    name: 'Meera Deshmukh',
    ward: 'Ward 1 - Chinchwad',
    points: 1050,
    complaintsResolved: 21,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
  },
  {
    rank: 3,
    name: 'Kavita Ranade',
    ward: 'Ward 8 - Nigdi',
    points: 950,
    complaintsResolved: 19,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'
  },
  {
    rank: 4,
    name: 'Amol Kalbhor',
    ward: 'Ward 3 - Pimpri',
    points: 800,
    complaintsResolved: 16,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
  },
  {
    rank: 5,
    name: 'Suyash Gunjal',
    ward: 'Ward 7 - Sangvi',
    points: 710,
    complaintsResolved: 14,
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop'
  }
];
