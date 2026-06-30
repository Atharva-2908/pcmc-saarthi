import React, { useState } from 'react';
import { 
  Building, User, AlertCircle, CheckCircle2, ChevronRight, XCircle, 
  CornerUpRight, Users, Eye, HelpCircle, ArrowRight, UserCheck, Check,
  CloudRain, Zap, RefreshCw, Clock, TrendingUp, MapPin, AlertTriangle,
  X, Edit
} from 'lucide-react';
import { Complaint, ComplaintStatus, ComplaintCategory, getEffectivePriority } from '../types';
import { DEPARTMENTS, ENGINEERS, WARDS } from '../data';

interface AdminDashboardProps {
  complaints: Complaint[];
  onUpdateComplaint: (updated: Complaint) => void;
}

export default function AdminDashboard({ complaints, onUpdateComplaint }: AdminDashboardProps) {
  const [activeMainTab, setActiveMainTab] = useState<'queues' | 'insights'>('queues');
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const [selectedDeptKey, setSelectedDeptKey] = useState<string>('Roads');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Modal/Panel states for actions
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState(ENGINEERS[0]);
  const [selectedPriority, setSelectedPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  
  const [showReRouteForm, setShowReRouteForm] = useState(false);
  const [targetDeptKey, setTargetDeptKey] = useState('Water');

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [showRejectResolutionForm, setShowRejectResolutionForm] = useState(false);
  const [rejectResolutionNote, setRejectResolutionNote] = useState('');

  const currentDepartmentName = DEPARTMENTS[selectedDeptKey] || DEPARTMENTS.Roads;

  // Filter complaints belong to THIS admin's department
  const deptComplaints = complaints.filter(
    (c) => c.department.toLowerCase() === currentDepartmentName.toLowerCase()
  );

  // Group into lists
  // Group into lists
  const incomingQueue = deptComplaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'Reopened');
  const activeQueue = deptComplaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Resolution Pending Approval');
  const archiveQueue = deptComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed' || c.status === 'Rejected');

  const [queueTab, setQueueTab] = useState<'incoming' | 'active' | 'archive'>('incoming');

  const rawActiveList = 
    queueTab === 'incoming' ? incomingQueue : 
    queueTab === 'active' ? activeQueue : archiveQueue;

  const PRIORITY_SORT_SCALE: Record<string, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  const activeList = [...rawActiveList].sort((a, b) => {
    // 1. Community Verified (10+ upvotes) gets primary boost
    const cvA = (a.upvotes || 0) >= 10 ? 1 : 0;
    const cvB = (b.upvotes || 0) >= 10 ? 1 : 0;
    if (cvA !== cvB) return cvB - cvA;

    // 2. Dynamic upvote-boosted priority
    const priA = PRIORITY_SORT_SCALE[getEffectivePriority(a)] || 1;
    const priB = PRIORITY_SORT_SCALE[getEffectivePriority(b)] || 1;
    if (priA !== priB) return priB - priA;

    // 3. Newest first
    return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
  });

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted': return 'bg-orange-100 text-orange-850 border-orange-200';
      case 'Under Review': return 'bg-yellow-101 text-yellow-850 border-yellow-250';
      case 'Assigned': return 'bg-blue-101 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-purple-101 text-purple-800 border-purple-200';
      case 'Resolution Pending Approval': return 'bg-amber-101 text-amber-805 border-amber-300 ring-1 ring-amber-500/20';
      case 'Resolved': return 'bg-green-101 text-green-855 border-green-250';
      case 'Rejected': return 'bg-red-101 text-red-855 border-red-250';
      case 'Reopened': return 'bg-red-101 text-red-955 border-red-300 font-extrabold animate-pulse';
      case 'Closed': return 'bg-slate-101 text-slate-705 border-slate-350 font-bold';
      default: return 'bg-gray-151 text-gray-805 border-gray-251';
    }
  };

  // Actions
  const handleAcceptReview = (comp: Complaint) => {
    const updated: Complaint = {
      ...comp,
      status: 'Under Review',
      dateUpdated: new Date().toISOString(),
      history: [
        ...comp.history,
        {
          id: `ev-adm-${Date.now()}`,
          status: 'Under Review',
          title: 'Review Initiated',
          description: `Department administrator logged on and accepted the file for physical audit verification.`,
          date: new Date().toISOString(),
          actor: 'Dept Admin',
        }
      ]
    };
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
    setShowReRouteForm(false);
    setShowRejectForm(false);
  };

  const handleAssignEngineerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    const updated: Complaint = {
      ...selectedComplaint,
      status: 'Assigned',
      assignedEngineer: selectedEngineer,
      priority: selectedPriority,
      dateUpdated: new Date().toISOString(),
      history: [
        ...selectedComplaint.history,
        {
          id: `ev-adm-${Date.now()}`,
          status: 'Assigned',
          title: 'Zone Engineer Allocated',
          description: `Assigned to ${selectedEngineer} with [${selectedPriority}] priority. Task sheets created.`,
          date: new Date().toISOString(),
          actor: 'Dept Admin',
        }
      ]
    };

    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
    setShowAssignForm(false);
  };

  const handleApproveResolution = (comp: Complaint) => {
    const updated: Complaint = {
      ...comp,
      status: 'Resolved',
      isStalled: false,
      daysStalled: 0,
      dateUpdated: new Date().toISOString(),
      history: [
        ...comp.history,
        {
          id: `ev-adm-${Date.now()}`,
          status: 'Resolved',
          title: 'Resolution Approved & Closed',
          description: `Admin approved resolution proof: "${comp.resolutionDescription || 'Restored successfully'}".`,
          date: new Date().toISOString(),
          actor: 'Dept Admin',
        }
      ]
    };
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
  };

  const handleRejectResolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !rejectResolutionNote.trim()) return;

    const updated: Complaint = {
      ...selectedComplaint,
      status: 'In Progress',
      dateUpdated: new Date().toISOString(),
      history: [
        ...selectedComplaint.history,
        {
          id: `ev-adm-${Date.now()}`,
          status: 'In Progress',
          title: 'Work Rejected / Returned',
          description: `Disapproved. Correction instructions: ${rejectResolutionNote}`,
          date: new Date().toISOString(),
          actor: 'Dept Admin',
        }
      ]
    };
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
    setShowRejectResolutionForm(false);
    setRejectResolutionNote('');
  };

  const handleReRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    const targetDeptName = DEPARTMENTS[targetDeptKey];
    const updated: Complaint = {
      ...selectedComplaint,
      department: targetDeptName,
      status: 'Submitted', // Reset status as it goes to a new department queue
      dateUpdated: new Date().toISOString(),
      history: [
        ...selectedComplaint.history,
        {
          id: `ev-adm-${Date.now()}`,
          status: 'Submitted',
          title: 'Re-routed Department',
          description: `File re-routed from [${selectedComplaint.category}] department to [${targetDeptKey}] department. Reason: Out of section jurisdiction.`,
          date: new Date().toISOString(),
          actor: 'Dept Admin',
        }
      ]
    };

    onUpdateComplaint(updated);
    setSelectedComplaint(null); // Deselect as it leaves our jurisdiction
    setShowReRouteForm(false);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !rejectReason.trim()) return;

    const updated: Complaint = {
      ...selectedComplaint,
      status: 'Rejected',
      rejectionReason: rejectReason,
      dateUpdated: new Date().toISOString(),
      history: [
        ...selectedComplaint.history,
        {
          id: `ev-adm-${Date.now()}`,
          status: 'Rejected',
          title: 'Complaint Rejected',
          description: `Rejected by Dept Admin. Reason: ${rejectReason}`,
          date: new Date().toISOString(),
          actor: 'Dept Admin',
        }
      ]
    };

    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
    setShowRejectForm(false);
    setRejectReason('');
  };

  // Quick Resolve for easy testing
  const handleQuickResolve = (comp: Complaint) => {
    const updated: Complaint = {
      ...comp,
      status: 'Resolved',
      isStalled: false,
      daysStalled: 0,
      dateUpdated: new Date().toISOString(),
      history: [
        ...comp.history,
        {
          id: `ev-adm-${Date.now()}`,
          status: 'Resolved',
          title: 'Resolved by Admin',
          description: `Physical checks completed. Incident site restored to benchmark municipal levels. Citizen notified.`,
          date: new Date().toISOString(),
          actor: 'SLA Ward Engineer',
        }
      ]
    };
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
  };

  // Quick Progress update for testing
  const handleMarkWorking = (comp: Complaint) => {
    const updated: Complaint = {
      ...comp,
      status: 'In Progress',
      dateUpdated: new Date().toISOString(),
      history: [
        ...comp.history,
        {
          id: `ev-adm-${Date.now()}`,
          status: 'In Progress',
          title: 'Work In Progress',
          description: 'Crew is active on site with materials. Repair in alignment.',
          date: new Date().toISOString(),
          actor: 'SLA Ward Engineer',
        }
      ]
    };
    onUpdateComplaint(updated);
    setSelectedComplaint(updated);
  };

  const renderCityInsights = () => {
    return (
      <div className="space-y-8 animate-fade-in" id="city-insights-panel">
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-slate-950">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl"></div>
          
          <div className="relative space-y-3 z-10">
            <span className="bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded border border-orange-500/20 uppercase tracking-widest">
              AI-Powered Civic Intelligence
            </span>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">PCMC Predictive Administrative Council</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              By applying Gemini intelligence over recurring municipal datasets, Saarthi generates foresight patterns to help department directors allocate funding, prepare pre-monsoon logistics, and resolve systemic structural faults before they peak.
            </p>
          </div>
        </div>

        {/* Predictive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Seasonal Pattern */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow hover:border-blue-200 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-50 text-blue-800 rounded-xl"><CloudRain className="w-5 h-5" /></div>
                <h4 className="font-bold text-xs text-blue-950 uppercase tracking-wider">🌧️ Seasonal Pattern</h4>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Roads department receives 65% more complaints during June to September monsoon season.
              </p>
              
              {/* Custom Simulated Visualisation: June to Sept spike */}
              <div className="pt-2">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Monthly Complaints Trend</span>
                    <span className="text-orange-500 font-bold">+65% spike</span>
                  </div>
                  <div className="flex items-end justify-between h-14 pt-2">
                    {[
                      { m: 'Jan', val: 20 }, { m: 'Mar', val: 30 }, 
                      { m: 'Jun', val: 90, active: true }, { m: 'Jul', val: 100, active: true }, 
                      { m: 'Aug', val: 95, active: true }, { m: 'Oct', val: 40 }
                    ].map((d, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 space-y-1">
                        <div 
                          className={`w-4 rounded-t-sm transition-all ${
                            d.active ? 'bg-orange-500' : 'bg-slate-200'
                          }`}
                          style={{ height: `${d.val}%`, minHeight: '4px' }}
                        ></div>
                        <span className="text-[8px] font-mono font-bold text-slate-500">{d.m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-start space-x-1.5 mt-2">
              <span className="text-[10px] bg-emerald-50 text-emerald-805 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">SLA Advice</span>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Recommend pre-monsoon road inspection in May.</p>
            </div>
          </div>

          {/* Card 2: Hotspot Zones */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow hover:border-blue-200 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-50 text-rose-850 rounded-xl"><MapPin className="w-5 h-5 text-rose-700" /></div>
                <h4 className="font-bold text-xs text-blue-950 uppercase tracking-wider">📍 Hotspot Zones</h4>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Ward 12 Wakad and Ward 8 Chinchwad have highest recurring complaints in last 90 days.
              </p>
              
              {/* Custom Simulated Visualisation: Progress level comparisons */}
              <div className="space-y-2 pt-2">
                {[
                  { name: 'Ward 12 - Wakad', count: '482 complaints', pct: 95 },
                  { name: 'Ward 8 - Chinchwad', count: '394 complaints', pct: 80 },
                  { name: 'City Average Ward', count: '142 complaints', pct: 30 }
                ].map((w, j) => (
                  <div key={j} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-700">
                      <span>{w.name}</span>
                      <span className="text-slate-500 font-mono text-[9px]">{w.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${w.pct > 75 ? 'bg-red-500' : 'bg-slate-300'}`} 
                        style={{ width: `${w.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-start space-x-1.5 mt-2">
              <span className="text-[10px] bg-emerald-50 text-emerald-805 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">SLA Advice</span>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Recommend priority resource allocation.</p>
            </div>
          </div>

          {/* Card 3: Department Performance */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow hover:border-blue-200 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-50 text-amber-800 rounded-xl"><Zap className="w-5 h-5 text-amber-600" /></div>
                <h4 className="font-bold text-xs text-blue-950 uppercase tracking-wider">⚡ Department Performance</h4>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Electrical department resolves complaints 40% faster than city average. Roads department is 25% slower than average.
              </p>
              
              {/* Custom Simulated Visualisation: Department Velocity charts */}
              <div className="pt-2">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Mean Resolution Speed Index</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {[
                      { name: '⚡ Electrical', speed: '4.8 days', fast: true },
                      { name: '🌿 Garbage', speed: '6.2 days', fast: true },
                      { name: '🌧️ Drainage', speed: '8.4 days', avg: true },
                      { name: '🛣️ Roads Dept', speed: '11.5 days', slow: true }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center text-[10px] font-bold">
                        <span className="w-20 truncate text-slate-600">{item.name}</span>
                        <div className="flex-1 bg-slate-200 h-2 rounded overflow-hidden mx-2 relative">
                          <div 
                            className={`h-full ${
                              item.fast ? 'bg-green-500' : item.slow ? 'bg-orange-500' : 'bg-slate-400'
                            }`}
                            style={{ width: item.fast ? '40%' : item.slow ? '90%' : '65%' }}
                          ></div>
                        </div>
                        <span className="text-slate-600 text-[9px] font-mono w-12 text-right">{item.speed}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-start space-x-1.5 mt-2 font-sans">
              <span className="text-[10px] bg-emerald-50 text-emerald-805 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">SLA Advice</span>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Recommend field resource redistribution.</p>
            </div>
          </div>

          {/* Card 4: Repeat Issues */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow hover:border-blue-200 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-805 rounded-xl"><RefreshCw className="w-5 h-5 text-indigo-700" /></div>
                <h4 className="font-bold text-xs text-blue-950 uppercase tracking-wider">🔄 Repeat Issues</h4>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                34 complaints in Zone B are recurring at same locations indicating permanent infrastructure problems not temporary fixes.
              </p>
              
              {/* Custom Simulated Visualisation: Recurring chart bar */}
              <div className="pt-2">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Recurrence Rate (90 days)</span>
                    <span className="text-red-500 font-bold">Zone B Alert</span>
                  </div>
                  <div className="h-10 flex items-center justify-center">
                    <div className="w-full flex h-4 rounded-full overflow-hidden bg-slate-200">
                      <div className="bg-blue-600 h-full" style={{ width: '45%' }} title="Zone A"></div>
                      <div className="bg-red-500 h-full" style={{ width: '35%' }} title="Zone B"></div>
                      <div className="bg-indigo-400 h-full" style={{ width: '20%' }} title="Zone C"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono font-black text-slate-500">
                    <span>Zone A (45%)</span>
                    <span className="text-red-500 font-sans">Zone B (35% - Repeat)</span>
                    <span>Zone C (20%)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-start space-x-1.5 mt-2">
              <span className="text-[10px] bg-emerald-50 text-emerald-805 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">SLA Advice</span>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Audit pipe/foundation structures in Zone B.</p>
            </div>
          </div>

          {/* Card 5: Monthly Trend */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow hover:border-blue-200 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-805 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-700" /></div>
                <h4 className="font-bold text-xs text-blue-950 uppercase tracking-wider">📈 Monthly Trend</h4>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Complaint volume increased 18% this month compared to last month. Garbage disposal and drainage are fastest growing categories.
              </p>
              
              {/* Custom Simulated Visualisation */}
              <div className="space-y-2 pt-2">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>Garbage & Urban Sanitation</span>
                    <span className="text-emerald-600 font-mono text-[9px]">+24% MoM</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>Sewerage & Drainage</span>
                    <span className="text-emerald-600 font-mono text-[9px]">+19% MoM</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-start space-x-1.5 mt-2">
              <span className="text-[10px] bg-emerald-50 text-emerald-805 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">SLA Advice</span>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Augment sanitation service compactors.</p>
            </div>
          </div>

          {/* Card 6: Peak Reporting Times */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow hover:border-blue-200 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-yellow-50 text-yellow-850 rounded-xl"><Clock className="w-5 h-5 text-orange-600" /></div>
                <h4 className="font-bold text-xs text-blue-950 uppercase tracking-wider">⏰ Peak Reporting Times</h4>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Most complaints are registered between 8am to 10am and 6pm to 8pm suggesting citizens report on their way to and from work.
              </p>
              
              {/* Custom Simulated Visualisation: Hour clock layout */}
              <div className="pt-2">
                <div className="bg-slate-50 p-2 text-center rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-mono text-slate-400">Lodgements Hourly Distribution</span>
                  <div className="flex justify-around items-center pt-1.5">
                    <div className="bg-orange-100 border border-orange-200 p-2 rounded-xl text-center">
                      <p className="text-xs font-black text-orange-700">8AM - 10AM</p>
                      <p className="text-[8px] text-slate-450 font-extrabold uppercase mt-0.5">Morning commute</p>
                    </div>
                    <div className="text-slate-300 font-black text-xs">|</div>
                    <div className="bg-orange-100 border border-orange-200 p-2 rounded-xl text-center">
                      <p className="text-xs font-black text-orange-700">6PM - 8PM</p>
                      <p className="text-[8px] text-slate-450 font-extrabold uppercase mt-0.5">Evening commute</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-start space-x-1.5 mt-2">
              <span className="text-[10px] bg-emerald-50 text-emerald-805 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">SLA Advice</span>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Optimize portal bandwidth during commute peaks.</p>
            </div>
          </div>

        </div>

        {/* Powered Note at Bottom */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl text-center shadow-xs">
          <p className="text-xs text-[#003366] font-extrabold flex items-center justify-center space-x-1.5">
            <span className="animate-spin">🔮</span>
            <span>Insights powered by Gemini AI. In production these update in real time based on live complaint data.</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans" id="admin-dashboard">
      
      {/* Top Welcome Control Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded w-fit border border-orange-100">
            <span>PCMC REGIONAL COMMISSION</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#003366] flex items-center mt-1">
            <Building className="w-6 h-6 mr-2 text-[#003366]" />
            PCMC Department Administrator Control
          </h2>
          <p className="text-xs text-slate-500 font-medium">Verify cases, allot service sheets, dispatch on-site crew, or re-route errant listings.</p>
        </div>

        {/* Department Switching dropdown to let user test everything */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
          <label className="block text-[10px] font-extrabold text-[#003366] uppercase tracking-widest flex items-center">
            Active Department Perspective
          </label>
          <select
            id="admin-dept-switcher"
            value={selectedDeptKey}
            onChange={(e) => {
              setSelectedDeptKey(e.target.value);
              setSelectedComplaint(null); // Clear selected
            }}
            className="bg-white border border-slate-350 pr-8 pl-3 py-1.5 text-xs font-black rounded-lg text-[#003366] cursor-pointer outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            {Object.keys(DEPARTMENTS).map((key) => (
              <option key={key} value={key}>
                💼 {key} Department
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Admin Tab Sub-navigation controls */}
      <div className="flex border-b border-slate-205 border-slate-200">
        <button
          id="btn-admin-tab-queues"
          onClick={() => setActiveMainTab('queues')}
          className={`px-6 py-3 font-sans text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeMainTab === 'queues'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-orange-500'
          }`}
        >
          📂 Municipal Queues & Dispatch
        </button>
        <button
          id="btn-admin-tab-insights"
          onClick={() => setActiveMainTab('insights')}
          className={`px-6 py-3 font-sans text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all flex items-center space-x-1.5 ${
            activeMainTab === 'insights'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-orange-500'
          }`}
        >
          <span>🔮 City Insights</span>
          <span className="bg-orange-500 text-white text-[8px] px-1 py-0.2 rounded font-black animate-pulse">AI</span>
        </button>
      </div>

      {activeMainTab === 'insights' ? (
        renderCityInsights()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Complaints Feed sorted by Incoming vs Active */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Sub Queue Tab filter */}
          <div className="flex bg-slate-100 p-1 rounded-full w-full sm:w-fit border border-slate-200 justify-between">
            <button
              id="admin-tab-incoming"
              onClick={() => setQueueTab('incoming')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex-1 sm:flex-initial text-center cursor-pointer ${
                queueTab === 'incoming' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-500'
              }`}
            >
              Incoming Queue ({incomingQueue.length})
            </button>
            <button
              id="admin-tab-active"
              onClick={() => setQueueTab('active')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex-1 sm:flex-initial text-center cursor-pointer ${
                queueTab === 'active' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-500'
              }`}
            >
              Active Resolving ({activeQueue.length})
            </button>
            <button
              id="admin-tab-archive"
              onClick={() => setQueueTab('archive')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex-1 sm:flex-initial text-center cursor-pointer ${
                queueTab === 'archive' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-500'
              }`}
            >
              Resolved / Closed ({archiveQueue.length})
            </button>
          </div>

          <div className="space-y-3">
            {activeList.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-3xl p-12 text-center text-xs text-gray-500">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <h4 className="font-extrabold uppercase tracking-wide">No files in queue!</h4>
                <p className="mt-1">All complaints inside {selectedDeptKey} department are serviced or filed away.</p>
                {queueTab === 'incoming' && (
                  <p className="text-[10px] text-orange-600 mt-2 font-bold bg-orange-50 px-3 py-1 rounded inline-block">
                    Add new tickets from the Citizen View to see them populate here!
                  </p>
                )}
              </div>
            ) : (
              activeList.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    id={`admin-card-${c.id}`}
                    onClick={() => {
                      setSelectedComplaint(c);
                      // Close form sub-panels
                      setShowAssignForm(false);
                      setShowReRouteForm(false);
                      setShowRejectForm(false);
                    }}
                    className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:border-slate-300 flex gap-4 ${
                      isSelected 
                        ? (c.status === 'Reopened' 
                            ? 'ring-2 ring-red-500 border-transparent bg-red-50/10' 
                            : 'ring-2 ring-orange-500 border-transparent bg-slate-50/50') 
                        : (c.status === 'Reopened'
                            ? 'border-red-300 bg-red-50/5'
                            : 'border-slate-200')
                    }`}
                  >
                    <div className="shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border">
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
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-blue-900 flex flex-wrap items-center gap-1.5 font-mono">
                          {c.id}
                          {c.status === 'Reopened' && (
                            <span className="bg-red-500 text-white font-sans text-[8px] font-black px-1.5 py-0.5 rounded animate-pulse">
                              🚨 ESCALATED
                            </span>
                          )}
                          {c.isPossibleDuplicate && (
                            <span className="bg-amber-500 text-white font-sans text-[8.5px] px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5 shadow-xs">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              DUPLICATE REF: {c.duplicateReferenceId}
                            </span>
                          )}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(c.status)}`}>
                          {c.rating ? `⭐ ${c.rating} — ${c.status}` : (c.status === 'Reopened' ? `⚠️ Reopened x${c.reopenCount || 1}` : c.status)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed font-semibold line-clamp-1">
                        {c.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1.5 font-semibold">
                        <span>📍 {c.ward.split(' - ')[1] || c.ward}</span>
                        {c.isStalled ? (
                          <span className="text-red-600 flex items-center font-black animate-pulse">
                            ⚠️ Stalled {c.daysStalled} Days!
                          </span>
                        ) : (
                          <span>Created {new Date(c.dateCreated).toLocaleDateString()}</span>
                        )}
                      </div>

                      {/* Community metrics / dynamic priorities */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 mt-2 text-[9.5px] font-bold">
                        <div className="flex items-center space-x-1 text-blue-900">
                          <Eye className="w-3.5 h-3.5 text-blue-800" />
                          <span>{c.upvotes || 0} verifications</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {(c.upvotes || 0) >= 10 && (
                            <span className="bg-amber-100/95 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded text-[8.5px] font-black">
                              🏅 Verified
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded font-black border text-[8.5px] uppercase ${
                            getEffectivePriority(c) === 'Critical' ? 'bg-red-100 text-red-900 border-red-200 animate-pulse' :
                            getEffectivePriority(c) === 'High' ? 'bg-orange-100 text-orange-955 border-orange-200' :
                            getEffectivePriority(c) === 'Medium' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                            'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            AI PRIORITY: {getEffectivePriority(c)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="self-center hidden sm:block text-gray-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column - Action Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-6">
            
            {selectedComplaint ? (
              <div className="space-y-6">
                
                {/* Selected File header */}
                <div className="pb-4 border-b border-gray-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block font-mono">Case Target</span>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-blue-950">{selectedComplaint.id}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusColor(selectedComplaint.status)}`}>
                      {selectedComplaint.rating ? `⭐ ${selectedComplaint.rating} — ${selectedComplaint.status}` : selectedComplaint.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold pt-1">Citizen: {selectedComplaint.citizenName} ({selectedComplaint.citizenEmail})</p>
                </div>

                {/* Corporator Remark Banner - Prominent Alert Box */}
                {selectedComplaint.corporatorRemarks && selectedComplaint.corporatorRemarks.length > 0 && (
                  <div className="bg-orange-50 border-2 border-orange-400 text-orange-950 rounded-2xl p-4 text-xs font-sans space-y-1.5 shadow-sm animate-pulse" id="admin-panel-corporator-remark">
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

                {selectedComplaint.isPossibleDuplicate && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs font-sans space-y-1.5 shadow-xs animate-fade-in" id="admin-pannel-duplicate-warning">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                      <span>Possible Duplicate Ticket Warning</span>
                    </div>
                    <p className="text-[10.5px] text-amber-750 font-medium leading-relaxed">
                      The citizen bypassed a duplicate check warning for ticket <span className="font-extrabold text-indigo-950 underline">{selectedComplaint.duplicateReferenceId}</span> raised nearby. Consider merging or resolving this conjointly.
                    </p>
                  </div>
                )}

                {/* Photo Evidence in Action View */}
                {selectedComplaint.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img 
                      src={selectedComplaint.imageUrl} 
                      alt="Verification context" 
                      className="w-full h-36 object-cover cursor-zoom-in hover:opacity-90 transition-opacity" 
                      referrerPolicy="no-referrer"
                      onClick={() => setActiveModalImage(selectedComplaint.imageUrl)}
                    />
                    <div className="bg-gray-50 p-2.5 border-t border-gray-100 text-[10.5px] font-medium text-gray-600">
                      🏡 address reference: {selectedComplaint.address}
                    </div>
                  </div>
                )}

                {/* Ticket Details */}
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-extrabold text-blue-900 uppercase text-[10px] tracking-wide">Citizen Concern Description</h4>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 max-h-40 overflow-y-auto leading-relaxed text-gray-600 font-medium whitespace-pre-line">
                    {selectedComplaint.description}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] pt-1 text-gray-500 font-semibold">
                    <span>Nearest Landmark: {selectedComplaint.landmark}</span>
                    <span>Ward Index: {selectedComplaint.ward.split(' - ')[0]}</span>
                  </div>
                </div>

                {/* Sub Panels / Modals for specific actions */}
                {showAssignForm && (
                  <form onSubmit={handleAssignEngineerSubmit} className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-blue-950 flex items-center">
                      <UserCheck className="w-4 h-4 mr-1.5 text-blue-800" />
                      Allot Municipal Engineer
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase">Choose SLA Zone Operator</label>
                      <select
                        id="select-engineer"
                        value={selectedEngineer}
                        onChange={(e) => setSelectedEngineer(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-xs py-2 px-2.5 rounded-lg outline-none font-bold"
                      >
                        {ENGINEERS.map(eng => (
                          <option key={eng} value={eng}>{eng}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase">Set Task Priority Level</label>
                      <select
                        id="select-priority"
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value as any)}
                        className="w-full bg-white border border-gray-300 text-xs py-2 px-2.5 rounded-lg outline-none font-bold"
                      >
                        <option value="Low">🟢 Low</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="High">🟠 High </option>
                        <option value="Critical">🔴 Critical</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setShowAssignForm(false)}
                        className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-lg text-[11px] font-bold text-gray-700 text-center cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        id="btn-assign-engineer-submit"
                        className="flex-1 bg-blue-900 hover:bg-blue-950 text-white px-3 py-2 rounded-lg text-[11px] font-bold text-center cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <span>Confirm Assignment</span>
                      </button>
                    </div>
                  </form>
                )}

                {showReRouteForm && (
                  <form onSubmit={handleReRouteSubmit} className="bg-orange-50 border border-orange-200 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-orange-950 flex items-center">
                      <CornerUpRight className="w-4 h-4 mr-1.5 text-orange-850" />
                      Re-route Jurisdictional Department
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase">Select Target Department</label>
                      <select
                        id="select-reroute-dept"
                        value={targetDeptKey}
                        onChange={(e) => setTargetDeptKey(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-xs py-2 px-2.5 rounded-lg outline-none font-bold"
                      >
                        {Object.keys(DEPARTMENTS).filter(key => key !== selectedDeptKey).map(key => (
                          <option key={key} value={key}>{key} (PCMC)</option>
                        ))}
                      </select>
                    </div>

                    <p className="text-[9px] text-orange-655 leading-relaxed font-semibold italic">
                      Re-routing relocates this file directly to the selected queue. It resets active SLA status back to "Submitted" for their admin team.
                    </p>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReRouteForm(false)}
                        className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-lg text-[11px] font-bold text-gray-700 text-center cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        id="btn-reroute-submit"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-[11px] font-bold text-center cursor-pointer"
                      >
                        Transfer File No
                      </button>
                    </div>
                  </form>
                )}

                {showRejectForm && (
                  <form onSubmit={handleRejectSubmit} className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-red-950 flex items-center">
                      <XCircle className="w-4 h-4 mr-1.5 text-red-800" />
                      Reject Complaint Record
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase">Rejection Grounds / Advisory Note *</label>
                      <textarea
                        rows={2}
                        id="textarea-reject-reason"
                        required
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Provide details e.g., Already serviced, Outside PCMC geographical limits, or duplicate record reference ID."
                        className="w-full bg-white border border-gray-300 text-xs p-2.5 rounded-lg outline-none"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-lg text-[11px] font-bold text-gray-700 text-center cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        id="btn-reject-submit"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-[11px] font-bold text-center cursor-pointer"
                      >
                        Confirm Decline
                      </button>
                    </div>
                  </form>
                )}

                {/* Primary Decision Action Cluster (Only shown if forms are closed) */}
                {!showAssignForm && !showReRouteForm && !showRejectForm && (
                  <div className="space-y-2.5">
                    
                    {/* Engineer Resolution Review Panel */}
                    {selectedComplaint.status === 'Resolution Pending Approval' && (
                      <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black text-amber-900 flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-amber-700 animate-pulse" />
                          Submitted Engineer Resolution Proof
                        </h4>
                        
                        {selectedComplaint.resolutionProofUrl && (
                          <div className="rounded-xl overflow-hidden border border-amber-200">
                            <img 
                              src={selectedComplaint.resolutionProofUrl} 
                              alt="Resolution proof" 
                              className="w-full h-36 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                              referrerPolicy="no-referrer"
                              onClick={() => setActiveModalImage(selectedComplaint.resolutionProofUrl)}
                            />
                          </div>
                        )}

                        <div className="text-xs space-y-1 bg-white p-3 rounded-xl border border-amber-100">
                          <p className="text-[10px] uppercase font-bold text-slate-405">Resolution Description</p>
                          <p className="text-slate-700 font-medium whitespace-pre-wrap">{selectedComplaint.resolutionDescription || 'No description provided.'}</p>
                          <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-500 font-mono">
                            <div>
                              <span>Est Date: </span>
                              <span className="font-bold text-slate-700">{selectedComplaint.estimatedResolutionDate || 'Not set'}</span>
                            </div>
                            <div>
                              <span>Actual Date: </span>
                              <span className="font-bold text-slate-700">{selectedComplaint.actualResolutionDate || 'Not set'}</span>
                            </div>
                          </div>
                        </div>

                        {!showRejectResolutionForm ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              id="admin-btn-approve-res"
                              onClick={() => handleApproveResolution(selectedComplaint)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-1"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve & Close</span>
                            </button>
                            <button
                              type="button"
                              id="admin-btn-reject-res"
                              onClick={() => setShowRejectResolutionForm(true)}
                              className="flex-1 border border-red-200 hover:bg-red-50 text-red-600 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Send Back</span>
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleRejectResolutionSubmit} className="space-y-2 pt-2 border-t border-amber-100">
                            <label className="block text-[10pt] text-red-600 font-extrabold uppercase">Correction Instructions *</label>
                            <textarea
                              id="textarea-reject-resolution-reason"
                              required
                              value={rejectResolutionNote}
                              onChange={(e) => setRejectResolutionNote(e.target.value)}
                              placeholder="Explain what is missing from the resolution or site proof..."
                              className="w-full bg-white border border-red-200 rounded-lg text-xs p-2.5 outline-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setShowRejectResolutionForm(false)}
                                className="flex-1 bg-white border border-slate-250 hover:bg-slate-50 text-slate-600 font-bold p-1.5 rounded-lg text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold p-1.5 rounded-lg text-xs cursor-pointer"
                              >
                                Send Back Now
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                    
                    {/* Step 1: Initial Review (Only show Accept, Reroute, and Reject) */}
                    {selectedComplaint.status === 'Submitted' && (
                      <div className="space-y-2">
                        <button
                          id="admin-btn-accept"
                          onClick={() => handleAcceptReview(selectedComplaint)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-xl text-xs text-center cursor-pointer shadow"
                        >
                          Accept Complaint under Audit Review
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            id="admin-btn-reroute"
                            onClick={() => {
                              setShowReRouteForm(true);
                              setShowAssignForm(false);
                              setShowRejectForm(false);
                            }}
                            className="border border-orange-300 text-orange-700 bg-orange-50/30 hover:bg-orange-50 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer inline-block"
                          >
                            Transfer/Reroute Dept
                          </button>

                          <button
                            id="admin-btn-reject"
                            onClick={() => {
                              setShowRejectForm(true);
                              setShowAssignForm(false);
                              setShowReRouteForm(false);
                            }}
                            className="border border-red-300 text-red-700 bg-red-50/20 hover:bg-red-50 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer inline-block"
                          >
                            Reject with Reason
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: After Accept clicked (No reroute or reject, only Allocate Engineer option) */}
                    {selectedComplaint.status === 'Under Review' && !selectedComplaint.assignedEngineer && (
                      <div className="space-y-2">
                        <div id="admin-accept-success" className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-black text-center shadow-xs">
                          ✅ Complaint Accepted — Now assign to Engineer.
                        </div>
                        <button
                          id="admin-btn-assign"
                          onClick={() => {
                            setShowAssignForm(true);
                            setShowReRouteForm(false);
                            setShowRejectForm(false);
                          }}
                          className="w-full bg-blue-900 hover:bg-blue-950 text-white font-black py-3 rounded-xl text-xs text-center cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <Users className="w-4 h-4" />
                          <span>Allocate SLA Ward Engineer</span>
                        </button>
                      </div>
                    )}

                    {/* Step 3: After Engineer Allocated (Display assigned officer & change/reassign option) */}
                    {selectedComplaint.assignedEngineer && (
                      <div className="bg-blue-50/80 border border-blue-200 p-3.5 rounded-xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">Allocated SLA Ward Officer</p>
                            <p className="font-bold text-slate-800 text-sm">{selectedComplaint.assignedEngineer}</p>
                          </div>
                          {selectedComplaint.status !== 'Resolved' && 
                           selectedComplaint.status !== 'Closed' && 
                           selectedComplaint.status !== 'Rejected' && 
                           selectedComplaint.status !== 'Resolution Pending Approval' && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowAssignForm(true);
                                setShowReRouteForm(false);
                                setShowRejectForm(false);
                              }}
                              className="flex items-center space-x-1 text-[11px] font-extrabold text-blue-900 bg-white border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition-all cursor-pointer shadow-xs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Change Engineer</span>
                            </button>
                          )}
                        </div>
                        {selectedComplaint.priority && (
                          <div className="text-[10.5px] font-medium text-slate-600">
                            Task Priority level set to <span className="font-extrabold text-blue-950">{selectedComplaint.priority}</span>.
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

                {/* Timeline status list preview */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident Event Ledger ({selectedComplaint.history.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedComplaint.history.map((h, i) => (
                      <div key={i} className="text-[11px] leading-tight flex items-start space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0"></div>
                        <div>
                          <span className="font-bold text-gray-700 block">{h.title}</span>
                          <span className="text-gray-500">{h.description}</span>
                          <span className="text-[9px] text-gray-400 block mt-0.5">{new Date(h.date).toLocaleDateString()} &bull; Actor: {h.actor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Users className="w-12 h-12 text-gray-300" />
                <h4 className="text-xs font-black text-gray-600 uppercase tracking-wider">Acquire Operational Record</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Pick any municipal complaint file from the current queue list on your left to begin allocating zone operators or re-routing departments.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
      )}

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
