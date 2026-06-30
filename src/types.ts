export type ComplaintCategory =
  | 'Roads'
  | 'Water'
  | 'Electricity'
  | 'Garbage'
  | 'Drainage'
  | 'Encroachment'
  | 'Traffic'
  | 'Environment'
  | 'Fire'
  | 'Health';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolution Pending Approval'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened'
  | 'Closed';

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus | 'Remark Added' | 'Re-routed' | 'Estimated Date Set' | 'Resolution Submitted' | 'Reopened';
  title: string;
  description: string;
  date: string;
  actor: string;
}

export interface CorporatorRemark {
  remark: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  citizenName: string;
  citizenEmail: string;
  category: ComplaintCategory;
  description: string;
  landmark: string;
  ward: string; // e.g. "Ward 4 - Wakad"
  latitude?: number;
  longitude?: number;
  address: string;
  imageUrl?: string;
  status: ComplaintStatus;
  department: string;
  assignedEngineer?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedResolutionDate?: string;
  resolutionDescription?: string;
  resolutionProofUrl?: string;
  actualResolutionDate?: string;
  dateCreated: string;
  dateUpdated: string;
  history: TimelineEvent[];
  corporatorRemarks?: CorporatorRemark[];
  rejectionReason?: string;
  isStalled: boolean; // 7+ days without progress
  daysStalled: number;
  rating?: number;
  ratingComment?: string;
  reopenReason?: string;
  reopenCount?: number;
  originalResolutionDate?: string;
  originalResolutionProofUrl?: string;
  originalResolutionDescription?: string;
  upvotes?: number;
  upvoters?: string[];
  aiSeverityScore?: number; // 1 to 10
  detectedFeature?: string;
  aiFeedbackMessage?: string;
  isPossibleDuplicate?: boolean;
  duplicateReferenceId?: string;
}

export interface DepartmentStats {
  category: ComplaintCategory;
  name: string;
  total: number;
  resolved: number;
  rating: number; // Out of 5.0
  color: string;
}

export interface CitizenHero {
  id: string;
  name: string;
  ward: string;
  resolutions: number;
  avatarUrl: string;
  badge: string;
  quote: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  ward: string;
  points: number;
  complaintsResolved: number;
  avatarUrl: string;
}

export interface UserProfile {
  name: string;
  role: 'citizen' | 'admin' | 'corporator' | 'engineer';
  email: string;
  mobile: string;
  ward?: string;
  employeeId?: string;
}

// Auto Priority Scoring combining several weighted indices
export function getPriorityScore(c: Complaint): number {
  // 1. AI Severity input score (weight 40%) - falls back to mapping priority if not present
  let aiScore = c.aiSeverityScore;
  if (aiScore === undefined) {
    const prior = c.priority || 'Low';
    if (prior === 'Critical') aiScore = 10;
    else if (prior === 'High') aiScore = 7.5;
    else if (prior === 'Medium') aiScore = 5.0;
    else aiScore = 2.5;
  }
  const aiWeight = aiScore * 0.40;

  // 2. Community upvotes (weight 30%) - upvotes scaled linearly, caps at 5 (reaches full points)
  const votes = c.upvotes || 0;
  const upvoteScore = Math.min(1 + votes * 1.8, 10);
  const upvoteWeight = upvoteScore * 0.30;

  // 3. Days issue open without resolution (weight 20%)
  const start = new Date(c.dateCreated).getTime();
  const end = c.actualResolutionDate ? new Date(c.actualResolutionDate).getTime() : Date.now();
  const diffDays = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  const daysScore = Math.min(1 + diffDays * 1.5, 10);
  const daysWeight = daysScore * 0.20;

  // 4. Category risk level (weight 10%) - Open manhole & Fire safety always count as Critical (10/10 risk)
  const isHighRisk = c.category === 'Fire' || 
    (c.description || '').toLowerCase().includes('manhole') || 
    (c.description || '').toLowerCase().includes('open manhole') ||
    (c.description || '').toLowerCase().includes('fire safety');
    
  let riskBase = 5.0; // default medium risk
  if (isHighRisk) {
    riskBase = 10.0;
  } else if (c.category === 'Health' || c.category === 'Electricity') {
    riskBase = 8.0;
  } else if (c.category === 'Water' || c.category === 'Roads' || c.category === 'Drainage') {
    riskBase = 6.0;
  } else if (c.category === 'Traffic' || c.category === 'Encroachment') {
    riskBase = 4.5;
  } else {
    riskBase = 3.0;
  }
  const riskWeight = riskBase * 0.10;

  // Calculate sum of parts
  let finalScore = aiWeight + upvoteWeight + daysWeight + riskWeight;

  // Force score to critical band if high risk conditions are satisfied
  if (isHighRisk && finalScore < 8.0) {
    finalScore = 8.2; // place inside Critical range (8 to 10)
  }

  return Math.min(10, Math.max(1, Number(finalScore.toFixed(2))));
}

export function getEffectivePriority(c: Complaint): 'Low' | 'Medium' | 'High' | 'Critical' {
  const score = getPriorityScore(c);
  if (score >= 8.0) return 'Critical';
  if (score >= 6.0) return 'High';
  if (score >= 4.0) return 'Medium';
  return 'Low';
}
