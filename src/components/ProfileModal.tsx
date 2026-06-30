import React from 'react';
import { X, User, Phone, Mail, MapPin, Briefcase, LogOut, ShieldAlert, Award } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({ user, onClose, onLogout }: ProfileModalProps) {
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'citizen':
        return {
          label: 'Citizen Reporter',
          classes: 'bg-orange-100 text-orange-850 border-orange-200',
          icon: <User className="w-4 h-4 text-orange-600" />
        };
      case 'admin':
        return {
          label: 'Dept Admin',
          classes: 'bg-indigo-100 text-indigo-850 border-indigo-200',
          icon: <Briefcase className="w-4 h-4 text-indigo-600" />
        };
      case 'engineer':
        return {
          label: 'Field SLA Engineer',
          classes: 'bg-teal-100 text-teal-850 border-teal-200',
          icon: <Award className="w-4 h-4 text-teal-600" />
        };
      case 'corporator':
        return {
          label: 'Honorable Ward Corporator',
          classes: 'bg-amber-100 text-amber-850 border-amber-200',
          icon: <Award className="w-4 h-4 text-amber-600 animate-pulse" />
        };
      default:
        return {
          label: 'Public Guest',
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <User className="w-4 h-4 text-slate-500" />
        };
    }
  };

  const badge = getRoleBadge(user.role);

  return (
    <div className="fixed inset-0 bg-[#001529]/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in" id="profile-details-modal">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200">
        
        {/* Top ribbon decoration */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-400 via-white to-green-500 rounded-t-3xl"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Header Avatar and Role */}
        <div className="text-center space-y-3 pt-2">
          <div className="mx-auto w-16 h-16 bg-blue-50 border-2 border-blue-900 rounded-full flex items-center justify-center font-black text-xl text-blue-950 shadow-md">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-blue-950 uppercase">{user.name}</h3>
            <div className={`inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-black uppercase rounded-full border ${badge.classes}`}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>
          </div>
        </div>

        {/* Profile Stats / Description */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-200 pb-1.5">Official Credentials</h4>
          
          <div className="space-y-3 text-xs">
            {/* Contact Info */}
            <div className="flex items-center space-x-3 text-slate-750">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wide">Contact Phone</span>
                <span className="font-bold">{user.mobile || 'N/A'}</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3 text-slate-750">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wide">Email Address</span>
                <span className="font-bold break-all">{user.email || 'N/A'}</span>
              </div>
            </div>

            {/* Ward */}
            {user.ward && (
              <div className="flex items-center space-x-3 text-slate-750">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wide">Represented Ward</span>
                  <span className="font-black text-indigo-950">{user.ward}</span>
                </div>
              </div>
            )}

            {/* Employee ID */}
            {user.employeeId && (
              <div className="flex items-center space-x-3 text-slate-750">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wide">PCMC Employee ID</span>
                  <span className="font-mono font-black text-orange-650 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded text-[11px]">{user.employeeId}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Warning / Info */}
        <div className="text-[10px] leading-relaxed text-slate-400 font-bold text-center flex items-center justify-center space-x-1.5 pt-2">
          <ShieldAlert className="w-4.5 h-4.5 text-blue-900 shrink-0" />
          <span>Active Session is encrypted with SSL (256-Bit Standard)</span>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
          >
            Close
          </button>
          
          <button
            type="button"
            id="btn-profile-logout"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 shadow-sm shadow-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure Logout</span>
          </button>
        </div>

      </div>
    </div>
  );
}
