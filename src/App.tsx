/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import CitizenDashboard from './components/CitizenDashboard';
import RaiseComplaintForm from './components/RaiseComplaintForm';
import AdminDashboard from './components/AdminDashboard';
import CorporatorDashboard from './components/CorporatorDashboard';
import EngineerDashboard from './components/EngineerDashboard';
import { LoginPages } from './components/LoginPages';
import ProfileModal from './components/ProfileModal';
import { Complaint, ComplaintCategory, TimelineEvent, UserProfile } from './types';
import { INITIAL_COMPLAINTS, DEPARTMENTS } from './data';
import { Layers, ArrowRight, CheckCircle2, ShieldAlert, X } from 'lucide-react';

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('pcmc_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      } catch (e) {}
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('pcmc_is_logged_in') === 'true';
  });

  const [currentRole, setCurrentRole] = useState<'citizen' | 'admin' | 'corporator' | 'engineer' | 'public' | 'login-selector'>(() => {
    const saved = localStorage.getItem('pcmc_current_user');
    if (saved && localStorage.getItem('pcmc_is_logged_in') === 'true') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) return parsed.role;
      } catch (e) {}
    }
    return 'login-selector';
  });

  const [citizenEmail, setCitizenEmail] = useState(() => {
    const saved = localStorage.getItem('pcmc_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed?.email || 'amit.patil@example.com';
      } catch (e) {}
    }
    return 'amit.patil@example.com';
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);
  
  // Duplicate check modal state holder
  const [duplicateCheck, setDuplicateCheck] = useState<{
    formData: {
      category: ComplaintCategory;
      description: string;
      landmark: string;
      ward: string;
      address: string;
      latitude?: number;
      longitude?: number;
      imageUrl?: string;
      aiSeverityScore?: number;
      detectedFeature?: string;
    };
    duplicate: Complaint;
  } | null>(null);

  // Initialize and load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('pcmc_saarthi_complaints');
    if (saved) {
      try {
        setComplaints(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved complaints', err);
        setComplaints(INITIAL_COMPLAINTS);
      }
    } else {
      setComplaints(INITIAL_COMPLAINTS);
      localStorage.setItem('pcmc_saarthi_complaints', JSON.stringify(INITIAL_COMPLAINTS));
    }
  }, []);

  // Sync to local storage on changes
  const saveComplaints = (updatedComplaints: Complaint[]) => {
    setComplaints(updatedComplaints);
    localStorage.setItem('pcmc_saarthi_complaints', JSON.stringify(updatedComplaints));
  };

  // citizen registers new complaint
  const handleAddComplaint = (formData: {
    category: ComplaintCategory;
    description: string;
    landmark: string;
    ward: string;
    address: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
    aiSeverityScore?: number;
    detectedFeature?: string;
  }, forceAction = false) => {
    
    // Check for duplicate prior to processing
    if (!forceAction && formData.latitude !== undefined && formData.longitude !== undefined) {
      const dupe = complaints.find(comp => {
        if (comp.category !== formData.category) return false;
        // ignore closed, resolved, or rejected complaints to avoid matching archival cases
        if (comp.status === 'Resolved' || comp.status === 'Closed' || comp.status === 'Rejected') return false;
        if (comp.latitude === undefined || comp.longitude === undefined) return false;
        
        const dist = getDistanceInMeters(formData.latitude, formData.longitude, comp.latitude, comp.longitude);
        return dist <= 500;
      });

      if (dupe) {
        setDuplicateCheck({ formData, duplicate: dupe });
        return; // Halt and show duplicate approval modal
      }
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `PCMC-2026-${randomSuffix}`;
    
    const isPossibleDuplicate = forceAction && duplicateCheck?.duplicate ? true : false;
    const duplicateReferenceId = forceAction && duplicateCheck?.duplicate ? duplicateCheck.duplicate.id : undefined;

    const newComplaint: Complaint = {
      id: newId,
      citizenName: currentUser ? currentUser.name : 'Guest Citizen',
      citizenEmail: currentUser ? currentUser.email : 'guest@example.com',
      category: formData.category,
      description: formData.description,
      landmark: formData.landmark,
      ward: formData.ward,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      imageUrl: formData.imageUrl,
      status: 'Submitted',
      department: DEPARTMENTS[formData.category] || DEPARTMENTS.Roads,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      isStalled: false,
      daysStalled: 0,
      corporatorRemarks: [],
      aiSeverityScore: formData.aiSeverityScore,
      detectedFeature: formData.detectedFeature,
      isPossibleDuplicate,
      duplicateReferenceId,
      history: [
        {
          id: `ev-${Date.now()}`,
          status: 'Submitted',
          title: isPossibleDuplicate ? 'Complaint Registered (Potential Duplicate)' : 'Complaint Registered',
          description: isPossibleDuplicate 
            ? `Citizen forced ticket submission despite duplicate warning. Linked to existing ticket ${duplicateReferenceId} as possible duplicate. Sent to municipal queue.`
            : `Citizen registered via Saarthi Web Portal. Geo-Coordinates locked. Sent to ${formData.category} Admin queue.`,
          date: new Date().toISOString(),
          actor: 'Citizen',
        }
      ]
    };

    const updated = [newComplaint, ...complaints];
    saveComplaints(updated);
    setShowRaiseForm(false);
    setDuplicateCheck(null);
    setSuccessTicketId(newId);
  };

  // admin updates complaint records
  const handleUpdateComplaint = (updatedDetails: Complaint) => {
    const updated = complaints.map((c) => (c.id === updatedDetails.id ? updatedDetails : c));
    saveComplaints(updated);
  };

  // corporator posts active warning remarks on any stalling case
  const handleAddCorporatorRemark = (complaintId: string, remark: string) => {
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const pastRemarks = c.corporatorRemarks || [];
        const pastHistory = c.history || [];
        
        const newEvent: TimelineEvent = {
          id: `ev-cor-${Date.now()}`,
          status: 'Remark Added',
          title: 'Corporator Directive Issued',
          description: `Honorable Corporator issued severe warning directive: "${remark}"`,
          date: new Date().toISOString(),
          actor: 'Corporator Office',
        };

        const newRemark = {
          remark,
          timestamp: new Date().toISOString()
        };

        return {
          ...c,
          corporatorRemarks: [...pastRemarks, newRemark],
          history: [...pastHistory, newEvent],
          dateUpdated: new Date().toISOString()
        };
      }
      return c;
    });

    saveComplaints(updated);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentRole(user.role);
    setCitizenEmail(user.email);
    localStorage.setItem('pcmc_current_user', JSON.stringify(user));
    localStorage.setItem('pcmc_is_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentRole('login-selector');
    setCitizenEmail('guest@example.com');
    localStorage.removeItem('pcmc_current_user');
    localStorage.removeItem('pcmc_is_logged_in');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col justify-between" id="pcmc-saarthi-app-root">
      
      {/* Top Header with navigation controls */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onProfileClick={() => setShowProfileModal(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentRole === 'login-selector' && (
          <LoginPages
            onLoginSuccess={handleLoginSuccess}
            onExplorePublic={() => setCurrentRole('public')}
          />
        )}

        {currentRole === 'public' && (
          <LandingPage
            complaints={complaints}
            setCurrentRole={(role) => {
              if (role === 'public') {
                setCurrentRole('public');
              } else {
                setCurrentRole('login-selector');
              }
            }}
            onRaiseClick={() => {
              setCurrentRole('login-selector');
            }}
          />
        )}

        {currentRole === 'citizen' && currentUser && (
          showRaiseForm ? (
            <RaiseComplaintForm
              onClose={() => setShowRaiseForm(false)}
              onSubmit={handleAddComplaint}
            />
          ) : (
            <CitizenDashboard
              complaints={complaints}
              citizenEmail={citizenEmail}
              isLoggedIn={isLoggedIn}
              onRaiseClick={() => setShowRaiseForm(true)}
              onLoginClick={() => setShowProfileModal(true)}
              onUpdateComplaint={handleUpdateComplaint}
            />
          )
        )}

        {currentRole === 'admin' && currentUser && (
          <AdminDashboard
            complaints={complaints}
            onUpdateComplaint={handleUpdateComplaint}
          />
        )}

        {currentRole === 'corporator' && currentUser && (
          <CorporatorDashboard
            complaints={complaints}
            currentUser={currentUser}
            onAddCorporatorRemark={handleAddCorporatorRemark}
          />
        )}

        {currentRole === 'engineer' && currentUser && (
          <EngineerDashboard
            complaints={complaints}
            onUpdateComplaint={handleUpdateComplaint}
          />
        )}
      </main>

      {/* Indian Civic Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-200"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#138808]"></span>
          <span className="font-semibold text-gray-500">PCMC Saarthi</span>
        </div>
        <p className="font-semibold text-[11px] text-gray-500 max-w-lg mx-auto">
          PCMC Saarthi — Independent civic-tech prototype. Not an official government platform. Built for Coding Ninjas x Google Hackathon 2026.
        </p>
      </footer>

      {/* Profile Details Modal */}
      {showProfileModal && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
        />
      )}      {/* Duplicate Detection Warning Modal */}
      {duplicateCheck && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="duplicate-warning-modal">
          <div className="bg-white rounded-3xl max-w-md w-full border border-orange-250 p-6 md:p-8 shadow-2xl relative space-y-6">
            <div className="flex bg-orange-100 text-orange-600 rounded-2xl p-3 w-fit">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-indigo-950 font-sans">A similar complaint already exists nearby</h3>
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                We detected that <span className="font-bold text-orange-600">{duplicateCheck.duplicate.id}</span> was raised <span className="font-bold text-orange-600">
                  {(() => {
                    const elapsed = Date.now() - new Date(duplicateCheck.duplicate.dateCreated).getTime();
                    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
                    return days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
                  })()}
                </span> under the same category (<span className="font-semibold">{duplicateCheck.duplicate.category}</span>) within 500 meters of your coordinates.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs font-sans space-y-2.5">
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                <span>Existing Complaint details</span>
                <span>PCMC Record</span>
              </div>
              <p className="text-gray-700 font-semibold italic">"{duplicateCheck.duplicate.description.slice(0, 100)}..."</p>
              <div className="text-[10px] text-gray-550 flex items-center justify-between font-bold">
                <span>📍 {duplicateCheck.duplicate.landmark}</span>
                <span className="bg-orange-100 text-orange-850 px-2 py-0.5 rounded font-black">🔥 {duplicateCheck.duplicate.upvotes || 0} Upvotes</span>
              </div>
            </div>

            <p className="text-[11px] text-indigo-950 font-bold text-center font-sans">
              Would you like to upvote that complaint instead or continue raising a new one?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="btn-duplicate-upvote"
                onClick={() => {
                  const updated = complaints.map(c => {
                    if (c.id === duplicateCheck.duplicate.id) {
                      const u = c.upvotes || 0;
                      const hasUpvoted = c.upvoters?.includes(citizenEmail);
                      return {
                        ...c,
                        upvotes: hasUpvoted ? u : u + 1,
                        upvoters: hasUpvoted ? (c.upvoters || []) : [...(c.upvoters || []), citizenEmail]
                      };
                    }
                    return c;
                  });
                  saveComplaints(updated);
                  setDuplicateCheck(null);
                  setShowRaiseForm(false);
                  alert(`Thank you! You have successfully upvoted complaint ${duplicateCheck.duplicate.id} instead of lodging a duplicate.`);
                }}
                className="w-full sm:w-1/2 py-3 bg-blue-900 border-b-2 border-blue-950 text-white font-semibold hover:bg-blue-950 rounded-xl text-xs transition-all cursor-pointer text-center"
              >
                👍 Upvote Existing
              </button>
              <button
                type="button"
                id="btn-duplicate-continue"
                onClick={() => {
                  handleAddComplaint(duplicateCheck.formData, true);
                }}
                className="w-full sm:w-1/2 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
              >
                Continue Anyway
              </button>
            </div>
            
            <button
              onClick={() => setDuplicateCheck(null)}
              className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        </div>
      )}

      {/* Submission Success Modal */}
      {successTicketId && (
        <div className="fixed inset-0 bg-[#001529]/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="submission-success-modal">
          <div className="bg-white rounded-3xl max-w-md w-full border border-green-200 p-6 md:p-8 shadow-2xl relative space-y-6 text-center">
            
            {/* Tricolor top border */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-400 via-white to-green-500 rounded-t-3xl"></div>
            
            <div className="mx-auto flex bg-green-100 text-green-600 rounded-2xl p-4 w-fit">
              <CheckCircle2 className="w-10 h-10 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-blue-950 font-sans">Submission Successful</h3>
              <p className="text-sm text-gray-650 font-semibold leading-relaxed px-2">
                Your complaint #{successTicketId} has been submitted successfully. You will be notified once it is reviewed.
              </p>
            </div>

            <button
              type="button"
              id="btn-success-modal-close"
              onClick={() => setSuccessTicketId(null)}
              className="w-full py-3 bg-blue-900 text-white font-black hover:bg-blue-950 rounded-xl text-xs transition-all cursor-pointer text-center shadow-md border-b-2 border-blue-950"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
