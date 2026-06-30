import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, CheckCircle2, ClipboardList, AlertCircle, TrendingUp, Star, Award, 
  MapPin, Check, ArrowRight, CornerRightDown, ThumbsUp, Landmark, ExternalLink, Calendar,
  User, Shield, ArrowLeft, Search, AlertTriangle, Eye
} from 'lucide-react';
import { Complaint, DepartmentStats, CitizenHero, LeaderboardUser } from '../types';
import { DEPARTMENT_SCORECARDS, CITIZEN_HEROES, MONTHLY_LEADERBOARD, DEPARTMENTS } from '../data';

interface LandingPageProps {
  complaints: Complaint[];
  setCurrentRole: (role: 'citizen' | 'admin' | 'corporator' | 'public') => void;
  onRaiseClick: () => void;
}

export default function LandingPage({ complaints, setCurrentRole, onRaiseClick }: LandingPageProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [viewingReportCards, setViewingReportCards] = useState(false);
  const [corporatorSearchQuery, setCorporatorSearchQuery] = useState('');

  // Compute stats on current complaints list
  const totalRaised = complaints.length + 15430; // base offset to make it look like a real massive city system
  const totalResolved = complaints.filter(c => c.status === 'Resolved').length + 13860;
  const totalInProgress = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length + 950;
  const totalUnderReview = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length + 620;

  const resolutionRate = ((totalResolved / totalRaised) * 100).toFixed(1);

  // Filter and sort for top 3 community verified complaints
  const mostUpvoted = [...complaints].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  let verifiedComplaints = mostUpvoted.filter(c => (c.upvotes || 0) >= 10);
  if (verifiedComplaints.length < 3) {
    verifiedComplaints = mostUpvoted.slice(0, 3);
  } else {
    verifiedComplaints = verifiedComplaints.slice(0, 3);
  }

  const nextHero = () => {
    setHeroIndex((prev) => (prev + 1) % CITIZEN_HEROES.length);
  };

  const prevHero = () => {
    setHeroIndex((prev) => (prev - 1 + CITIZEN_HEROES.length) % CITIZEN_HEROES.length);
  };

  // Corporator Public KPI Profiles Definition
  const CORPORATOR_PROFILES = [
    { wardId: 'Ward 1', name: 'Shri. Sachin Chinchwade', area: 'Chinchwad - Pradhikaran', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 4.5, baseDays: 3.5, trend: 'Improving' },
    { wardId: 'Ward 2', name: 'Smt. Seema Landge', area: 'Bhosari - Landewadi', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 4.2, baseDays: 4.2, trend: 'Improving' },
    { wardId: 'Ward 3', name: 'Shri. Ajit Kalbhor', area: 'Pimpri - Kalbhor Nagar', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 3.8, baseDays: 5.8, trend: 'Declining' },
    { wardId: 'Ward 4', name: 'Shri. Nilesh Wakadkar', area: 'Wakad - Thergaon', avatar: 'https://images.unsplash.com/photo-1542156822-6924d1a71aba?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 4.8, baseDays: 2.8, trend: 'Improving' },
    { wardId: 'Ward 5', name: 'Smt. Pooja Tathawade', area: 'Hinjawadi - Tathawade', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 4.6, baseDays: 3.1, trend: 'Improving' },
    { wardId: 'Ward 6', name: 'Shri. Vikram Akurdikar', area: 'Akurdi - Yamuna Nagar', avatar: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 4.0, baseDays: 4.5, trend: 'Stable' },
    { wardId: 'Ward 7', name: 'Smt. Shalini Gurav', area: 'Sangvi - Pimple Gurav', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 4.4, baseDays: 3.8, trend: 'Improving' },
    { wardId: 'Ward 8', name: 'Sri. Rahul Sectorwala', area: 'Nigdi - Sector 24', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 3.1, baseDays: 6.5, trend: 'Declining' },
    { wardId: 'Ward 9', name: 'Shri. Kiran Kiwalekar', area: 'Ravet - Kiwale', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 4.3, baseDays: 4.0, trend: 'Improving' },
    { wardId: 'Ward 10', name: 'Smt. Ashvini Rupeenagar', area: 'Talawade - Rupeenagar', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', baseSatisfaction: 4.1, baseDays: 4.8, trend: 'Stable' }
  ];

  // If viewing the report cards dashboard, render the interactive searchable grid
  if (viewingReportCards) {
    const filteredCop = CORPORATOR_PROFILES.filter(profile => {
      const q = corporatorSearchQuery.toLowerCase();
      return (
        profile.name.toLowerCase().includes(q) ||
        profile.wardId.toLowerCase().includes(q) ||
        profile.area.toLowerCase().includes(q)
      );
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans animate-fade-in" id="corporator-public-report-cards">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-4">
          <div className="space-y-1">
            <button
              onClick={() => {
                setViewingReportCards(false);
                setCorporatorSearchQuery('');
              }}
              className="inline-flex items-center text-[#003366] hover:text-orange-500 text-xs font-black uppercase tracking-wide cursor-pointer mb-2 space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Dashboard</span>
            </button>
            <h2 className="text-2xl md:text-3xl font-black text-[#003366] flex items-center">
              <Award className="w-8 h-8 mr-2 text-amber-500 animate-pulse" />
              PCMC Public Corporator Report Cards
            </h2>
            <p className="text-xs text-gray-500 font-medium font-sans">
              Live KPI efficiency tracking, citizen satisfaction rates, and grievance response times across Wakad, Chinchwad, Nigdi and all PCMC wards.
            </p>
          </div>

          <div className="flex bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 text-[10px] text-gray-500 font-bold uppercase tracking-wider h-fit">
            🔐 NO LOGIN REQUIRED &bull; CIVIC TRANSPARENCY
          </div>
        </div>

        {/* Search & Statistics Overview Row */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-center shadow-sm">
          <div className="w-full md:max-w-md relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Ward Number, Area Name or Corporator..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm"
              value={corporatorSearchQuery}
              onChange={(e) => setCorporatorSearchQuery(e.target.value)}
            />
            {corporatorSearchQuery && (
              <button
                onClick={() => setCorporatorSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex gap-4 text-center">
            <div className="bg-white px-4 py-2 rounded-xl border">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold font-sans">Total Wards</p>
              <h5 className="text-lg font-black text-[#003366]">10 Zones</h5>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold font-sans">Avg City Rating</p>
              <h5 className="text-lg font-black text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                4.2
              </h5>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border">
              <p className="text-[9px] uppercase tracking-widest text-[#003366] font-extrabold font-sans">SLA Compliance</p>
              <h5 className="text-lg font-black text-green-600">92.4%</h5>
            </div>
          </div>
        </div>

        {/* Interactive KPI Grid */}
        {filteredCop.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed rounded-3xl space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-xs font-black uppercase text-slate-700">No Corporators Found</h4>
            <p className="text-xs text-slate-400">Try checking the spelling or query another ward name.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCop.map((profile) => {
              // Compute dynamic actual complaints of this ward
              const wardComplaints = complaints.filter(c => 
                c.ward.toLowerCase().includes(profile.wardId.toLowerCase())
              );

              // 1. Total Complaints (with base offset to look like real system)
              const baseCount = profile.baseSatisfaction > 4.4 ? 18 : 34;
              const totalComplaints = wardComplaints.length + baseCount;

              // 2. Resolved counts
              const resolvedCount = wardComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length + Math.round(baseCount * (profile.baseSatisfaction / 5.0));
              const resolvedPercentage = Math.round((resolvedCount / totalComplaints) * 100);

              // 3. Stalled counts (highlight red if > 5)
              const realStalled = wardComplaints.filter(c => c.isStalled).length;
              const bonusStalled = profile.baseDays > 5.5 ? 6 : 2;
              const totalStalled = realStalled + bonusStalled;

              // 4. Reopened count
              const reopenCountActual = wardComplaints.filter(c => c.status === 'Reopened' || (c.reopenCount && c.reopenCount > 0)).length + (profile.baseDays > 5.5 ? 4 : 1);

              // 5. Satisfaction rating (average if dynamic exists, else fallback to base)
              const ratedComplaints = wardComplaints.filter(c => c.rating);
              const satisfactionRating = ratedComplaints.length > 0
                ? (ratedComplaints.reduce((acc, current) => acc + (current.rating || 0), 0) / ratedComplaints.length).toFixed(1)
                : profile.baseSatisfaction.toFixed(1);

              return (
                <div 
                  key={profile.wardId} 
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 hover:border-slate-300 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    
                    {/* Header info / Avatar */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                        <img 
                          src={profile.avatar} 
                          alt={profile.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                          {profile.wardId} &bull; {profile.area.split(' - ')[0]}
                        </span>
                        <h4 className="text-xs font-black text-slate-800 leading-normal">{profile.name}</h4>
                        <p className="text-[10px] text-slate-450 font-bold">{profile.area}</p>
                      </div>
                    </div>

                    {/* Progress Bar Resolved % */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center text-[10px] font-semibold">
                        <span className="text-slate-500">Ward Resolve Efficiency Rating</span>
                        <span className="text-green-700 font-extrabold">{resolvedPercentage}% Resolved</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${resolvedPercentage}%` }}
                          className={`h-full rounded-full transition-all ${
                            resolvedPercentage > 85 ? 'bg-green-600' : 'bg-orange-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Grid of details */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        <p className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Total Complaints</p>
                        <h5 className="text-sm font-black text-[#003366]">{totalComplaints} Active</h5>
                      </div>
                      
                      <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        <p className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Avg Resolution SLA</p>
                        <h5 className="text-xs font-black text-slate-800">{profile.baseDays} Days</h5>
                      </div>

                      {/* Stalled Count highlighted red if over 5 */}
                      <div className={`p-2 rounded-xl border transition-all ${
                        totalStalled >= 5 
                          ? 'bg-red-100/60 border-red-300 text-red-950 shadow-sm animate-pulse' 
                          : 'bg-slate-50/50 border-slate-100 text-slate-700'
                      }`}>
                        <p className={`text-[8px] uppercase font-semibold tracking-wider ${totalStalled >= 5 ? 'text-red-800' : 'text-slate-400'}`}>
                          Stalled Cases {totalStalled >= 5 ? '⚠️' : ''}
                        </p>
                        <h5 className={`text-xs font-black ${totalStalled >= 5 ? 'text-red-700 text-sm font-extrabold' : 'text-slate-800'}`}>
                          {totalStalled} Cases
                        </h5>
                      </div>

                      <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        <p className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Reopened Cases</p>
                        <h5 className="text-xs font-black text-rose-700">{reopenCountActual} Reopened</h5>
                      </div>
                    </div>

                    {/* Satisfaction and trend footer */}
                    <div className="flex justify-between items-center bg-amber-50/30 border border-amber-100 p-2.5 rounded-xl text-[11px] font-bold">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400 text-[10px] font-sans">Citizen satisfaction:</span>
                        <span className="text-[#002244] font-black underline flex items-center">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-0.5 shrink-0" />
                          {satisfactionRating}/5
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 uppercase tracking-widest text-[9px] font-black">
                        <span className="text-slate-400">Trend:</span>
                        <span className={`px-2 py-0.5 rounded ${
                          profile.trend === 'Improving' ? 'bg-green-150 text-green-800' : 'bg-red-105 bg-red-100 text-red-700'
                        }`}>
                          {profile.trend}
                        </span>
                      </div>
                    </div>

                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setViewingReportCards(false);
                        setCurrentRole('citizen');
                      }}
                      className="w-full bg-[#003366] hover:bg-blue-950 text-white font-extrabold text-[10.5px] py-2 rounded-xl cursor-pointer shadow transition-all uppercase tracking-wide text-center"
                    >
                      Inspect Ward Active Feed &rarr;
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
        
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20" id="pcmc-landing-page">
      
      {/* Dynamic Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#003366] via-[#002B52] to-[#002244] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 mt-6 border border-white/10 shadow-xl">
        {/* Background decorative patterns */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="flex-1 space-y-6 text-center md:text-left">
            <span className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span>PCMC Smart Governance Portal</span>
            </span>

            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Empowering Citizens,<br />
              <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
                Shaping Pimpri-Chinchwad
              </span>
            </h2>
            
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-xl">
              File complaints, track live resolutions, and engage directly with department administrators and ward corporators. PCMC Saarthi is your direct link to a cleaner, safer, and modern smart city.
            </p>

            <div className="flex flex-col xl:flex-row justify-center md:justify-start gap-4 pt-2">
              <button
                id="btn-hero-raise-complaint"
                onClick={onRaiseClick}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <ClipboardList className="w-5 h-5" />
                <span>Raise Civic Complaint</span>
              </button>
              
              <button
                id="btn-hero-citizen-portal"
                onClick={() => setCurrentRole('citizen')}
                className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-6 py-3.5 rounded-2xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Track Status in Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-hero-corporators"
                onClick={() => setViewingReportCards(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3.5 rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Corporator Report Cards</span>
              </button>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-6 pt-4 border-t border-white/10 text-xs text-gray-400">
              <span className="flex items-center"><Check className="w-4 h-4 text-green-400 mr-1.5" /> Auto-Location Geolocation</span>
              <span className="flex items-center"><Check className="w-4 h-4 text-green-400 mr-1.5" /> Department Escalation</span>
              <span className="flex items-center"><Check className="w-4 h-4 text-green-400 mr-1.5" /> Corporator Audits</span>
            </div>
          </div>

          {/* Saffron and Blue Dynamic Feature Overlay */}
          <div className="w-full md:w-80 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 space-y-4">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" /> Quick Citizen Quick-Links
            </h3>
            <div className="space-y-3">
              <div 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all flex items-start space-x-3 group"
                onClick={() => setCurrentRole('citizen')}
              >
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-orange-400 transition-colors">Citizen Panel</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Raise complaints, track timelines</p>
                </div>
              </div>

              <div 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all flex items-start space-x-3 group"
                onClick={() => setCurrentRole('admin')}
              >
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-orange-400 transition-colors">Department Admins</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Allocate cases, assign engineers</p>
                </div>
              </div>

              <div 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all flex items-start space-x-3 group"
                onClick={() => setCurrentRole('corporator')}
              >
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-300">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-orange-400 transition-colors">Corporator Portal</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Audit wards & solve stalled cases</p>
                </div>
              </div>

              <div 
                className="p-3 bg-white/10 hover:bg-white/15 rounded-xl border border-amber-500/30 cursor-pointer transition-all flex items-start space-x-3 group animate-pulse"
                onClick={() => setViewingReportCards(true)}
              >
                <div className="p-2 bg-amber-500 rounded-lg text-slate-950 animate-bounce">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-400 group-hover:text-orange-400 transition-colors flex items-center gap-1.5 font-sans">
                    Public Report Cards
                    <span className="bg-red-500 text-white font-sans text-[7.5px] font-black px-1.5 py-0.5 rounded">KPI</span>
                  </h4>
                  <p className="text-[10px] text-gray-300 mt-0.5 font-medium">View real Corporator KPI metrics & satisfaction ratings</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* City-Wide Complaint Stats */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="text-center md:text-left space-y-1">
          <h3 className="text-2xl font-black text-blue-900 tracking-tight flex items-center justify-center md:justify-start">
            <ClipboardList className="w-6 h-6 mr-2 text-orange-500" />
            PCMC Live Civic Metric Registry
          </h3>
          <p className="text-sm text-gray-500 font-medium">Real-time compiled data from across all 10 wards of Pimpri-Chinchwad</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-blue-900 mb-2">
              <span className="text-xs font-bold uppercase text-gray-400">Total Registered</span>
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><ClipboardList className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-blue-950 mt-1">{totalRaised.toLocaleString()}</p>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mt-2 inline-block">Cumulative Total</span>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-green-600 mb-2">
              <span className="text-xs font-bold uppercase text-gray-400">Successfully Resolved</span>
              <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-green-950 mt-1">{totalResolved.toLocaleString()}</p>
            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100 mt-2 inline-block">Redressal Complete</span>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-yellow-600 mb-2">
              <span className="text-xs font-bold uppercase text-gray-400">In Progress</span>
              <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-yellow-950 mt-1">{totalInProgress.toLocaleString()}</p>
            <span className="text-[10px] text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100 mt-2 inline-block">Actively Serviced</span>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-orange-600 mb-2">
              <span className="text-xs font-bold uppercase text-gray-400">Pending Review</span>
              <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-orange-950 mt-1">{totalUnderReview.toLocaleString()}</p>
            <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100 mt-2 inline-block font-sans">Awaiting Verification</span>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-blue-950 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-blue-200">Resolution Rate</span>
              <p className="text-3xl md:text-4xl font-black text-orange-400 tracking-tight mt-1">{resolutionRate}%</p>
            </div>
            <span className="text-[10px] text-orange-300 font-bold mt-2 bg-white/10 px-2 py-1 rounded inline-block text-center border border-white/5">Government Standard</span>
          </div>
        </div>
      </section>

      {/* Most Upvoted Issues This Week */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6" id="most-upvoted-section">
        <div className="text-center md:text-left space-y-1">
          <h3 className="text-2xl font-black text-blue-900 tracking-tight flex items-center justify-center md:justify-start">
            <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
            Most Upvoted Issues This Week (Community Verified)
          </h3>
          <p className="text-sm text-gray-500 font-medium">Top verified complaints flagged by residents across Pimpri-Chinchwad citywide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {verifiedComplaints.map((c) => {
            const hasBadge = (c.upvotes || 0) >= 10;
            return (
              <div 
                key={c.id} 
                className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 hover:border-orange-200 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 to-orange-500"></div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-900 font-mono">{c.id}</span>
                    <span className="bg-blue-50 text-[#003366] text-[9px] font-black px-2 py-0.5 rounded uppercase border border-blue-100">
                      {c.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-semibold line-clamp-3">
                    {c.description}
                  </p>

                  <div className="text-[10px] text-gray-500 font-bold space-y-1">
                    <p className="flex items-center text-slate-500">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-orange-500 shrink-0" />
                      {c.ward.split(' - ')[1] || c.ward}
                    </p>
                    <p className="text-[9px] text-slate-400">Lodged on: {new Date(c.dateCreated).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5 text-blue-950 font-black text-xs">
                    <Eye className="w-4 h-4 text-blue-800" />
                    <span>{c.upvotes || 0} Citizens Witnessed This</span>
                  </div>

                  {hasBadge ? (
                    <span className="bg-amber-100/90 text-amber-905 text-amber-900 border border-amber-250 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs font-sans">
                      🏅 Verified
                    </span>
                  ) : (
                    <span className="bg-blue-50/90 text-blue-900 border border-blue-100 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs font-sans">
                      🗳️ Supporting
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Grid: Group Scorecards & Leaderboard side-by-side for desktop layout density */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Department Scorecards (2 Columns wide) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-blue-900 tracking-tight flex items-center">
                <Building className="w-6 h-6 mr-2 text-blue-900" />
                Departmental Efficiency Ratings
              </h3>
              <p className="text-xs text-gray-500 font-medium">Monthly accountability ratings based on actual citizen resolution timelines</p>
            </div>

            <div className="space-y-4">
              {DEPARTMENT_SCORECARDS.map((dept, index) => {
                const percent = Math.round((dept.resolved / dept.total) * 100);
                return (
                  <div key={index} className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-gray-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2"></span>
                          {dept.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">PCMC Civil Infrastructure Unit</p>
                      </div>
                      
                      {/* Rating Label */}
                      <div className="flex items-center space-x-1.5 self-start bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-900">{dept.rating}</span>
                        <span className="text-[10px] text-amber-500 font-medium">(Score)</span>
                      </div>
                    </div>

                    {/* Progress Slider Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-semibold">{percent}% Resolved ({dept.resolved.toLocaleString()} / {dept.total.toLocaleString()})</span>
                        <span className="text-blue-900 font-bold bg-blue-50 px-1.5 py-0.5 rounded text-[10px] uppercase">Highly Stable</span>
                      </div>
                      {/* Bar Track */}
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-gradient-to-r from-blue-700 to-orange-500 h-full rounded-full" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Citizen Leaderboard Top 5 (1 Column wide) */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-blue-900 tracking-tight flex items-center">
                <Award className="w-6 h-6 mr-2 text-orange-500" />
                Citizen Leaderboard
              </h3>
              <p className="text-xs text-gray-500 font-medium">Top 5 community champions of Pimpri-Chinchwad this month</p>
            </div>

            <div className="bg-[#002B52] text-white rounded-2xl p-5 shadow-lg border border-slate-200/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 animate-pulse">Live Saarthi Ranking</span>
                <span className="text-xs text-blue-200 font-semibold flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-orange-400" /> June 2026</span>
              </div>

              <div className="space-y-3">
                {MONTHLY_LEADERBOARD.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/5 transition-all">
                    <div className="flex items-center space-x-3">
                      {/* Rank Indicator Badge */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        user.rank === 1 ? 'bg-amber-400 text-amber-950' : 
                        user.rank === 2 ? 'bg-slate-300 text-slate-900' :
                        user.rank === 3 ? 'bg-amber-700 text-amber-100' :
                        'bg-white/10 text-white'
                      }`}>
                        {user.rank}
                      </div>

                      {/* Photo */}
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-inner"
                        referrerPolicy="no-referrer"
                      />

                      <div>
                        <h4 className="text-xs font-bold leading-tight">{user.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{user.ward.replace(' - ', ', ')}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-orange-400">{user.points} pts</span>
                      <p className="text-[9px] text-green-400 font-bold mt-0.5">{user.complaintsResolved} resolved</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setCurrentRole('citizen')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-all text-xs text-center border-b-2 border-orange-700 active:border-b-0"
              >
                Earn Points — File Reports
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Citizen Heroes Section (Carousel) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-blue-900 tracking-tight flex items-center">
              <ThumbsUp className="w-6 h-6 mr-2 text-orange-500" />
              Citizen Heroes Spotlight
            </h3>
            <p className="text-xs text-gray-500 font-medium">Recognizing residents who actively partner with local ward engineers</p>
          </div>

          <div className="flex space-x-2">
            <button
              id="btn-hero-prev"
              onClick={prevHero}
              className="p-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              &larr; Prev
            </button>
            <button
              id="btn-hero-next"
              onClick={nextHero}
              className="p-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Next &rarr;
            </button>
          </div>
        </div>

        {/* Carousel Window */}
        <div className="relative overflow-hidden bg-orange-50/50 rounded-3xl border border-orange-100 p-6 md:p-10 shadow-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
            >
              <div className="relative shrink-0">
                <img
                  src={CITIZEN_HEROES[heroIndex].avatarUrl}
                  alt={CITIZEN_HEROES[heroIndex].name}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-white shadow-lg mx-auto"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white shadow uppercase tracking-wider whitespace-nowrap">
                  {CITIZEN_HEROES[heroIndex].badge}
                </span>
              </div>

              <div className="space-y-4 text-center md:text-left flex-1">
                <div className="space-y-1">
                  <h4 className="text-lg md:text-xl font-black text-blue-900">{CITIZEN_HEROES[heroIndex].name}</h4>
                  <p className="text-xs text-orange-600 font-bold flex items-center justify-center md:justify-start">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {CITIZEN_HEROES[heroIndex].ward}
                  </p>
                </div>

                <blockquote className="text-gray-600 italic text-sm md:text-base leading-relaxed relative font-medium">
                  "{CITIZEN_HEROES[heroIndex].quote}"
                </blockquote>

                <div className="flex items-center justify-center md:justify-start space-x-2 text-xs font-semibold text-blue-900 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-100 w-fit mx-auto md:ml-0">
                  <span className="text-green-600 font-bold">{CITIZEN_HEROES[heroIndex].resolutions} Complaints Resolved</span>
                  <span>&bull;</span>
                  <span>Active Member</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Helpful Civic Guide */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center py-8">
        <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-3xl max-w-3xl mx-auto space-y-4">
          <Landmark className="w-10 h-10 text-blue-900 mx-auto" />
          <h4 className="text-lg font-bold text-blue-950 font-sans">Official Ward Redressal SLA Guarantees</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            As a partner city of the Ministry of Urban Development, India, Pimpri-Chinchwad Municipal Corporation guarantees primary review within 48 hours and action within 7 business days for standard civic reports. Stall cases are highlighted to honorable corporators automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-blue-900 pt-2">
            <span className="bg-white border border-blue-100 px-3 py-1 rounded-lg shadow-sm">⚡ Electricity: 24h</span>
            <span className="bg-white border border-blue-100 px-3 py-1 rounded-lg shadow-sm">💧 Water Outage: 36h</span>
            <span className="bg-white border border-blue-100 px-3 py-1 rounded-lg shadow-sm">🚧 Potholes: 5 Days</span>
            <span className="bg-white border border-blue-100 px-3 py-1 rounded-lg shadow-sm">🧹 Garbage Accumulation: 24h</span>
          </div>
        </div>
      </section>

    </div>
  );
}
