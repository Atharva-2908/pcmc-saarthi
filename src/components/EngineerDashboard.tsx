import React, { useState } from 'react';
import { 
  Wrench, Check, Clock, MapPin, Calendar, Camera, AlertTriangle, 
  ChevronRight, Eye, CheckCircle2, User, RefreshCw, FileText, Map, List,
  X
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { ENGINEERS } from '../data';

interface EngineerDashboardProps {
  complaints: Complaint[];
  onUpdateComplaint: (updated: Complaint) => void;
}

const PRIORITY_SORT_ORDER = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

export default function EngineerDashboard({ complaints, onUpdateComplaint }: EngineerDashboardProps) {
  // Let the user switch between different testing profiles easily
  const [selectedEngineer, setSelectedEngineer] = useState<string>(ENGINEERS[2]); // Default Priya Kulkarni
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  
  // Input form states
  const [estDate, setEstDate] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resProofUrl, setResProofUrl] = useState('');
  const [resActualDate, setResActualDate] = useState('');
  
  // Dashboard view toggle (split list, reopened list, or fullscreen map)
  const [tabView, setTabView] = useState<'list' | 'reopened' | 'map'>('list');

  // Interactive uploader states
  const [dragActive, setDragActive] = useState(false);
  const handleProofFileChange = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setResProofUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter complaints assigned to this engineer (excluding reopened or resolved/closed)
  const regularComplaints = complaints.filter(
    (c) => c.assignedEngineer === selectedEngineer && 
           c.status !== 'Resolved' && 
           c.status !== 'Rejected' && 
           c.status !== 'Closed' &&
           c.status !== 'Reopened'
  );

  // Filter reopened complaints assigned to this engineer
  const reopenedComplaints = complaints.filter(
    (c) => c.assignedEngineer === selectedEngineer && c.status === 'Reopened'
  );

  // Sorted by Priority (Critical first)
  const sortedComplaints = [...regularComplaints].sort((a, b) => {
    const orderA = PRIORITY_SORT_ORDER[a.priority || 'Low'];
    const orderB = PRIORITY_SORT_ORDER[b.priority || 'Low'];
    return orderA - orderB;
  });

  const sortedReopenedComplaints = [...reopenedComplaints].sort((a, b) => {
    const orderA = PRIORITY_SORT_ORDER[a.priority || 'Low'];
    const orderB = PRIORITY_SORT_ORDER[b.priority || 'Low'];
    return orderA - orderB;
  });

  const getPriorityBadge = (priority?: 'Low' | 'Medium' | 'High' | 'Critical') => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-900 border-red-200 font-extrabold';
      case 'High':
        return 'bg-orange-100 text-orange-950 border-orange-200 font-bold';
      case 'Medium':
        return 'bg-yellow-105 bg-yellow-100 text-yellow-950 border-yellow-250 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-normal';
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'Assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Resolution Pending Approval': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Action: Set Estimated Resolution Date
  const handleSetEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !estDate) return;

    const updated: Complaint = {
      ...selectedComplaint,
      status: 'In Progress', // Setting an estimate shifts it actively to In Progress
      estimatedResolutionDate: estDate,
      dateUpdated: new Date().toISOString(),
      history: [
        ...selectedComplaint.history,
        {
          id: `ev-eng-est-${Date.now()}`,
          status: 'In Progress',
          title: 'Estimated Resolution Set',
          description: `Field Engineer scheduled completion target for: ${new Date(estDate).toLocaleDateString()}. Citizen has been alerted.`,
          date: new Date().toISOString(),
          actor: selectedEngineer,
        }
      ]
    };

    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
    setEstDate('');
  };

  // Action: Submit Resolution details
  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !resDesc.trim() || !resActualDate) return;

    // Default resolution image if citizen/engineer did not provide online link
    const finalProofUrl = resProofUrl.trim() || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop';

    const updated: Complaint = {
      ...selectedComplaint,
      status: 'Resolution Pending Approval',
      resolutionDescription: resDesc,
      resolutionProofUrl: finalProofUrl,
      actualResolutionDate: resActualDate,
      dateUpdated: new Date().toISOString(),
      history: [
        ...selectedComplaint.history,
        {
          id: `ev-eng-res-${Date.now()}`,
          status: 'Resolution Submitted',
          title: 'On-site Resolution Submitted',
          description: `Work finished. Submitted proof for municipal audit approval. Comments: "${resDesc}"`,
          date: new Date().toISOString(),
          actor: selectedEngineer,
        }
      ]
    };

    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
    // Clear forms
    setResDesc('');
    setResProofUrl('');
    setResActualDate('');
  };

  const loadUnsplashPresetProof = (presetType: string) => {
    const urls: { [key: string]: string } = {
       roads: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
       pipes: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop',
       electricity: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=600&auto=format&fit=crop',
       general: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop'
    };
    setResProofUrl(urls[presetType] || urls.general);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans animate-fade-in" id="engineer-dashboard">
      
      {/* Top Identity Header bar */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 shadow-xl text-white flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase tracking-widest">
            <Wrench className="w-4 h-4 text-orange-400 rotate-45 animate-pulse" />
            <span>MUNICIPAL TECHNICAL FORCE</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center mt-1">
            PCMC On-Site Engineer Portal
          </h2>
          <p className="text-xs text-slate-300 font-medium">Coordinate on-field repair milestones, upload resolution proof logs, and satisfy citizen SLAs.</p>
        </div>

        {/* Selected Field Operator credential switcher */}
        <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-1.5 self-start">
          <label className="block text-[10px] text-orange-300 font-extrabold uppercase tracking-widest">Active Identity (Testing Switch)</label>
          <select
            id="engineer-identity-selector"
            value={selectedEngineer}
            onChange={(e) => {
              setSelectedEngineer(e.target.value);
              setSelectedComplaint(null);
            }}
            className="bg-slate-950 text-white border border-white/20 pr-8 pl-3 py-1.5 text-xs font-black rounded-lg cursor-pointer outline-none focus:border-orange-400"
          >
            {ENGINEERS.map(eng => {
              const engCount = complaints.filter(c => c.assignedEngineer === eng && c.status !== 'Resolved' && c.status !== 'Rejected').length;
              return (
                <option key={eng} value={eng}>
                  👷 {eng.split(' (')[0]} ({engCount} Active Tasks)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Grid containing Interactive Main List & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Complaint Assignment Feeds */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-205 pb-3">
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button
                onClick={() => setTabView('list')}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-full transition-all cursor-pointer flex items-center space-x-1 ${
                  tabView === 'list' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-slate-600 hover:text-orange-500'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Duty Assignment Sheet ({sortedComplaints.length})</span>
              </button>
              
              <button
                onClick={() => setTabView('reopened')}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-full transition-all cursor-pointer flex items-center space-x-1 ${
                  tabView === 'reopened' 
                    ? 'bg-red-600 text-white shadow' 
                    : 'text-slate-600 hover:text-red-500'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span>Reopened Cases ({sortedReopenedComplaints.length})</span>
              </button>

              <button
                onClick={() => setTabView('map')}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-full transition-all cursor-pointer flex items-center space-x-1 ${
                  tabView === 'map' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-slate-600 hover:text-orange-500'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>SLA Location Plot</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Sorted by Priority (Critical First)
            </div>
          </div>

          {/* Condition components */}
          {tabView === 'list' ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {sortedComplaints.length === 0 ? (
                <div className="bg-white border rounded-2xl p-10 text-center text-slate-450 space-y-3">
                  <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">All Clear! Duty Sheet Empty</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    There are no unresolved complaints assigned to you for {selectedEngineer.split(' (')[0]}. New tickets assigned by admins will appear here instantly.
                  </p>
                </div>
              ) : (
                sortedComplaints.map((c) => {
                  const isSelected = selectedComplaint?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      id={`engineer-card-${c.id}`}
                      onClick={() => setSelectedComplaint(c)}
                      className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:border-slate-300 flex gap-4 ${
                        isSelected 
                          ? 'ring-2 ring-orange-500 border-transparent bg-slate-50/50' 
                          : 'border-slate-200 shadow-sm'
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="shrink-0 w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border">
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
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Eye className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Content block */}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-800">{c.id}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5 font-mono">[{c.category}]</span>
                          </div>
                          
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusColor(c.status)}`}>
                              {c.status}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(c.priority)}`}>
                              {c.priority || 'Low'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                            {c.ward.split(' - ')[1] || c.ward}
                          </span>
                          
                          {c.estimatedResolutionDate ? (
                            <span className="text-purple-650 flex items-center">
                              <Calendar className="w-3 h-3 mr-0.5 text-purple-600" />
                              Est: {new Date(c.estimatedResolutionDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-orange-500 font-bold animate-pulse flex items-center">
                              ⚠️ Action Pending: Set ETA
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="self-center text-slate-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : tabView === 'reopened' ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 animate-fade-in">
              {sortedReopenedComplaints.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-450 space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-200">
                    <Check className="w-6 h-6 text-green-600 animate-bounce" />
                  </div>
                  <h4 className="text-xs font-extrabold text-green-700 uppercase tracking-widest">No Reopened Cases!</h4>
                  <p className="text-xs text-slate-450 max-w-sm mx-auto">
                    Outstanding SLA! Citizens in your assigned zone are fully satisfied with all repaired works. Keep up the high rating!
                  </p>
                </div>
              ) : (
                sortedReopenedComplaints.map((c) => {
                  const isSelected = selectedComplaint?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      id={`engineer-card-${c.id}`}
                      onClick={() => setSelectedComplaint(c)}
                      className={`bg-white border-2 rounded-2xl p-4 cursor-pointer transition-all hover:border-red-400 flex gap-4 ${
                        isSelected 
                          ? 'ring-2 ring-red-500 border-transparent bg-red-50/10' 
                          : 'border-red-200 bg-red-50/5 shadow-sm'
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="shrink-0 w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-red-200">
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
                          <div className="w-full h-full flex items-center justify-center text-slate-350">
                            <Eye className="w-5 h-5 animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Content block */}
                      <div className="flex-1 space-y-1 md:space-y-1.5">
                        <div className="flex justify-between items-start gap-1 flex-wrap">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              {c.id}
                              <span className="bg-red-500 text-white font-sans text-[8.5px] font-black px-1.5 py-0.5 rounded animate-pulse">
                                🚨 REOPENED x{c.reopenCount || 1}
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">[{c.category}]</span>
                          </div>
                          
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-red-350 bg-red-100 text-red-950`}>
                              Reopened Case
                            </span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${getPriorityBadge(c.priority)}`}>
                              {c.priority || 'Low'}
                            </span>
                          </div>
                        </div>

                        {/* Sticky Reopened reason block */}
                        <div className="bg-red-100/50 p-2.5 rounded-xl border border-red-200 text-[11px] text-red-950 font-bold leading-relaxed shadow-sm">
                          <p className="text-[10px] uppercase font-black tracking-widest text-[#003366] mb-0.5">Citizen Dissatisfaction Reason:</p>
                          <span className="italic">&ldquo;{c.reopenReason || 'Citizen reopened this case requesting a proper field check.'}&rdquo;</span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium line-clamp-1 leading-relaxed">
                          {c.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5 text-red-500 shrink-0" />
                            {c.ward.split(' - ')[1] || c.ward}
                          </span>
                          
                          <span className="text-red-600 font-black animate-pulse flex items-center shrink-0">
                            🚨 ESCALATED SLA
                          </span>
                        </div>
                      </div>

                      <div className="self-center text-slate-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Interactive custom geographical map plotter of assignments */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md relative h-96 overflow-hidden flex flex-col justify-between">
              
              {/* Map grid background */}
              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(#ffffff 1.2px, transparent 1.2px), radial-gradient(#ffffff 1.2px, #0f172a 1.2px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px'
              }}></div>

              {/* Header inside map */}
              <div className="relative z-10 bg-slate-950/80 backdrop-blur border border-white/10 p-3 rounded-lg flex justify-between items-center text-white">
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-orange-400">Pimpri Chinchwad Region Coordinates</h4>
                  <p className="text-[9px] text-slate-300">Plots of assigned tasks in {selectedEngineer.split(' (')[0]}</p>
                </div>
                <span className="text-[9.5px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">PCMC GPS ACTIVATED</span>
              </div>

              {/* Plot Pins inside absolute space */}
              <div className="relative w-full h-64 border border-dashed border-white/5 rounded-xl bg-slate-950/30 flex items-center justify-center overflow-hidden">
                {sortedComplaints.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center z-10 font-bold leading-relaxed">
                    No active coordinates plot available.<br />Assign complaints to this zone operative first.
                  </p>
                ) : (
                  sortedComplaints.map((c, index) => {
                    // Generate nice stable coordinates relative to the coordinates boundaries
                    const latOffset = ((c.latitude || 18.59) - 18.58) / 0.1; // normalize between 0 and 1
                    const lngOffset = ((c.longitude || 73.75) - 73.74) / 0.1; // normalize between 0 and 1
                    
                    const topPercent = Math.min(Math.max(15 + (latOffset * 65), 15), 85);
                    const leftPercent = Math.min(Math.max(15 + (lngOffset * 65), 15), 85);

                    const isSelected = selectedComplaint?.id === c.id;

                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedComplaint(c)}
                        style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-25 cursor-pointer"
                      >
                        {/* Ping Ripple */}
                        {isSelected && (
                          <span className="absolute -inset-2.5 bg-orange-450 bg-orange-500 rounded-full animate-ping opacity-60"></span>
                        )}
                        
                        <div className={`flex items-center space-x-1 p-1 px-2.5 rounded-full border shadow-xl transition-all ${
                          isSelected 
                            ? 'bg-orange-500 text-white border-orange-450 scale-125 z-40' 
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:scale-110 hover:border-orange-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.priority === 'Critical' ? 'bg-red-500' : 'bg-orange-400'}`}></span>
                          <span className="font-mono text-[9.5px] font-bold">{c.id.split('-')[2] || c.id}</span>
                        </div>

                        {/* Tooltip on hover */}
                        <div className="hidden group-hover:block absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-950 text-white border border-slate-750 text-[10px] p-2 rounded shadow-2xl w-40 z-50 text-left pointer-events-none">
                          <p className="font-extrabold text-orange-400">{c.id}</p>
                          <p className="font-medium text-slate-300 line-clamp-1">{c.landmark}</p>
                          <p className="font-bold text-[9px] mt-0.5 uppercase italic text-slate-400">Pri: {c.priority || 'Low'}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <p className="text-[10px] text-slate-450 text-center relative z-10 bg-slate-950/40 p-1.5 rounded">
                💡 Coordinates and landmark plot represent registered on-field citizen GPS markers. Use for physical site arrivals.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Case action and verification deck */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-205 rounded-xl p-5 shadow-sm space-y-6">
            
            {selectedComplaint ? (
              <div className="space-y-6" id={`eng-detail-${selectedComplaint.id}`}>
                
                {/* Header detail */}
                <div className="pb-4 border-b border-slate-150 space-y-0.5">
                  <span className="text-[9.5px] font-bold text-orange-600 uppercase tracking-widest block font-mono">Assigned File No</span>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-800">{selectedComplaint.id}</h3>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 border rounded ${getStatusColor(selectedComplaint.status)}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5">
                    <p className="text-[10px] text-slate-450 font-bold">Category: {selectedComplaint.category}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black ${getPriorityBadge(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority || 'Low'} Priority
                    </span>
                  </div>
                </div>

                {/* Corporator Remark Banner - Prominent Alert Box */}
                {selectedComplaint.corporatorRemarks && selectedComplaint.corporatorRemarks.length > 0 && (
                  <div className="bg-orange-50 border-2 border-orange-400 text-orange-950 rounded-2xl p-4 text-xs font-sans space-y-1.5 shadow-sm animate-pulse" id="engineer-panel-corporator-remark">
                    <div className="flex items-center gap-1.5 text-orange-850 font-black uppercase tracking-wider text-[11px]">
                      <span>⚠️ Corporator Remark Directive</span>
                    </div>
                    <div className="space-y-1">
                      {selectedComplaint.corporatorRemarks.map((rem, i) => {
                        const remarkTextValue = typeof rem === 'string' ? rem : rem.remark;
                        const remarkTimeValue = typeof rem === 'string'
                          ? ''
                          : new Date(rem.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                        return (
                          <div key={i} className="bg-white p-2.5 rounded-xl border border-orange-200">
                            <p className="font-bold text-[11.5px] leading-relaxed italic text-gray-850">
                              &ldquo;{remarkTextValue}&rdquo;
                            </p>
                            {remarkTimeValue && (
                              <p className="text-[9px] text-gray-400 font-medium text-right mt-1">— {remarkTimeValue}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Patient / Incident context - Citizen evidence image */}
                {selectedComplaint.imageUrl && (
                  <div className="rounded-xl overflow-hidden border">
                    <img 
                      src={selectedComplaint.imageUrl} 
                      alt="Citizen registration proof" 
                      className="w-full h-36 object-cover cursor-zoom-in hover:opacity-90 transition-opacity" 
                      referrerPolicy="no-referrer"
                      onClick={() => setActiveModalImage(selectedComplaint.imageUrl)}
                    />
                    <div className="bg-slate-50 p-2 text-[10px] text-slate-500 font-bold flex items-center space-x-1">
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                      <span>Citizen Registration Photograph Evidence</span>
                    </div>
                  </div>
                )}

                {/* Details text block */}
                <div className="space-y-2">
                  <h4 className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                    <FileText className="w-4 h-4 mr-1 text-slate-400" />
                    Resident Grievance Narrative
                  </h4>
                  <div className="bg-slate-50 border p-3 rounded-xl max-h-36 overflow-y-auto leading-relaxed text-xs text-slate-650 font-medium whitespace-pre-line">
                    {selectedComplaint.description}
                  </div>
                  <div className="text-[10px] text-slate-400 flex flex-col space-y-1">
                    <span><strong>📍 Site Address:</strong> {selectedComplaint.address}</span>
                    <span><strong>📍 Landmark marker:</strong> {selectedComplaint.landmark}</span>
                    {selectedComplaint.latitude && selectedComplaint.longitude && (
                      <div className="pt-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedComplaint.latitude},${selectedComplaint.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center space-x-1.5 w-full bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all shadow"
                        >
                          <MapPin className="w-3.5 h-3.5 text-orange-400" />
                          <span>Get Directions (Google Maps)</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Original Resolution Details / Reference (Reopened Cases) */}
                {selectedComplaint.originalResolutionDate && (
                  <div className="p-3.5 bg-red-100/55 border-2 border-red-300 rounded-xl space-y-2 text-xs">
                    <h5 className="font-extrabold text-[#003366] flex items-center space-x-1.5 font-sans">
                      <AlertTriangle className="w-4 h-4 text-red-650 animate-pulse shrink-0" />
                      <span>Original Resolution Report & Proof</span>
                    </h5>
                    <p className="text-[10px] text-slate-500 font-semibold font-mono">
                      SUBMITTED ON: {new Date(selectedComplaint.originalResolutionDate).toLocaleDateString()}
                    </p>
                    
                    {selectedComplaint.originalResolutionDescription && (
                      <div className="bg-white p-2.5 rounded-lg border border-red-200 italic text-[11px] text-slate-750 font-mono">
                        &ldquo;{selectedComplaint.originalResolutionDescription}&rdquo;
                      </div>
                    )}

                    {selectedComplaint.originalResolutionProofUrl && (
                      <div className="rounded-lg overflow-hidden border border-red-200">
                        <img 
                          src={selectedComplaint.originalResolutionProofUrl} 
                          alt="Original Resolution Proof" 
                          className="w-full h-24 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                          referrerPolicy="no-referrer"
                          onClick={() => setActiveModalImage(selectedComplaint.originalResolutionProofUrl)}
                        />
                        <div className="bg-red-100/80 p-1.5 text-[8.5px] text-red-950 font-black text-center uppercase tracking-wider">
                          Original Resolution Proof Photo Reference
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Set ETA date (If not set or to update) */}
                {selectedComplaint.status === 'Assigned' && (
                  <form onSubmit={handleSetEstimate} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-black text-slate-850 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5 text-orange-500" />
                      Step 1: Set SLA Commitment Date
                    </h4>
                    <p className="text-[10.5px] text-slate-450 font-medium leading-normal">
                      Alert the citizen of when the repair crew will arrive. This creates positive feedback and updates the telemetry status to "In Progress".
                    </p>

                    <div className="space-y-1">
                      <label className="block text-[9.5px] uppercase font-bold text-slate-400">Completion Target Date *</label>
                      <input
                        type="date"
                        required
                        value={estDate}
                        onChange={(e) => setEstDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white border border-slate-200 text-xs py-2 px-2.5 rounded-lg font-bold text-slate-800 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      id="engineer-btn-set-estimate"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-2.5 rounded-xl text-xs leading-none transition-all cursor-pointer shadow"
                    >
                      Notify Citizen & Begin Repair
                    </button>
                  </form>
                )}

                {/* Step 2: Mark Resolved Form (Allowed if status is 'In Progress', 'Assigned', or 'Reopened') */}
                {(selectedComplaint.status === 'In Progress' || selectedComplaint.status === 'Assigned' || selectedComplaint.status === 'Reopened') && (
                  <form onSubmit={handleResolveSubmit} className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl space-y-3.5">
                    <h4 className="text-xs font-black text-emerald-900 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Step 2: Submit Completion Proof</span>
                    </h4>
                    
                    <div className="space-y-1">
                      <label className="block text-[9.5px] uppercase font-bold text-emerald-800">Resolution Description Text *</label>
                      <textarea
                        required
                        placeholder="Detail materials used, crew members, and action taken to clear this complaint record..."
                        value={resDesc}
                        onChange={(e) => setResDesc(e.target.value)}
                        className="w-full bg-white border border-slate-250 text-xs p-2.5 rounded-lg outline-none"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9.5px] uppercase font-bold text-emerald-800">Actual Date of Resolution *</label>
                      <input
                        type="date"
                        required
                        value={resActualDate}
                        onChange={(e) => setResActualDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white border border-slate-250 text-xs py-2 px-2.5 rounded-lg font-bold text-slate-800 outline-none cursor-pointer"
                      />
                    </div>

                    {/* Integrated File Upload buttons and Drag Area */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9.5px] uppercase font-bold text-emerald-800">
                        <span>Resolution proof photograph (Image/Video) *</span>
                        {/* Preset triggers for easy visual demo tests */}
                        <div className="flex gap-1">
                          <button 
                            type="button" 
                            onClick={() => loadUnsplashPresetProof('roads')} 
                            className="bg-slate-200 px-1 rounded text-[8px] text-slate-700 hover:bg-emerald-200 transition-all font-mono"
                          >Road preset</button>
                          <button 
                            type="button" 
                            onClick={() => loadUnsplashPresetProof('pipes')} 
                            className="bg-slate-200 px-1 rounded text-[8px] text-slate-700 hover:bg-emerald-200 transition-all font-mono"
                          >Pipe preset</button>
                        </div>
                      </div>

                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => { 
                          e.preventDefault(); 
                          setDragActive(false); 
                          if (e.dataTransfer.files?.[0]) handleProofFileChange(e.dataTransfer.files[0]); 
                        }}
                        className={`pointer-events-auto border-2 border-dashed rounded-xl p-3.5 text-center transition-all ${
                          dragActive ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {resProofUrl ? (
                          <div className="space-y-2 relative">
                            {resProofUrl.startsWith('data:video/') || resProofUrl.includes('video') ? (
                              <video src={resProofUrl} className="w-full h-28 object-cover rounded-lg border shadow-xs" controls playsInline />
                            ) : (
                              <img 
                                src={resProofUrl} 
                                alt="Proof preview" 
                                className="w-full h-28 object-cover rounded-lg border shadow-xs cursor-zoom-in hover:opacity-90 transition-opacity" 
                                referrerPolicy="no-referrer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveModalImage(resProofUrl);
                                }}
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => setResProofUrl('')}
                              className="absolute top-1 right-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] hover:bg-red-700 shadow"
                            >
                              Remove
                            </button>
                            <span className="text-[9px] text-gray-500 block truncate">Attachment loaded successfully</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 font-bold block">
                              Drag & Drop proof media, or click below:
                            </p>
                            
                            <div className="flex justify-center">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                id="engineer-device-input" 
                                onChange={(e) => { if (e.target.files?.[0]) handleProofFileChange(e.target.files[0]); }} 
                              />
                              <label
                                htmlFor="engineer-device-input"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 shadow transition-all"
                              >
                                <Camera className="w-4 h-4" />
                                <span>Upload Image</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="engineer-btn-submit-resolution"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-2.5 rounded-xl text-xs leading-none transition-all cursor-pointer shadow flex items-center justify-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Submit Resolution Details for Approval</span>
                    </button>
                  </form>
                )}

                {/* Resolution Pending Approval State text details */}
                {selectedComplaint.status === 'Resolution Pending Approval' && (
                  <div className="bg-amber-100/50 border border-amber-300 p-4 rounded-xl text-amber-950 text-xs leading-relaxed space-y-2 font-medium">
                    <div className="flex items-center space-x-1 font-bold text-amber-900 uppercase tracking-wide text-[10px]">
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping"></span>
                      <span>Task Completed - Pending Admin Verification</span>
                    </div>
                    <p>
                      You have logged this resolution with proof on <strong>{new Date(selectedComplaint.actualResolutionDate || '').toLocaleDateString()}</strong>.
                    </p>
                    <p className="bg-white p-2 border border-amber-250 rounded italic text-slate-600">
                      &ldquo;{selectedComplaint.resolutionDescription}&rdquo;
                    </p>
                    <p className="text-[10px] text-amber-900 font-bold">
                      Awaiting Department Administrator review to mark resolved and release points to the citizen.
                    </p>
                  </div>
                )}

                {/* Historic Event Log relative for this issue */}
                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider">Complaint Log Trail</h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedComplaint.history.map((h, i) => (
                      <div key={i} className="text-[11.5px] leading-snug p-2 bg-slate-50 border rounded-lg text-slate-650">
                        <span className="font-bold text-slate-700 block">{h.title}</span>
                        <span>{h.description}</span>
                        <div className="text-[9px] text-slate-400 mt-1 font-mono">{new Date(h.date).toLocaleDateString()} &bull; Actor: {h.actor}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Wrench className="w-12 h-12 text-slate-300 rotate-45" />
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">Select Assignment Duty File</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Acquire any field complaint record from your assigned list on the left to set ETAs, view landmark pins, or register site resolution proof.
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
