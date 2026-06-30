import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, User, Briefcase, Phone, KeyRound, ArrowLeft, ArrowRight, 
  MapPin, Landmark, Eye, EyeOff, CheckCircle2, UserPlus, Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginPagesProps {
  onLoginSuccess: (user: UserProfile) => void;
  onExplorePublic?: () => void;
}

export function LoginPages({ onLoginSuccess, onExplorePublic }: LoginPagesProps) {
  const [view, setView] = useState<'selector' | 'citizen-login' | 'staff-login' | 'citizen-register'>('selector');

  React.useEffect(() => {
    const saved = localStorage.getItem('pcmc_registered_citizens');
    if (!saved) {
      const seedCitizens: UserProfile[] = [
        {
          name: 'AMIT PATIL',
          role: 'citizen',
          mobile: '9876543210',
          email: 'amit.patil@example.com',
          ward: 'Ward 4 (Wakad - Thergaon)'
        },
        {
          name: 'SUNITA JOSHI',
          role: 'citizen',
          mobile: '9876543211',
          email: 'sunita.joshi@example.com',
          ward: 'Ward 8 (Nigdi - Sector 24)'
        },
        {
          name: 'RAHUL MORE',
          role: 'citizen',
          mobile: '9876543212',
          email: 'rahul.more@example.com',
          ward: 'Ward 3 (Pimpri - Kalbhor Nagar)'
        }
      ];
      localStorage.setItem('pcmc_registered_citizens', JSON.stringify(seedCitizens));
    }
  }, []);

  // Citizen Login States
  const [mobileNumber, setMobileNumber] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [citizenError, setCitizenError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Citizen Registration States
  const [registerName, setRegisterName] = useState('');
  const [registerMobile, setRegisterMobile] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerWard, setRegisterWard] = useState('Ward 12 (Pimple Saudagar)');
  const [registerError, setRegisterError] = useState('');

  // Staff Login States
  const [staffRole, setStaffRole] = useState<'admin' | 'engineer' | 'corporator'>('admin');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staffError, setStaffError] = useState('');

  const pcmcWards = [
    'Ward 1 (Chinchwad - Pradhikaran)',
    'Ward 2 (Bhosari - Landewadi)',
    'Ward 3 (Pimpri - Kalbhor Nagar)',
    'Ward 4 (Wakad - Thergaon)',
    'Ward 5 (Hinjawadi - Tathawade)',
    'Ward 6 (Akurdi - Yamuna Nagar)',
    'Ward 7 (Sangvi - Pimple Gurav)',
    'Ward 8 (Nigdi - Sector 24)',
    'Ward 9 (Ravet - Kiwale)',
    'Ward 10 (Talawade - Rupeenagar)',
    'Ward 12 (Pimple Saudagar)',
  ];

  // Send OTP handler
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setCitizenError('');
    if (!mobileNumber || mobileNumber.length < 10) {
      setCitizenError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setShowOtp(true);
    }, 800);
  };

  // Verify OTP handler
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setCitizenError('');
    if (otp !== '1234') {
      setCitizenError('Invalid OTP. Please use the demo code "1234".');
      return;
    }

    // Retrieve from registered citizens list
    const savedCitizensStr = localStorage.getItem('pcmc_registered_citizens');
    let savedCitizens: UserProfile[] = [];
    if (savedCitizensStr) {
      try {
        savedCitizens = JSON.parse(savedCitizensStr);
      } catch (err) {
        savedCitizens = [];
      }
    }

    // Lookup citizen profile matching the unique mobile number
    const matchedCitizen = savedCitizens.find(
      (c) => c.mobile === mobileNumber
    );

    if (matchedCitizen) {
      onLoginSuccess(matchedCitizen);
    } else {
      setCitizenError('No registered profile found for this mobile number. Please register first using the "New user? Register here" link below.');
    }
  };

  // Register Citizen handler
  const handleRegisterCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerName.trim()) {
      setRegisterError('Please enter your full name.');
      return;
    }
    if (!registerMobile || registerMobile.length < 10) {
      setRegisterError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setRegisterError('Please enter a valid email address.');
      return;
    }

    const newUser: UserProfile = {
      name: registerName.toUpperCase(),
      role: 'citizen',
      mobile: registerMobile,
      email: registerEmail,
      ward: registerWard
    };

    // Save newly registered citizen to localStorage
    const savedCitizensStr = localStorage.getItem('pcmc_registered_citizens');
    let savedCitizens: UserProfile[] = [];
    if (savedCitizensStr) {
      try {
        savedCitizens = JSON.parse(savedCitizensStr);
      } catch (err) {
        savedCitizens = [];
      }
    }

    // Filter out any previous registration with the same mobile to prevent duplicate records
    const updatedCitizens = savedCitizens.filter((c) => c.mobile !== registerMobile);
    updatedCitizens.push(newUser);
    localStorage.setItem('pcmc_registered_citizens', JSON.stringify(updatedCitizens));

    onLoginSuccess(newUser);
  };

  // Staff Login handler
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');

    if (!employeeId.trim()) {
      setStaffError('Please enter a valid PCMC Employee ID.');
      return;
    }
    if (!password.trim()) {
      setStaffError('Please enter your account password.');
      return;
    }

    let staffName = 'SHREE DESHMUKH';
    let staffEmail = 'admin.deshmukh@pcmc.gov.in';
    let staffWard = undefined;

    if (staffRole === 'engineer') {
      staffName = 'ENG. VIJAY SHINDE';
      staffEmail = 'vijay.shinde@pcmc.gov.in';
      staffWard = 'Ward 4 (Wakad)';
    } else if (staffRole === 'corporator') {
      staffName = 'HON. SACIN CHINCHWADE';
      staffEmail = 'sachin.chinchwade@corporator.pcmc.gov.in';
      staffWard = 'Ward 1 (Chinchwad - Pradhikaran)';
    }

    const staffUser: UserProfile = {
      name: staffName,
      role: staffRole,
      email: staffEmail,
      mobile: '9881234567',
      employeeId: employeeId.toUpperCase(),
      ward: staffWard
    };

    onLoginSuccess(staffUser);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 font-sans" id="login-flow-container">
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: SELECTOR PAGE */}
        {view === 'selector' && (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden relative"
            id="login-selector-card"
          >
            {/* National Tricolor Banner top accent */}
            <div className="h-1.5 w-full flex">
              <div className="bg-[#FF9933] flex-1"></div>
              <div className="bg-white flex-1"></div>
              <div className="bg-[#138808] flex-1"></div>
            </div>

            <div className="p-8 md:p-12 space-y-8 text-center">
              {/* PCMC Logo Icon */}
              <div className="mx-auto w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center shadow-lg border-2 border-orange-400">
                <span className="text-2xl font-black text-white">P</span>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-blue-950 tracking-tight">
                  PCMC <span className="text-orange-500 font-extrabold">SAARTHI</span>
                </h2>
                <p className="text-sm text-gray-550 font-semibold uppercase tracking-wider">
                  Official Public Grievance & Smart Redressal Portal
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Pimpri Chinchwad Municipal Corporation's AI-enabled responsive administration system.
                </p>
              </div>

              {/* Access Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {/* Button 1: Citizen Login */}
                <button
                  type="button"
                  id="btn-goto-citizen-login"
                  onClick={() => setView('citizen-login')}
                  className="p-6 bg-orange-50 hover:bg-orange-100/80 border-2 border-orange-200 hover:border-orange-400 rounded-2xl text-left transition-all group cursor-pointer shadow-sm relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:opacity-10 transition-all text-orange-500">
                    <User className="w-32 h-32" />
                  </div>
                  <div className="bg-orange-500 text-white rounded-xl p-3 w-fit mb-4 shadow-md group-hover:scale-105 transition-all">
                    <User className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-blue-950 flex items-center">
                    <span>Citizen Portal</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-orange-600" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Lodge regional issues, verify duplicate tickets, and upvote ongoing resolutions.
                  </p>
                </button>

                {/* Button 2: Staff Login */}
                <button
                  type="button"
                  id="btn-goto-staff-login"
                  onClick={() => setView('staff-login')}
                  className="p-6 bg-blue-50/50 hover:bg-blue-50 border-2 border-blue-100 hover:border-blue-300 rounded-2xl text-left transition-all group cursor-pointer shadow-sm relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:opacity-10 transition-all text-blue-900">
                    <Briefcase className="w-32 h-32" />
                  </div>
                  <div className="bg-blue-900 text-white rounded-xl p-3 w-fit mb-4 shadow-md group-hover:scale-105 transition-all">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-blue-950 flex items-center">
                    <span>Staff Console</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-800" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Review incoming reports, coordinate field teams, and log resolution metrics.
                  </p>
                </button>
              </div>

              {onExplorePublic && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onExplorePublic}
                    className="text-xs font-black text-[#003366] hover:text-orange-500 hover:underline cursor-pointer flex items-center justify-center space-x-1.5 mx-auto"
                  >
                    <span>🌍 Public Transparency Portal & Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Smart City Tag */}
              <div className="pt-4 flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-slate-100">
                <Landmark className="w-3.5 h-3.5 text-[#003366]" />
                <span>Pimpri Chinchwad Smart City Initiative</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: CITIZEN LOGIN */}
        {view === 'citizen-login' && (
          <motion.div
            key="citizen-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
            id="citizen-login-card"
          >
            <div className="h-1.5 w-full bg-orange-500"></div>

            <div className="p-8 space-y-6">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setView('selector');
                  setShowOtp(false);
                  setOtp('');
                  setMobileNumber('');
                  setCitizenError('');
                }}
                className="inline-flex items-center text-slate-500 hover:text-orange-500 text-xs font-bold uppercase tracking-wider cursor-pointer space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-blue-950">Citizen Portal Access</h3>
                <p className="text-xs text-gray-400 font-medium">Lodge new issues, track progress, or support regional improvements.</p>
              </div>

              {!showOtp ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">Enter Mobile Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="Enter 10-digit number (e.g. 9876543210)"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {citizenError && (
                    <p className="text-[10.5px] text-red-600 font-extrabold flex items-center gap-1">
                      ⚠️ {citizenError}
                    </p>
                  )}

                  <button
                    type="submit"
                    id="btn-send-otp"
                    disabled={isSendingOtp}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-350 text-white font-black py-3 px-4 rounded-xl text-xs text-center border-b-2 border-orange-700 hover:border-orange-800 transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
                  >
                    {isSendingOtp ? (
                      <span>Sending Secure Code...</span>
                    ) : (
                      <>
                        <span>Send Authentication OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">Enter 4-Digit OTP</label>
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Demo Code: 1234</span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Enter 1234 to proceed"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all tracking-widest text-center"
                      />
                    </div>
                  </div>

                  {citizenError && (
                    <p className="text-[10.5px] text-red-600 font-extrabold flex items-center gap-1">
                      ⚠️ {citizenError}
                    </p>
                  )}

                  <button
                    type="submit"
                    id="btn-verify-otp"
                    className="w-full bg-blue-900 hover:bg-blue-950 text-white font-black py-3 px-4 rounded-xl text-xs text-center border-b-2 border-blue-950 transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <span>Verify & Login to Dashboard</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="w-full text-center text-[11px] text-indigo-900 hover:underline font-bold"
                  >
                    Change Mobile Number
                  </button>
                </form>
              )}

              {/* Registration Link */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  id="link-goto-register"
                  onClick={() => {
                    setView('citizen-register');
                    setCitizenError('');
                    setRegisterError('');
                  }}
                  className="inline-flex items-center space-x-1 text-xs font-black text-indigo-900 hover:text-orange-500 hover:underline cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>New user? Register here</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: REGISTER CITIZEN */}
        {view === 'citizen-register' && (
          <motion.div
            key="citizen-register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
            id="citizen-register-card"
          >
            <div className="h-1.5 w-full bg-indigo-900"></div>

            <div className="p-8 space-y-5">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setView('citizen-login');
                  setRegisterError('');
                }}
                className="inline-flex items-center text-slate-500 hover:text-[#003366] text-xs font-bold uppercase tracking-wider cursor-pointer space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-blue-950">Register Citizen Profile</h3>
                <p className="text-xs text-gray-400">Join PCMC Saarthi for local community collaboration.</p>
              </div>

              <form onSubmit={handleRegisterCitizen} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AMIT PATIL"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number (e.g. 9876543210)"
                    value={registerMobile}
                    onChange={(e) => setRegisterMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. amit.patil@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Ward Selection */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide">Select Your Ward</label>
                  <div className="relative">
                    <select
                      value={registerWard}
                      onChange={(e) => setRegisterWard(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all cursor-pointer"
                    >
                      {pcmcWards.map((w, index) => (
                        <option key={index} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {registerError && (
                  <p className="text-[10.5px] text-red-600 font-extrabold">
                    ⚠️ {registerError}
                  </p>
                )}

                <button
                  type="submit"
                  id="btn-register-submit"
                  className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-black py-3 px-4 rounded-xl text-xs text-center border-b-2 border-indigo-950 transition-all cursor-pointer shadow-md"
                >
                  Create Account & Login
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: STAFF LOGIN */}
        {view === 'staff-login' && (
          <motion.div
            key="staff-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
            id="staff-login-card"
          >
            <div className="h-1.5 w-full bg-blue-900"></div>

            <div className="p-8 space-y-6">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setView('selector');
                  setEmployeeId('');
                  setPassword('');
                  setStaffError('');
                }}
                className="inline-flex items-center text-slate-500 hover:text-blue-900 text-xs font-bold uppercase tracking-wider cursor-pointer space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-blue-950">PCMC Staff Console</h3>
                <p className="text-xs text-gray-400 font-medium font-sans">Authorized login for department administrators, ward corporators, and engineers.</p>
              </div>

              <form onSubmit={handleStaffLogin} className="space-y-4">
                {/* Dropdown Role */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide">Designation Role</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-850 outline-none focus:border-blue-800 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="admin">🏢 Department Administrator (Dept Admin)</option>
                    <option value="engineer">👷 Field SLA Engineer (Engineer)</option>
                    <option value="corporator">⚔️ Honorable Ward Corporator (Corporator)</option>
                  </select>
                </div>

                {/* Employee ID */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide">Employee ID</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-2026-9481"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-850 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide">Account Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Shield className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-850 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-450 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {staffError && (
                  <p className="text-[10.5px] text-red-600 font-extrabold">
                    ⚠️ {staffError}
                  </p>
                )}

                <button
                  type="submit"
                  id="btn-staff-login-submit"
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white font-black py-3 px-4 rounded-xl text-xs text-center border-b-2 border-blue-955 transition-all cursor-pointer shadow-md"
                >
                  Verify & Enter Staff Console
                </button>
              </form>

              {/* Notice */}
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 flex items-start space-x-2 text-[10px] text-amber-900 font-bold">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Note: Staff accounts are created by PCMC IT department in production. Enter any Employee ID and Password in Demo Mode.
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
