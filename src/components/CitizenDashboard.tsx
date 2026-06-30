import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, CheckCircle, CheckCircle2, Clock, AlertTriangle, Search, Filter, MapPin, 
  ChevronRight, Calendar, User, Eye, Sparkles, Building, Info, FileText, Star,
  X
} from 'lucide-react';
import { Complaint, ComplaintStatus, ComplaintCategory } from '../types';
import { DEPARTMENTS } from '../data';

interface CitizenDashboardProps {
  complaints: Complaint[];
  citizenEmail: string;
  isLoggedIn: boolean;
  onRaiseClick: () => void;
  onLoginClick: () => void;
  onUpdateComplaint: (updated: Complaint) => void;
}

export default function CitizenDashboard({
  complaints,
  citizenEmail,
  isLoggedIn,
  onRaiseClick,
  onLoginClick,
  onUpdateComplaint
}: CitizenDashboardProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewTab, setViewTab] = useState<'my' | 'all'>('my');

  // Rating and comment feedback states
  const [ratingFeedbackOpen, setRatingFeedbackOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingCommentText, setRatingCommentText] = useState('');

  // Reopening states
  const [reopenPromptOpen, setReopenPromptOpen] = useState(false);
  const [reopenReasonText, setReopenReasonText] = useState('');

  const getUserWard = () => {
    if (!isLoggedIn || !citizenEmail) return null;
    const emailLower = citizenEmail.toLowerCase();
    if (emailLower.includes('amit.patil')) return 'Ward 4 - Wakad - Thergaon';
    if (emailLower.includes('sunita.joshi')) return 'Ward 8 - Nigdi - Sector 24';
    if (emailLower.includes('rahul.more')) return 'Ward 3 - Pimpri - Kalbhor Nagar';
    const myOwn = complaints.find(c => c.citizenEmail.toLowerCase() === emailLower);
    if (myOwn) return myOwn.ward;
    return 'Ward 4 - Wakad - Thergaon'; // Default fallback
  };

  const handleUpvote = (complaintId: string) => {
    if (!isLoggedIn) {
      alert('Please log in or select a quick-demo account to verify and upvote issues.');
      onLoginClick();
      return;
    }

    const complaintToUpvote = complaints.find(c => c.id === complaintId);
    if (!complaintToUpvote) return;

    if (complaintToUpvote.citizenEmail.toLowerCase() === citizenEmail.toLowerCase()) {
      alert('You cannot verify/upvote your own lodging ticket! Ask other ward residents to verify it.');
      return;
    }

    const activeWard = getUserWard();
    if (activeWard && complaintToUpvote.ward.toLowerCase() !== activeWard.toLowerCase()) {
      alert(`You can only upvote/verify issues within your own residential ward (${activeWard})! Switch to another demo user to upvote in different wards.`);
      return;
    }

    const currentUpvoters = complaintToUpvote.upvoters || [];
    if (currentUpvoters.includes(citizenEmail)) {
      alert('You have already verified and upvoted this complaint!');
      return;
    }

    // Upvote is valid! Add to list
    const updatedUpvoters = [...currentUpvoters, citizenEmail];
    const updatedUpvotesCount = (complaintToUpvote.upvotes || 0) + 1;

    // Create history event
    const newEvent = {
      id: `ev-upv-${Date.now()}`,
      status: 'Remark Added' as const,
      title: 'Citizen Verification Received',
      description: `Citizen verified this issue. Total signatures of support: ${updatedUpvotesCount}.`,
      date: new Date().toISOString(),
      actor: 'Public Citizen',
    };

    const updatedComplaint: Complaint = {
      ...complaintToUpvote,
      upvotes: updatedUpvotesCount,
      upvoters: updatedUpvoters,
      history: [...complaintToUpvote.history, newEvent],
      dateUpdated: new Date().toISOString(),
    };

    onUpdateComplaint(updatedComplaint);

    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint(updatedComplaint);
    }
  };

  const handleSumbitResolutionRating = () => {
    if (!selectedComplaint) return;
    
    const updated: Complaint = {
      ...selectedComplaint,
      status: 'Closed',
      rating: ratingValue,
      ratingComment: ratingCommentText || undefined,
      dateUpdated: new Date().toISOString(),
      history: [
        ...selectedComplaint.history,
        {
          id: 'ev-rating-' + Date.now(),
          status: 'Closed',
          title: 'Case Closed Permanently',
          description: `Citizen rated resolution of the issue as ${ratingValue}/5. Comment: "${ratingCommentText || 'No comment provided'}"`,
          date: new Date().toISOString(),
          actor: 'Citizen'
        }
      ]
    };
    
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
    setRatingFeedbackOpen(false);
    setRatingCommentText('');
  };

  const handleReopenComplaintSubmit = () => {
    if (!selectedComplaint) return;
    if (!reopenReasonText.trim()) {
      alert('Please provide a short reason explaining what is still not fixed.');
      return;
    }

    const currentReopenCount = (selectedComplaint.reopenCount || 0) + 1;
    
    const updated: Complaint = {
      ...selectedComplaint,
      status: 'Reopened',
      reopenCount: currentReopenCount,
      reopenReason: reopenReasonText,
      // Backup the active resolution details so we can inspect original details
      originalResolutionDate: selectedComplaint.actualResolutionDate,
      originalResolutionProofUrl: selectedComplaint.resolutionProofUrl,
      originalResolutionDescription: selectedComplaint.resolutionDescription,
      
      // Keep actual resolution empty for engineer correction
      actualResolutionDate: undefined,
      resolutionProofUrl: undefined,
      resolutionDescription: undefined,
      
      dateUpdated: new Date().toISOString(),
      history: [
        ...selectedComplaint.history,
        {
          id: 'ev-reopen-' + Date.now(),
          status: 'Reopened',
          title: `Reopened by Citizen (Reopen #${currentReopenCount})`,
          description: `Citizen marked issue as "Not Fixed": "${reopenReasonText}"`,
          date: new Date().toISOString(),
          actor: 'Citizen'
        }
      ]
    };

    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
    setReopenPromptOpen(false);
    setReopenReasonText('');
  };

  // Filter complaints based on tab and filters
  const filtered = complaints.filter(c => {
    // Tab filtering
    if (viewTab === 'my') {
      if (!isLoggedIn) return false; // Show nothing if not logged in on "My" tab
      if (c.citizenEmail.toLowerCase() !== citizenEmail.toLowerCase()) return false;
    }

    // Category filtering
    if (filterCategory !== 'All' && c.category !== filterCategory) return false;

    // Search query filtering
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchLandmark = c.landmark.toLowerCase().includes(q);
      const matchAddress = c.address.toLowerCase().includes(q);
      return matchId || matchDesc || matchLandmark || matchAddress;
    }

    return true;
  });

  // Calculate quick metrics (for logged in citizen or all based on state)
  const myComplaints = complaints.filter(c => c.citizenEmail.toLowerCase() === citizenEmail.toLowerCase());
  const displaySource = isLoggedIn && viewTab === 'my' ? myComplaints : complaints;

  const total = displaySource.length;
  const resolved = displaySource.filter(c => c.status === 'Resolved').length;
  const inProgress = displaySource.filter(c => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Under Review').length;
  const submitted = displaySource.filter(c => c.status === 'Submitted').length;

  const categories: ComplaintCategory[] = [
    'Roads', 'Water', 'Electricity', 'Garbage', 'Drainage', 
    'Encroachment', 'Traffic', 'Environment', 'Fire', 'Health'
  ];

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted': return 'bg-orange-100 text-orange-850 border-orange-200';
      case 'Under Review': return 'bg-yellow-100 text-yellow-850 border-yellow-250';
      case 'Assigned': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Resolved': return 'bg-green-150 text-green-850 border-green-250';
      case 'Rejected': return 'bg-red-100 text-red-850 border-red-200';
      case 'Reopened': return 'bg-red-100 text-red-950 border-red-300 font-extrabold';
      case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-350 font-bold';
      default: return 'bg-gray-150 text-gray-800 border-gray-200';
    }
  };

  const getTimelineStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      case 'Rejected': return -1; // Special negative hand-off
      default: return 0;
    }
  };

  const timelineSteps = [
    { label: 'Register', desc: 'Case logged on portal' },
    { label: 'Review', desc: 'Admin checking department' },
    { label: 'Assign', desc: 'SLA Ward Engineer nominated' },
    { label: 'Fix In Progress', desc: 'Active physical clearance/repair' },
    { label: 'Resolved', desc: 'Citizen approval & photo proof' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans" id="citizen-dashboard">
      
      {/* Welcome Bar / Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-[#003366] via-[#002B52] to-[#002244] p-6 rounded-2xl border border-white/10 shadow-lg text-white">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black flex items-center">
            <Sparkles className="w-5.5 h-5.5 mr-2 text-orange-400" />
            Namaskar, {isLoggedIn ? citizenEmail.split('@')[0].toUpperCase() : 'Guest Citizen'}
          </h2>
          <p className="text-xs text-blue-200 font-medium font-sans">
            {isLoggedIn 
              ? 'You are active in the Pimpri-Chinchwad citizen council. Raise issues to improve your locality.'
              : 'Sign in to access secure dashboard tools, earn points, and file official civic complaints.'
            }
          </p>
          {isLoggedIn && (
            <div className="pt-1.5">
              <span className="inline-flex items-center bg-white/10 border border-white/10 text-orange-305 text-orange-300 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg">
                📍 Verified Ward Jurisdiction: {getUserWard()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {(!isLoggedIn) ? (
            <button
              id="citizen-btn-login"
              onClick={onLoginClick}
              className="bg-white text-blue-900 hover:bg-gray-100 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow cursor-pointer"
            >
              Configure Account / Login
            </button>
          ) : (
            <button
              id="citizen-btn-raise"
              onClick={onRaiseClick}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Civic Complaint</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Indexed Complaints</p>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-black text-[#003366]">{total}</span>
            <span className="text-xs font-semibold text-slate-400">active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-green-600">Redressed & Solved</p>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-black text-green-700">{resolved}</span>
            <span className="text-xs font-semibold text-green-500 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> {total > 0 ? Math.round((resolved/total)*100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-purple-600">In Active Repairs</p>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-black text-purple-700">{inProgress}</span>
            <span className="text-xs font-semibold text-slate-400">assigned</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-orange-500 font-sans">Unassigned New</p>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-black text-orange-600">{submitted}</span>
            <span className="text-xs font-semibold text-slate-400 font-sans font-medium">queue</span>
          </div>
        </div>
      </div>

      {/* Main Grid: List is left (2 cols) and Active Timeline Detail is right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Complaints Listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            {/* Tab Selection */}
            <div className="flex bg-slate-100 p-1 rounded-full w-fit border border-slate-200">
              <button
                id="tab-my-complaints"
                onClick={() => setViewTab('my')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  viewTab === 'my'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-orange-500'
                }`}
              >
                My Complaints ({myComplaints.length})
              </button>
              <button
                id="tab-all-complaints"
                onClick={() => setViewTab('all')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  viewTab === 'all'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-orange-500'
                }`}
              >
                Ward Public Feed ({complaints.length})
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <select
                id="select-filter-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 px-2.5 py-1.5 outline-none focus:border-orange-500"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              id="citizen-search-complaints"
              placeholder="Search reports by description, id, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 border-b-2"
            />
          </div>

          {/* Complaints Feed List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-3xl p-10 text-center space-y-3">
                <Info className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">No complaints index matches filter</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {viewTab === 'my' && !isLoggedIn 
                    ? 'Please log in to view your filed complaints feed.' 
                    : 'Try clearing search tags or category filters to find registered cases.'}
                </p>
                {!isLoggedIn && viewTab === 'my' && (
                  <button
                    onClick={onLoginClick}
                    className="bg-blue-900 text-white text-xs px-3.5 py-2 rounded-xl font-bold"
                  >
                    Click to Sign In
                  </button>
                )}
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    id={`complaint-card-${c.id}`}
                    onClick={() => setSelectedComplaint(c)}
                    className={`bg-white border rounded-2xl p-4 transition-all shadow-sm cursor-pointer hover:shadow hover:border-slate-300 flex flex-col sm:flex-row gap-4 items-start ${
                      isSelected ? 'ring-2 ring-orange-500 border-transparent bg-slate-50/50' : 'border-slate-250'
                    }`}
                  >
                    {/* Thumbnail Preview */}
                    <div className="shrink-0 w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-150 relative">
                      {c.imageUrl ? (
                        <img 
                          src={c.imageUrl} 
                          alt={c.category} 
                          className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                          referrerPolicy="no-referrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalImage(c.imageUrl);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                          <FileText className="w-6 h-6" />
                          <span className="text-[8px] font-bold uppercase mt-1">No Image</span>
                        </div>
                      )}
                      
                      {/* Category Label Overlay */}
                      <span className="absolute bottom-1 left-1 bg-blue-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded border border-blue-950/20 uppercase">
                        {c.category}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-blue-900">{c.id}</span>
                          <span className="text-gray-300 text-xs font-medium">|</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{c.ward.split(' - ')[1] || c.ward}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {c.reopenCount && c.reopenCount > 0 && (
                            <span className="bg-red-200 text-red-950 px-2 py-0.5 rounded text-[9px] font-black animate-pulse flex items-center">
                              🚨 REOPENED x{c.reopenCount}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(c.status)}`}>
                            {c.rating ? `⭐ ${c.rating} — ${c.status}` : c.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed font-medium line-clamp-2">
                        {c.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-1">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-orange-500" />
                          Landmark: {c.landmark || 'Not provided'}
                        </span>
                        <span className="text-[9px] text-gray-400">{new Date(c.dateCreated).toLocaleDateString()}</span>
                      </div>

                      {/* Community verification block */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 mt-2 flex-wrap">
                        <div className="flex items-center space-x-1.5 text-[10.5px] text-[#003366] font-bold">
                          <Eye className="w-3.5 h-3.5 text-blue-800" />
                          <span>{c.upvotes || 0} citizens verified this</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {(c.upvotes || 0) >= 10 && (
                            <span className="bg-amber-100/80 text-amber-900 border border-amber-200 text-[8.5px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                              🏅 Verified
                            </span>
                          )}

                          <button
                            id={`btn-upvote-${c.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpvote(c.id);
                            }}
                            className={`px-2.5 py-1 text-[9px] font-black border uppercase tracking-wider rounded-lg flex items-center space-x-1 cursor-pointer transition-all ${
                              isLoggedIn && c.upvoters?.includes(citizenEmail)
                                ? 'bg-green-105 text-green-800 border-green-300'
                                : 'bg-[#003366] hover:bg-orange-500 hover:border-orange-500 text-white border-[#003366] shadow-xs'
                            }`}
                          >
                            <span>👁️ I See This Too</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex self-center text-gray-400 hover:text-blue-900">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Status Redressal Timeline details */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
            {selectedComplaint ? (
              <div className="space-y-6" id={`detail-${selectedComplaint.id}`}>
                
                {/* ID Header Card */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider font-mono">Token Receipt ID</span>
                    <h3 className="text-base font-black text-blue-950">{selectedComplaint.id}</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Auto Department: {selectedComplaint.category} (PCMC)</p>
                  </div>
                  
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.rating ? `⭐ ${selectedComplaint.rating} — ${selectedComplaint.status}` : selectedComplaint.status}
                  </span>
                </div>

                {/* Community Verification Progress Info */}
                <div className="bg-slate-50 border border-slate-205 border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs flex-wrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-blue-900 font-extrabold uppercase text-[10px] tracking-wider">
                      <Eye className="w-3.5 h-3.5 text-orange-500" />
                      <span>Community Verification</span>
                    </div>
                    <p className="text-[11px] text-slate-655 text-slate-700 font-bold">
                      {selectedComplaint.upvotes || 0} residents verified this
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(selectedComplaint.upvotes || 0) >= 10 && (
                      <span className="bg-amber-100/90 text-amber-955 text-amber-900 border border-amber-250 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        🏅 Verified State
                      </span>
                    )}

                    <button
                      id={`btn-upvote-detail-${selectedComplaint.id}`}
                      onClick={() => handleUpvote(selectedComplaint.id)}
                      className={`px-3 py-1.5 text-[10px] font-black border uppercase tracking-wider rounded-lg flex items-center space-x-1 cursor-pointer transition-all ${
                        isLoggedIn && selectedComplaint.upvoters?.includes(citizenEmail)
                          ? 'bg-green-150 text-green-950 border-green-300'
                          : 'bg-[#003366] hover:bg-orange-500 hover:border-orange-500 text-white border-[#003366]'
                      }`}
                    >
                      <span>👁️ I See This Too</span>
                    </button>
                  </div>
                </div>

                {/* Photo frame */}
                {selectedComplaint.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
                    <img 
                      src={selectedComplaint.imageUrl} 
                      alt="Complaint snapshot" 
                      className="w-full h-44 object-cover cursor-zoom-in hover:opacity-90 transition-opacity" 
                      referrerPolicy="no-referrer"
                      onClick={() => setActiveModalImage(selectedComplaint.imageUrl)}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <span className="text-white text-[10px] font-semibold flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-orange-400 animate-bounce" />
                        {selectedComplaint.address}
                      </span>
                    </div>
                  </div>
                )}

                {/* Basic location context if no image path */}
                {!selectedComplaint.imageUrl && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-xs text-gray-600 flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold">Registered Address: </span>
                      {selectedComplaint.address}
                    </div>
                  </div>
                )}

                {/* Complaint Details Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-blue-950 uppercase tracking-wide">Citizen Incident Report</h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Assigned engineer details and Corporator Remarks if applicable */}
                <div className="space-y-3 pt-1">
                  {selectedComplaint.assignedEngineer && (
                    <div className="p-3.5 bg-blue-50/70 border border-blue-150 rounded-xl space-y-2 text-xs">
                      <div className="flex items-start space-x-2.5">
                        <User className="w-4.5 h-4.5 text-blue-700 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-bold text-blue-900">PCMC Ward Engineer Allocated</h5>
                          <p className="text-gray-650 font-medium text-[11px]">{selectedComplaint.assignedEngineer}</p>
                        </div>
                      </div>

                      {/* Estimated Completion Date Notice */}
                      {selectedComplaint.estimatedResolutionDate ? (
                        <div className="bg-purple-100 border border-purple-200 p-2.5 rounded-lg flex items-center space-x-1.5 text-purple-950 font-semibold animate-pulse">
                          <Calendar className="w-4 h-4 text-purple-700" />
                          <span>Est. Completion SLA: {new Date(selectedComplaint.estimatedResolutionDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <div className="bg-orange-50 border border-orange-100 p-2 rounded-lg text-[10px] text-orange-700 font-bold">
                          ⏳ Waiting for engineer to visit the physical site and schedule estimated completion.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resolution Proof Summary (If submitted or approved) */}
                  {(selectedComplaint.status === 'Resolution Pending Approval' || selectedComplaint.status === 'Resolved') && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-xs">
                      <h5 className="font-bold text-emerald-900 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Field Resolution Report & Proof</span>
                      </h5>
                      
                      {selectedComplaint.resolutionProofUrl && (
                        <div className="rounded-lg overflow-hidden border border-emerald-150">
                          <img 
                            src={selectedComplaint.resolutionProofUrl} 
                            alt="Resolution Proof Proof" 
                            className="w-full h-28 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                            referrerPolicy="no-referrer"
                            onClick={() => setActiveModalImage(selectedComplaint.resolutionProofUrl)}
                          />
                        </div>
                      )}

                      <div className="bg-white p-2.5 rounded-lg border border-emerald-100 italic text-[11px] text-gray-700 leading-relaxed font-mono">
                        &ldquo;{selectedComplaint.resolutionDescription || 'The municipal repair work has been completed.'}&rdquo;
                      </div>

                      {selectedComplaint.actualResolutionDate && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          Actual Resolution Date: {new Date(selectedComplaint.actualResolutionDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Citizen Resolution Confirmation Check */}
                  {selectedComplaint.status === 'Resolved' && !selectedComplaint.rating && (
                    <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl space-y-3.5 shadow-md">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-0.5">
                          <h5 className="font-extrabold text-[#003366] text-xs">PCMC Grievance Resolution Check</h5>
                          <p className="text-[11px] text-gray-700 font-bold">
                            PCMC has marked this resolved. Is your issue fixed?
                          </p>
                        </div>
                      </div>

                      {!ratingFeedbackOpen && !reopenPromptOpen && (
                        <div className="flex items-center space-x-3 pt-1">
                          <button
                            onClick={() => {
                              setRatingFeedbackOpen(true);
                              setReopenPromptOpen(false);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow"
                          >
                            <span>✅ Yes, Fixed</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setReopenPromptOpen(true);
                              setRatingFeedbackOpen(false);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow"
                          >
                            <span>❌ No, Still Not Fixed</span>
                          </button>
                        </div>
                      )}

                      {/* Yes, Fixed: 5-Star Satisfaction + Optional Comment Form */}
                      {ratingFeedbackOpen && (
                        <div className="bg-white p-3.5 rounded-xl border border-orange-100 space-y-3 animate-fade-in">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">How satisfied are you with this resolution?</p>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRatingValue(star)}
                                  className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      star <= ratingValue
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700 font-sans">Optional Closure Remark:</p>
                            <textarea
                              placeholder="Type any additional feedback or appreciation for the department..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs h-16 outline-none focus:border-orange-500"
                              value={ratingCommentText}
                              onChange={(e) => setRatingCommentText(e.target.value)}
                            />
                          </div>

                          <div className="flex items-center space-x-2 pt-1 font-bold">
                            <button
                              onClick={handleSumbitResolutionRating}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer"
                            >
                              Submit & Close Complaint Permanently
                            </button>
                            <button
                              onClick={() => setRatingFeedbackOpen(false)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2.5 rounded-xl cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* No, Still Not Fixed: Reopen Reason Form */}
                      {reopenPromptOpen && (
                        <div className="bg-white p-3.5 rounded-xl border border-orange-100 space-y-3 animate-fade-in">
                          <div className="space-y-1 bg-red-50/50 p-2 border border-red-100 rounded-lg text-xs font-semibold text-red-800">
                            🚨 High priority escalation: Reopening this complaint will notify honorable Ward Corporator and flag it back to Department Admins queue highlighted.
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">Describe what is still pending or not fixed: *</p>
                            <textarea
                              required
                              placeholder="Explain exactly why the resolution is incomplete so engineers can adjust repair logic..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs h-18 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              value={reopenReasonText}
                              onChange={(e) => setReopenReasonText(e.target.value)}
                            />
                          </div>

                          <div className="flex items-center space-x-2 pt-1 font-bold">
                            <button
                              onClick={handleReopenComplaintSubmit}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer"
                            >
                              Confirm Reopen & Notify Corporator
                            </button>
                            <button
                              onClick={() => {
                                setReopenPromptOpen(false);
                                setReopenReasonText('');
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2.5 rounded-xl cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedComplaint.corporatorRemarks && selectedComplaint.corporatorRemarks.length > 0 && (
                    <div className="p-3.5 bg-orange-50/50 border border-orange-100 rounded-xl space-y-2 text-xs">
                      <h5 className="font-bold text-orange-800 flex items-center">
                        <Building className="w-4 h-4 mr-1.5" />
                        Honorable Corporator Remarks
                      </h5>
                      <div className="space-y-2 pl-1">
                        {selectedComplaint.corporatorRemarks.map((rem, idx) => {
                          const text = typeof rem === 'string' ? rem : rem.remark;
                          const dateStr = typeof rem === 'string' 
                            ? '' 
                            : new Date(rem.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                          return (
                            <div key={idx} className="border-b border-orange-100/60 pb-1.5 last:border-0 last:pb-0">
                              <p className="text-gray-700 leading-relaxed text-[11px] italic">
                                &ldquo;{text}&rdquo;
                              </p>
                              {dateStr && (
                                <span className="block text-[9px] text-orange-700 font-semibold font-mono mt-0.5">
                                  Issued on: {dateStr}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedComplaint.status === 'Rejected' && selectedComplaint.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs space-y-1 text-red-800">
                      <h5 className="font-bold flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1.5" />
                        Rejection Grounds & Advisory
                      </h5>
                      <p className="text-[11px] leading-relaxed italic">&ldquo;{selectedComplaint.rejectionReason}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Live Status Redressal Timeline Progress flow */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black text-blue-950 uppercase tracking-wide flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-blue-900" />
                    Complaints Redressal Timeline
                  </h4>

                  {/* Rejected specific view */}
                  {selectedComplaint.status === 'Rejected' ? (
                    <div className="border border-red-100 bg-red-50/20 p-4 rounded-xl space-y-2 text-center text-xs">
                      <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
                      <h5 className="font-bold text-red-950">Record Terminated / Closed</h5>
                      <p className="text-[11px] text-gray-500">
                        This complaint failed validation. Review the official grounds above. Please correct fields and lodge a new ticket if needed.
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:inset-y-1 before:left-2 before:w-0.5 before:bg-gray-200">
                      
                      {/* Step lines dynamic progression */}
                      {selectedComplaint.history.map((h, i) => {
                        const eventDate = new Date(h.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div key={h.id || i} className="relative text-xs">
                            {/* Bullet dot */}
                            <div className="absolute -left-6 shrink-0 w-4 h-4 rounded-full bg-blue-900 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold shadow-sm z-10">
                              {i + 1}
                            </div>
                            
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between text-gray-500 font-semibold mb-0.5">
                                <span className="text-blue-950 font-bold text-xs">{h.title}</span>
                                <span className="text-[9px] text-gray-400">{eventDate}</span>
                              </div>
                              <p className="text-gray-500 text-[11px] leading-relaxed">{h.description}</p>
                              {h.actor && (
                                <span className="inline-block text-[9px] text-orange-600 bg-orange-50 font-bold px-1.5 py-0.2 rounded border border-orange-100">
                                  Actor: {h.actor}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <FileText className="w-12 h-12 text-gray-300" />
                <h4 className="text-xs font-black text-gray-600 uppercase tracking-wider">Select Complaint Record</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Choose any registered case card from the citizen feed list to examine photo audit proofs, allocated zone engineers, and the live SLA timeline.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Global Image Zoom Modal */}
      {activeModalImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setActiveModalImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => setActiveModalImage(null)} 
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={activeModalImage} 
              alt="Full-size evidence" 
              className="w-full max-h-[80vh] object-contain rounded-xl" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

    </div>
  );
}
