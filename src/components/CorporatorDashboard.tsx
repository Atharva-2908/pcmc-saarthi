import React, { useState } from 'react';
import { 
  Shield, MapPin, AlertCircle, Clock, Send, MessageSquare, 
  CheckCircle, ChevronRight, Eye, Info, Flag, Building2, TrendingDown,
  User, Calendar, AlertTriangle, X
} from 'lucide-react';
import { Complaint, ComplaintStatus, UserProfile } from '../types';
import { WARDS } from '../data';

interface CorporatorDashboardProps {
  complaints: Complaint[];
  currentUser: UserProfile;
  onAddCorporatorRemark: (complaintId: string, remark: string) => void;
}

const matchWards = (w1: string, w2: string): boolean => {
  if (!w1 || !w2) return false;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return norm(w1) === norm(w2);
};

export default function CorporatorDashboard({ complaints, currentUser, onAddCorporatorRemark }: CorporatorDashboardProps) {
  // Normalize and find corporator's assigned ward from WARDS list
  const initialWard = WARDS.find(w => matchWards(w, currentUser.ward || '')) || WARDS[0];
  const [selectedWard, setSelectedWard] = useState<string>(initialWard);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [remarkText, setRemarkText] = useState<string>('');

  // Filter complaints based on Selected Ward
  const wardComplaints = complaints.filter(
    (c) => c.ward.toLowerCase() === selectedWard.toLowerCase()
  );

  // Filter stalled complaints (7+ days)
  const stalledComplaints = wardComplaints.filter((c) => c.isStalled && c.status !== 'Resolved' && c.status !== 'Rejected');
  const normalActiveComplaints = wardComplaints.filter((c) => (!c.isStalled || c.status === 'Resolved' || c.status === 'Rejected'));

  const totalWardRaised = wardComplaints.length;
  const totalWardResolved = wardComplaints.filter(c => c.status === 'Resolved').length;
  const totalWardStalled = stalledComplaints.length;

  const [corporatorViewTab, setCorporatorViewTab] = useState<'all' | 'stalled'>('all');

  const visibleList = corporatorViewTab === 'all' ? wardComplaints : stalledComplaints;

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted': return 'bg-orange-100 text-orange-850';
      case 'Under Review': return 'bg-yellow-100 text-yellow-850';
      case 'Assigned': return 'bg-blue-150 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Resolved': return 'bg-green-150 text-green-850';
      case 'Rejected': return 'bg-red-100 text-red-850';
      default: return 'bg-gray-150 text-gray-800';
    }
  };

  const handlePostRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !remarkText.trim()) return;

    onAddCorporatorRemark(selectedComplaint.id, remarkText.trim());
    
    // Update local state copy to render instantly
    const newRemarkObj = {
      remark: remarkText.trim(),
      timestamp: new Date().toISOString()
    };
    const updatedRemarks = selectedComplaint.corporatorRemarks 
      ? [...selectedComplaint.corporatorRemarks, newRemarkObj]
      : [newRemarkObj];
    
    setSelectedComplaint({
      ...selectedComplaint,
      corporatorRemarks: updatedRemarks
    });

    setRemarkText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans" id="corporator-dashboard">
      
      {/* Ward Selector and Header */}
      <div className="bg-gradient-to-r from-[#003366] via-[#002B52] to-[#002244] p-6 rounded-2xl border border-white/10 shadow-lg text-white flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase tracking-widest">
            <Shield className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>Honorable Corporator Office Portal</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight mt-1 flex items-center">
            Ward Accountability & Audit Center
          </h2>
          <p className="text-xs text-blue-200">Review community satisfaction levels, monitor stalled SLA tickets, and issue warning directives.</p>
        </div>

        {/* Ward Selector Dropdown */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-xl space-y-1.5 self-start">
          <label className="block text-[10px] text-orange-300 font-extrabold uppercase tracking-widest">Select Elected Constituency</label>
          <select
            id="corporator-ward-selector"
            value={selectedWard}
            onChange={(e) => {
              setSelectedWard(e.target.value);
              setSelectedComplaint(null); // Clear selected
            }}
            className="bg-transparent text-white border-none py-1 text-xs font-black rounded-lg cursor-pointer outline-none focus:ring-0 appearance-none pr-8"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23f3f4f6\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.2rem center', backgroundSize: '1.25em 1.25em', backgroundRepeat: 'no-repeat' }}
          >
            {WARDS.map(w => (
              <option key={w} value={w} className="bg-blue-950 text-white font-bold text-xs">{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ward Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border p-4.5 rounded-2xl shadow-sm">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total Registered Cases</p>
          <p className="text-2xl font-black text-blue-950 mt-1">{totalWardRaised}</p>
          <span className="text-[9px] text-gray-400 font-medium font-sans">Active in {selectedWard.split(' - ')[1]}</span>
        </div>

        <div className="bg-white border p-4.5 rounded-2xl shadow-sm border-red-200 bg-red-50/10">
          <p className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider flex items-center">
            ⚠️ SLA Stalled Cases (7+ Days)
          </p>
          <p className="text-2xl font-black text-red-950 mt-1">{totalWardStalled}</p>
          {totalWardStalled > 0 ? (
            <span className="text-[9px] text-red-655 font-bold animate-pulse text-red-600">Action Required Immediately!</span>
          ) : (
            <span className="text-[9px] text-green-600 font-bold">Compliant SLA Balance 🟢</span>
          )}
        </div>

        <div className="bg-white border p-4.5 rounded-2xl shadow-sm">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-green-600">Completed Redressal</p>
          <p className="text-2xl font-black text-green-950 mt-1">{totalWardResolved}</p>
          <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1.5 py-0.2 rounded border border-green-100 mt-1 inline-block">
            {totalWardRaised > 0 ? Math.round((totalWardResolved / totalWardRaised) * 100) : 0}% Satisfaction
          </span>
        </div>

        <div className="bg-white border p-4.5 rounded-2xl shadow-sm">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-blue-900">Ward Priority Coefficient</p>
          <p className="text-2xl font-black text-blue-950 mt-1">High</p>
          <span className="text-[9px] text-gray-400 font-medium">Urban Densification Zone</span>
        </div>
      </div>

      {/* Main Grid: Cases Listing & Ward Audit Control panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Complaints Feed sorted by Critical/Stalled */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Sub Filters tab */}
          <div className="flex bg-slate-100 p-1 rounded-full w-fit border border-slate-200">
            <button
              id="corpo-tab-all"
              onClick={() => setCorporatorViewTab('all')}
              className={`px-4.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                corporatorViewTab === 'all' ? 'bg-orange-500 text-white shadow' : 'text-slate-500 hover:text-orange-500'
              }`}
            >
              All Ward Complaints ({wardComplaints.length})
            </button>
            <button
              id="corpo-tab-stalled"
              onClick={() => setCorporatorViewTab('stalled')}
              className={`px-4.5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center space-x-1 cursor-pointer ${
                corporatorViewTab === 'stalled' ? 'bg-red-600 text-white shadow' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Stalled Over 7 Days ({totalWardStalled})</span>
            </button>
          </div>

          <div className="space-y-3">
            {visibleList.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-3xl p-10 text-center text-xs text-gray-500">
                <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <h4 className="font-extrabold uppercase">No cases currently listed</h4>
                <p className="mt-1">
                  {corporatorViewTab === 'stalled' 
                    ? 'Excellent! No complaints in this ward have been stalled for more than 7 days.'
                    : `No complaints recorded in ${selectedWard.split(' - ')[1]} yet.`}
                </p>
              </div>
            ) : (
              visibleList.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    id={`corpo-card-${c.id}`}
                    onClick={() => {
                      setSelectedComplaint(c);
                      setRemarkText('');
                    }}
                    className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:border-slate-300 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                      isSelected ? 'ring-2 ring-orange-500 border-transparent bg-slate-50/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status dot icon */}
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 animate-pulse ${
                        c.isStalled && c.status !== 'Resolved' && c.status !== 'Rejected' ? 'bg-red-600' : 'bg-blue-600'
                      }`} />

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-blue-900">{c.id}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.2 rounded font-bold uppercase">{c.category}</span>
                        </div>

                        <p className="text-xs text-gray-700 leading-relaxed font-semibold line-clamp-1">
                          {c.description}
                        </p>

                        <p className="text-[10px] text-gray-400 font-semibold">📍 Landmark: {c.landmark}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${getStatusColor(c.status)}`}>
                        {c.rating ? `⭐ ${c.rating} — ${c.status}` : c.status}
                      </span>
                      
                      {c.isStalled && c.status !== 'Resolved' && c.status !== 'Rejected' && (
                        <span className="text-[9px] font-extrabold text-white bg-red-600 px-2 mt-0.5 py-0.5 rounded border border-red-700 animate-pulse uppercase">
                          Stalled {c.daysStalled}d
                        </span>
                      )}

                      <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column - Ward Audit & Action Remarks Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6 flex-1 flex flex-col">
            
            {selectedComplaint ? (
              <div className="space-y-6">
                
                {/* Header card details */}
                <div className="pb-4 border-b border-gray-150 space-y-0.5">
                  <div className="flex items-center space-x-1 hover:text-blue-900 text-[10.5px] text-gray-400 font-extrabold uppercase">
                    <Flag className="w-3.5 h-3.5 text-orange-500 mr-1" />
                    <span>Selected Audit Ticket</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <h3 className="text-base font-black text-blue-950">{selectedComplaint.id}</h3>
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded border ${getStatusColor(selectedComplaint.status)}`}>
                      {selectedComplaint.rating ? `⭐ ${selectedComplaint.rating} — ${selectedComplaint.status}` : selectedComplaint.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold pt-1">Auto Department: {selectedComplaint.category} (PCMC)</p>
                  <p className="text-[10px] text-gray-400 font-semibold">Assigned Department/Zone: {selectedComplaint.department || 'Under Administrative Assignment'}</p>
                </div>

                {/* Stalled Banner inside actions */}
                {selectedComplaint.isStalled && selectedComplaint.status !== 'Resolved' && selectedComplaint.status !== 'Rejected' && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl space-y-1 text-xs animate-pulse">
                    <h4 className="font-extrabold flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
                      SLA Threshold Violated!
                    </h4>
                    <p className="text-[10.5px] leading-relaxed font-semibold">
                      This ticket has sat open for over {selectedComplaint.daysStalled} days with no resolution. Send an official remark to demand fast action.
                    </p>
                  </div>
                )}

                {/* Micro Image */}
                {selectedComplaint.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-150 relative">
                    <img 
                      src={selectedComplaint.imageUrl} 
                      alt="Complaint context" 
                      className="w-full h-32 object-cover cursor-zoom-in hover:opacity-90 transition-opacity" 
                      referrerPolicy="no-referrer"
                      onClick={() => setActiveModalImage(selectedComplaint.imageUrl)}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 text-[10.5px] text-white font-medium line-clamp-1">
                      🏡 Location: {selectedComplaint.address}
                    </div>
                  </div>
                )}

                {/* Incident Description */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-extrabold text-blue-900 uppercase">Citizen Statement</h4>
                  <p className="text-xs text-gray-600 bg-gray-50 border border-gray-150 p-3 rounded-xl max-h-36 overflow-y-auto leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Assigned engineer details */}
                {selectedComplaint.assignedEngineer && (
                  <div className="p-3 bg-blue-50/70 border border-blue-150 rounded-xl space-y-2 text-xs">
                    <div className="flex items-start space-x-2">
                      <User className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-bold text-blue-900 text-[11px]">PCMC Ward Engineer Allocated</h5>
                        <p className="text-gray-600 font-medium text-[10px]">{selectedComplaint.assignedEngineer}</p>
                      </div>
                    </div>

                    {/* Estimated Completion Date Notice */}
                    {selectedComplaint.estimatedResolutionDate ? (
                      <div className="bg-purple-100 border border-purple-200 p-2.5 rounded-lg flex items-center space-x-1.5 text-purple-950 font-semibold text-[10.5px]">
                        <Calendar className="w-3.5 h-3.5 text-purple-700" />
                        <span>Est. Completion SLA: {new Date(selectedComplaint.estimatedResolutionDate).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-100 p-2 rounded-lg text-[10px] text-orange-700 font-bold">
                        ⏳ Waiting for engineer to visit the physical site and schedule estimated completion.
                      </div>
                    )}
                  </div>
                )}

                {/* History list of Corporator remarks already issued */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold text-blue-900 uppercase">Past Directives Issued ({selectedComplaint.corporatorRemarks?.length || 0})</h4>
                  
                  {selectedComplaint.corporatorRemarks && selectedComplaint.corporatorRemarks.length > 0 ? (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {selectedComplaint.corporatorRemarks.map((rem, index) => {
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
                          <div key={index} className="p-2.5 bg-orange-50/50 border border-orange-100 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between items-center text-orange-950 font-bold">
                              <p className="flex items-center">
                                <MessageSquare className="w-3.5 h-3.5 mr-1 text-orange-500" />
                                Hon. Corporator directive #{index + 1}
                              </p>
                              {remarkTimeValue && (
                                <span className="text-[9px] text-gray-400 font-normal">{remarkTimeValue}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-600 leading-relaxed italic">
                              &ldquo;{remarkTextValue}&rdquo;
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic bg-gray-50 p-2.5 rounded-lg text-center font-medium">No previous statements issued on this incident file.</p>
                  )}
                </div>

                {/* Live Status Redressal Timeline Progress flow */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <h4 className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wide flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-900 animate-pulse" />
                    Complaints Redressal Timeline
                  </h4>

                  {selectedComplaint.status === 'Rejected' ? (
                    <div className="border border-red-100 bg-red-50/20 p-4 rounded-xl space-y-2 text-center text-xs">
                      <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
                      <h5 className="font-bold text-red-950">Record Terminated / Closed</h5>
                      <p className="text-[10.5px] text-gray-500">
                        This complaint failed validation. Review the official grounds below.
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:inset-y-1 before:left-2 before:w-0.5 before:bg-gray-200">
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

                {/* Action Form to post new corporator remark */}
                {selectedComplaint.status !== 'Resolved' && selectedComplaint.status !== 'Rejected' && (
                  <form onSubmit={handlePostRemark} className="space-y-2.5 bg-gray-50 border border-gray-250 p-4 rounded-2xl">
                    <h4 className="text-xs font-black text-blue-950 flex items-center">
                      <Building2 className="w-4.5 h-4.5 mr-1.5 text-blue-900" />
                      Issue Official Ward Directive
                    </h4>

                    <div className="space-y-1">
                      <textarea
                        required
                        rows={2}
                        id="corporator-remark-input"
                        value={remarkText}
                        onChange={(e) => setRemarkText(e.target.value)}
                        placeholder="Type warning remark (e.g., Escalating to commissioner. Please patch this immediately.)"
                        className="w-full bg-white border border-gray-300 text-xs p-2.5 rounded-xl outline-none focus:border-blue-950"
                      />
                    </div>

                    <p className="text-[9px] text-gray-400 font-medium">
                      Issuing a Corporator directive marks the ticket with persistent high-priority alerts across both citizen and administrator consoles.
                    </p>

                    <button
                      type="submit"
                      id="corpo-btn-post-remark"
                      className="w-full bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all text-white font-black text-xs py-2.5 rounded-xl text-center cursor-pointer flex items-center justify-center space-x-1.5 shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Directive & Escalate</span>
                    </button>
                  </form>
                )}

              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Shield className="w-12 h-12 text-gray-300" />
                <h4 className="text-xs font-black text-gray-600 uppercase tracking-wider">Acquire Ward Incident File</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Pick any local civic ticket from your constituency on the left feed list to audit resolution logs, view submitted photo-graphs, or publish corporator warnings.
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
