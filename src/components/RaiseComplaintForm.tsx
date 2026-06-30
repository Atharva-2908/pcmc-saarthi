import React, { useState, useRef } from 'react';
import { 
  X, MapPin, Navigation, Camera, HelpCircle, ArrowLeft, Check, 
  AlertCircle, Upload, Trash2, Landmark, RefreshCw 
} from 'lucide-react';
import { ComplaintCategory } from '../types';
import { WARDS } from '../data';

// Helper to compress and resize images to max 1024px width before API dispatch
const compressImage = (base64Str: string, maxWidth = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      if (img.width <= maxWidth) {
        resolve(base64Str);
        return;
      }
      
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

interface RaiseComplaintFormProps {
  onClose: () => void;
  onSubmit: (formData: {
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
  }) => void;
}

export default function RaiseComplaintForm({ onClose, onSubmit }: RaiseComplaintFormProps) {
  const [category, setCategory] = useState<ComplaintCategory>('Roads');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('');
  const [ward, setWard] = useState(WARDS[3]); // Default Ward 4 (Wakad)
  const [address, setAddress] = useState('Chowk Main Street, Pimpri-Chinchwad, Pune');
  const [latitude, setLatitude] = useState<number | undefined>(18.5987);
  const [longitude, setLongitude] = useState<number | undefined>(73.7656);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [confirmEvidence, setConfirmEvidence] = useState(false);

  // AI-Specific States
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatusText, setAiStatusText] = useState('Detecting issue type...');
  const [aiFeedback, setAiFeedback] = useState<{ detectedFeature: string; severity: string } | null>(null);
  const [nonCivicWarning, setNonCivicWarning] = useState<string | null>(null);
  const [aiSeverityScore, setAiSeverityScore] = useState<number | undefined>(undefined);
  const [detectedFeature, setDetectedFeature] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: ComplaintCategory[] = [
    'Roads', 'Water', 'Electricity', 'Garbage', 'Drainage', 
    'Encroachment', 'Traffic', 'Environment', 'Fire', 'Health'
  ];

  // AI Photo Analysis Trigger (Express Backend is the proxy)
  const analyzePhotoWithAI = async (base64Data: string) => {
    setAiAnalyzing(true);
    setAiProgress(0);
    setAiStatusText('Detecting issue type...');
    setNonCivicWarning(null);
    setAiFeedback(null);
    setAiSeverityScore(undefined);
    setDetectedFeature(undefined);
    setCategory('Roads');
    setDescription('');

    const progressInterval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = Math.floor(Math.random() * 8) + 5; // smooth jumps
        const next = Math.min(prev + increment, 95);
        if (next < 30) {
          setAiStatusText('Detecting issue type...');
        } else if (next < 60) {
          setAiStatusText('Analyzing severity...');
        } else if (next < 85) {
          setAiStatusText('Preparing suggestions...');
        } else {
          setAiStatusText('Optimizing report details...');
        }
        return next;
      });
    }, 250);

    try {
      const response = await fetch('/api/gemini/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data }),
      });

      if (!response.ok) {
        throw new Error('Analysis server failed to respond');
      }

      const data = await response.json();

      setAiProgress(100);
      setAiStatusText('Analysis complete!');
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (!data.isCivicIssue) {
        setNonCivicWarning('This image does not appear to show a civic issue. Please upload a relevant photo.');
        return;
      }

      if (data.category) {
        setCategory(data.category as ComplaintCategory);
      }
      if (data.description) {
        setDescription(data.description);
      }
      if (data.priorityScore) {
        setAiSeverityScore(data.priorityScore);
      }
      if (data.detectedFeature) {
        setDetectedFeature(data.detectedFeature);
      }
      setAiFeedback({
        detectedFeature: data.detectedFeature || 'Civic Issue',
        severity: data.severity || 'Medium',
      });
    } catch (err) {
      console.error('Saarthi AI analysis failed:', err);
    } finally {
      clearInterval(progressInterval);
      setAiAnalyzing(false);
    }
  };

  // Auto Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        
        // Simulating reverse geocoding with PCMC localities for realistic outputs
        let localPCMCAddress = 'Near Akurdi Railway Station Road, Akurdi, Pimpri-Chinchwad - 411035';
        if (ward.includes('Wakad')) {
          localPCMCAddress = `Datta Mandir Area, Wakad, Pimpri-Chinchwad, Pune - 411057 (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
        } else if (ward.includes('Nigdi')) {
          localPCMCAddress = `Sector 26, Nigdi Pradhikaran, Pimpri-Chinchwad, Pune - 411044 (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
        } else if (ward.includes('Pimpri')) {
          localPCMCAddress = `Dr. Ambedkar Chowk near Central Plaza, Pimpri, Pune - 411018 (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
        } else {
          localPCMCAddress = `Sector Road, ${ward.split(' - ')[1]}, Pimpri-Chinchwad, Pune (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
        }
        
        setAddress(localPCMCAddress);
        setLocating(false);
      },
      (error) => {
        console.error('Geolocation failed: ', error);
        // Fallback simulated points while keeping it robust
        const simLat = 18.5987 + (Math.random() - 0.5) * 0.05;
        const simLng = 73.7656 + (Math.random() - 0.5) * 0.05;
        setLatitude(simLat);
        setLongitude(simLng);
        setAddress(`Simulated Location Pin, Near ${ward.split(' - ')[1] || 'Wakad'}, Pimpri-Chinchwad, Pune`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Convert uploaded photo to dataurl for instant memory-state storage
  const handlePhotoUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            const compressed = await compressImage(reader.result);
            setImageUrl(compressed);
            analyzePhotoWithAI(compressed);
          } catch (e) {
            console.error('Image compression failed', e);
            setImageUrl(reader.result);
            analyzePhotoWithAI(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file (PNG/JPG/JPEG).');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoUpload(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (description.trim().length < 15) {
      newErrors.description = 'Please describe the issue in detail (minimum 15 characters).';
    }
    if (landmark.trim() === '') {
      newErrors.landmark = 'Nearest landmark helps ward operators pinpoint the site.';
    }
    if (!address.trim()) {
      newErrors.address = 'A general neighborhood reference was not detected. Please key in.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      category,
      description,
      landmark,
      ward,
      address,
      latitude,
      longitude,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop', // default civic placeholder if skipped
      aiSeverityScore,
      detectedFeature: detectedFeature || (aiFeedback ? aiFeedback.detectedFeature : undefined)
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans" id="raise-complaint-form">
      {/* Back link bar */}
      <button
        onClick={onClose}
        className="flex items-center space-x-1.5 text-xs text-gray-500 hover:text-blue-900 font-bold transition-all mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Title details */}
        <div className="border-b border-gray-100 pb-5">
          <div className="flex items-center space-x-3 text-orange-500 mb-1">
            <Landmark className="w-5.5 h-5.5 text-blue-900" />
            <span className="text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-3 py-1 rounded">PCMC Redressal Protocol</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-blue-950">Lodge Official Ticket Request</h2>
          <p className="text-xs text-gray-400 mt-1">Submit visual proofs and geo-tags. Ward operators will process this case instantly.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col - Category, Ward, description */}
            <div className="space-y-5">
              
              {/* Category picker */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide">Category of Concern *</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      id={`cat-btn-${cat}`}
                      onClick={() => setCategory(cat)}
                      className={`py-2.5 px-3 rounded-xl text-left text-xs font-bold border transition-all ${
                        category === cat 
                          ? 'bg-blue-900 text-white border-blue-950 shadow-sm' 
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {cat === 'Roads' && 'Roads & Potholes'}
                      {cat === 'Water' && 'Water Leakage/Cut'}
                      {cat === 'Electricity' && 'Electricity & Poles'}
                      {cat === 'Garbage' && 'Garbage Disposal'}
                      {cat === 'Drainage' && 'Drainage Leakage'}
                      {cat === 'Encroachment' && 'Encroachment'}
                      {cat === 'Traffic' && 'Traffic Blockages'}
                      {cat === 'Environment' && 'Parks & Trees'}
                      {cat === 'Fire' && 'Fire Safety'}
                      {cat === 'Health' && 'Public Health'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ward selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide">Select Municipal Ward *</label>
                <select
                  id="form-ward-selector"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-bold outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 cursor-pointer"
                >
                  {WARDS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-400 font-medium">Auto-reroutes coordinates to respective micro-corporation zones.</span>
              </div>

              {/* Nearest Landmark */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide">Nearest Landmark / Street *</label>
                <input
                  type="text"
                  id="form-input-landmark"
                  placeholder="e.g. Opposite Walekar Petrol Pump or Behind Datta School"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 ${
                    errors.landmark ? 'border-red-400' : 'border-gray-250'
                  }`}
                />
                {errors.landmark ? (
                  <p className="text-[10px] text-red-600 font-bold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.landmark}</p>
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium">Critical for field crew finding the site accurately on tour.</span>
                )}
              </div>

            </div>

            {/* Right Col - Photo uploader, Auto location detector */}
            <div className="space-y-5">
              
               {/* Photo Uploader */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide">Upload Photo Evidence *</label>
                
                {/* Drag n Drop Box */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all p-4 text-center ${
                    aiAnalyzing
                      ? 'border-indigo-400 bg-indigo-50/10'
                      : dragActive 
                      ? 'border-blue-900 bg-blue-50/10' 
                      : imageUrl 
                      ? 'border-green-400 bg-green-50/5' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="form-file-input"
                    disabled={aiAnalyzing}
                  />

                  {aiAnalyzing ? (
                    <div className="flex flex-col items-center justify-center space-y-4 p-4 w-full max-w-xs mx-auto">
                      <div className="relative flex items-center justify-center">
                        <RefreshCw className="w-10 h-10 text-orange-500 animate-spin" />
                        <span className="absolute text-[10px] font-black text-indigo-950">{aiProgress}%</span>
                      </div>
                      <div className="space-y-2 w-full text-center">
                        <span className="text-xs font-black text-indigo-950 block animate-pulse">{aiStatusText}</span>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner border border-slate-300">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${aiProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : imageUrl ? (
                    <div className="space-y-2 w-full h-full relative group">
                      <img 
                        src={imageUrl} 
                        alt="Preview uploaded" 
                        className="w-full h-full object-contain rounded-xl"
                      />
                      {/* Delete Overlay */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageUrl('');
                          setAiFeedback(null);
                          setNonCivicWarning(null);
                          setCategory('Roads');
                          setDescription('');
                          setAiSeverityScore(undefined);
                          setDetectedFeature(undefined);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow shadow-red-600/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="form-file-input" className="w-full h-full flex flex-col items-center justify-center cursor-pointer space-y-3.5">
                      <div className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 mx-auto w-fit shadow-xs">
                        <Camera className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <span className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer inline-flex items-center space-x-1.5 shadow transition-all">
                          <Camera className="w-4 h-4" />
                          <span>Upload Image</span>
                        </span>
                        <span className="text-[10px] text-gray-400 block font-medium">Camera, Camera Roll, or files (Max 10MB)</span>
                      </div>
                    </label>
                  )}
                </div>

                {/* AI Analysis Alerts & Banners */}
                {nonCivicWarning && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3.5 text-xs font-bold flex items-start space-x-2 animate-fade-in" id="ai-non-civic-warning">
                    <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{nonCivicWarning}</span>
                  </div>
                )}

                {aiFeedback && !nonCivicWarning && (
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-2xl p-3.5 text-xs font-semibold flex items-start space-x-2.5 shadow-xs animate-fade-in" id="ai-feedback-banner">
                    <span className="text-lg shrink-0">✨</span>
                    <div>
                      <span className="font-extrabold block text-indigo-950">
                        Saarthi AI detected: <span className="text-orange-600 font-black">{aiFeedback.detectedFeature}</span> — <span className="text-orange-600 font-black">{aiFeedback.severity} Severity</span>
                      </span>
                      <span className="text-[10px] text-indigo-600 block mt-0.5">Fields auto-filled. Please review and edit if needed.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto Location detection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide">Geo Location Coordinates *</label>
                
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="text-xs font-bold text-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 text-orange-500 mr-1.5 shrink-0" />
                      <span>{latitude && longitude ? `Coordinates Locked: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]` : 'Coordinates empty'}</span>
                    </div>
                    
                    <button
                      type="button"
                      id="form-btn-detect-location"
                      onClick={handleDetectLocation}
                      disabled={locating}
                      className="bg-blue-900 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl hover:bg-blue-950 transition-all flex items-center space-x-1.5 self-start pointer cursor-pointer disabled:opacity-50"
                    >
                      {locating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Detect Auto Location</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Geocoded Mock address text block */}
                  <textarea
                    rows={2}
                    id="form-textarea-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full bg-white border text-xs px-3 py-2 outline-none rounded-xl focus:border-blue-900 ${
                      errors.address ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="Lodge verified street location, segment boundary index..."
                  />
                  {errors.address && (
                    <p className="text-[10px] text-red-600 font-bold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.address}</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Core Description Text Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wide">Detailed description of concern *</label>
            <textarea
              id="form-textarea-description"
              rows={4}
              placeholder="Describe the complaint in detail. (e.g. Broken water pipe leaking in street lane. This is happening for 3 days and there is low water pressure in our building taps...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 ${
                errors.description ? 'border-red-400' : 'border-gray-250'
              }`}
            />
            {errors.description ? (
              <p className="text-[10px] text-red-600 font-bold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.description}</p>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">Describe clearly so field engineers carry the exact parts or machinery required.</span>
            )}
          </div>

          {/* Notice SLA Accord / Submit Trigger */}
          <div className="border-t border-gray-150 pt-5 space-y-4">
            <label className="flex items-start gap-2.5 bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-confirm-evidence"
                checked={confirmEvidence}
                onChange={(e) => setConfirmEvidence(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
              />
              <span className="text-xs text-amber-950 font-semibold select-none leading-relaxed">
                I confirm the photo evidence matches the current site condition. I understand false reporting may lead to account action.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[10px] text-gray-400 max-w-md font-medium text-center sm:text-left">
                By filing this complaint, you certify that the photo evidence matches the current site condition. False logging or misuse is subject to citizen account lock.
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto px-4.5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="form-btn-submit"
                  disabled={!confirmEvidence}
                  className="w-1/2 sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-transparent border-b-2 border-orange-700 active:border-b-0 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 font-black" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
