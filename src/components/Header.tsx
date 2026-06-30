import React, { useState, useEffect } from 'react';
import { Clock, User, Landmark, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentRole: 'citizen' | 'admin' | 'corporator' | 'engineer' | 'public' | 'login-selector';
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  onProfileClick: () => void;
}

export default function Header({
  currentRole,
  currentUser,
  isLoggedIn,
  onProfileClick
}: HeaderProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'citizen':
        return 'Citizen Portal';
      case 'admin':
        return 'Dept Admin Console';
      case 'engineer':
        return 'Field Engineer Console';
      case 'corporator':
        return 'Corporator Console';
      default:
        return '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#003366] text-white shadow-lg shrink-0 select-none" id="pcmc-app-header">
      {/* Indian Flag Ribbon Trim at the very top */}
      <div className="h-1.5 w-full flex">
        <div className="bg-[#FF9933] flex-1"></div> {/* Saffron */}
        <div className="bg-white flex-1"></div>       {/* White */}
        <div className="bg-[#138808] flex-1"></div>   {/* Green */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center font-black text-lg text-white shadow-md shrink-0 border border-orange-400">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2 leading-none">
                <span className="text-[10px] text-orange-200 uppercase tracking-widest font-extrabold font-sans">
                  Smart Redressal Platform
                </span>
                <span className="text-[9px] text-blue-200 hidden md:inline-flex items-center font-semibold">
                  <Clock className="w-3 h-3 mr-1" /> {todayStr} | {time}
                </span>
              </div>
              <h1 className="text-base font-black leading-none tracking-tight text-white flex items-center space-x-1.5">
                <span>PCMC</span> <span className="text-orange-400 font-extrabold font-sans">SAARTHI</span>
              </h1>
            </div>
          </div>

          {/* User Session Profile Link (No Switching controls allowed) */}
          <div className="flex items-center">
            {isLoggedIn && currentUser ? (
              <button
                type="button"
                id="btn-header-profile-trigger"
                onClick={onProfileClick}
                className="flex items-center gap-2.5 hover:bg-white/10 px-3.5 py-1.5 rounded-2xl border border-white/15 transition-all cursor-pointer active:scale-95 group"
              >
                {/* Text details */}
                <div className="flex flex-col text-right">
                  <span className="text-xs font-black text-white leading-none uppercase group-hover:text-orange-350 transition-colors">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-orange-200 font-extrabold uppercase mt-0.5 tracking-wider">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center border border-white/40 text-xs text-white font-black shadow-sm shrink-0 transition-colors">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              </button>
            ) : (
              <div className="flex items-center bg-[#001f3f] border border-white/10 rounded-full px-3 py-1.5 text-[10px] text-orange-300 font-black uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400 mr-1.5 animate-pulse" />
                <span>SECURE ACCESS PORTAL</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
