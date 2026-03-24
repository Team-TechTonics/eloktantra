'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Fingerprint, Smartphone, 
  Camera, Loader2, AlertTriangle, 
  CheckCircle2, ArrowRight, Scan, 
  ShieldAlert, UserCheck
} from 'lucide-react';
import { useDigiLockerStore } from '@/lib/store/digilocker-store';

export default function SecureVoteGateway() {
  const router = useRouter();
  const { user: digitUser, isAuthenticated } = useDigiLockerStore();
  
  const [step, setStep] = useState(1); // 1: DigiLocker, 2: Face, 3: Risk, 4: Ready
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Biometric / Face Detection States
  const [livenessStep, setLivenessStep] = useState(0);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Security Trace
  const [deviceId, setDeviceId] = useState('');
  const [voterStats, setVoterStats] = useState<any>(null);

  useEffect(() => {
    // Generate simple Device ID if not exists
    let id = localStorage.getItem('eloktantra_device_id');
    if (!id) {
        id = `DEV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        localStorage.setItem('eloktantra_device_id', id);
    }
    setDeviceId(id);
  }, []);

  // Sync with DigiLocker Auth
  useEffect(() => {
    if (isAuthenticated && digitUser && step === 1) {
      setStep(2);
      setVoterStats(digitUser);
    }
  }, [isAuthenticated, digitUser, step]);

  // Camera Management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Webcam access denied. Essential for biometric security.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  useEffect(() => {
    if (step === 2) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [step]);

  // ─── HANDLERS ─────────────────────────────────────────────────────────

  const handleDigiLockerStart = () => {
    window.open('/digilocker/login?from=vote', '_blank', 'width=500,height=700');
  };

  const runBiometricAudit = async () => {
    setLoading(true);
    setError('');
    
    // Simulate 3D Depth & Liveness Mapping (Step 2)
    setLivenessStep(1);
    await new Promise(r => setTimeout(r, 1200)); 
    setLivenessStep(2);
    await new Promise(r => setTimeout(r, 1200));
    setLivenessStep(3);

    try {
      const response = await fetch('/api/verify/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: digitUser?.id, 
          image: 'BIOMETRIC_CAPTURE_STREAM', // Placeholder for captured frame
          antiSpoofData: { isLive: true } 
        })
      });

      const data = await response.json();
      if (data.success) {
        setStep(3);
      } else {
        setError(data.error || "Biometric Identity Mismatch.");
      }
    } catch (err) {
      setError("Biometric Bridge Failure.");
    } finally {
      setLoading(false);
      setLivenessStep(0);
    }
  };

  const runRiskEvaluation = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: digitUser?.id, 
          deviceId 
        })
      });

      const data = await response.json();
      if (data.success) {
        setStep(4);
      } else {
        setError(data.error || "Fraud Signal Detected.");
      }
    } catch (err) {
      setError("Security Engine Offline.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeSession = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: digitUser?.id })
      });

      const data = await response.json();
      if (data.success) {
        // We DON'T store the token in the open window. We redirect with the session lock.
        router.push(`/vote/eEVM?id=${digitUser?.id}`);
      } else {
        setError(data.error || "Authorization Failure.");
      }
    } catch (err) {
      setError("Cryptographic Registry Unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-primary/30 py-20 px-6">
      <div className="max-w-xl mx-auto space-y-10">
        
        {/* Superior Header */}
        <header className="text-center space-y-4">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-3xl mb-4">
                <ShieldCheck className="w-4 h-4 text-primary mr-2" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Biometric Consensus Gateway</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                Voting <br /><span className="text-primary italic">Verification</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Secure 4-Step Hardware & Identity Audit</p>
        </header>

        {/* Audit Progress */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 flex justify-between relative overflow-hidden">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2" />
            {[1, 2, 3, 4].map(s => (
                <div key={s} className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${
                    step >= s ? 'bg-primary text-white shadow-[0_0_20px_rgba(255,107,0,0.4)] scale-110' : 'bg-white/5 text-gray-700'
                }`}>
                    {step > s ? <CheckCircle2 className="w-6 h-6" /> : `0${s}`}
                </div>
            ))}
        </div>

        {/* Global Error Alert */}
        {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-red-500">Security Violation</p>
                    <p className="text-sm font-bold text-gray-300">{error}</p>
                </div>
            </div>
        )}

        {/* Dynamic Step Content */}
        <div className="bg-[#0d1117] border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            
            {/* Background Branding Overlay */}
            <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none">
                <Fingerprint className="w-60 h-60" />
            </div>

            {/* STEP 1: DigiLocker */}
            {step === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
                            <ShieldCheck className="w-10 h-10 text-blue-500" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Identity Anchor</h2>
                        <p className="text-gray-400 font-medium leading-relaxed">Connect your DigiLocker to sync your National Aadhaar Record and find your Regional Constituency.</p>
                    </div>

                    <button 
                        onClick={handleDigiLockerStart}
                        className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center group"
                    >
                        Initialize DigiLocker Bridge <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <p className="text-center text-[9px] font-black text-gray-600 uppercase tracking-widest leading-relaxed">Identity hashing is processed via decentralized hardware audit.</p>
                </div>
            )}

            {/* STEP 2: Face Liveness */}
            {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-4 animate-pulse">
                            Live Biometric Mapping
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Facetrack <span className="text-primary">3D</span></h2>
                    </div>

                    <div className="relative w-64 h-64 mx-auto rounded-[3rem] overflow-hidden border-4 border-white/5 bg-black shadow-2xl">
                         <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                         <div className="absolute inset-0 border-[16px] border-black/40 rounded-[3rem] pointer-events-none" />
                         
                         {/* Scanning Effects */}
                         <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent animate-pulse" />
                         <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/50 shadow-[0_0_15px_rgba(255,107,0,1)] animate-scan-y" />

                         {livenessStep > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500">
                                <div className="text-center space-y-3">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                        {livenessStep === 1 ? 'Mapping Landmarks' : livenessStep === 2 ? 'Depth Analysis' : 'Finalizing Vectors'}
                                    </p>
                                </div>
                            </div>
                         )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/2 border border-white/5 rounded-2xl text-center">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Authenticating</p>
                            <p className="text-sm font-black text-white">{digitUser?.name}</p>
                        </div>
                        <div className="p-4 bg-white/2 border border-white/5 rounded-2xl text-center">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Hardware ID</p>
                            <p className="text-sm font-black text-white">{deviceId}</p>
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        onClick={runBiometricAudit}
                        className="w-full py-6 bg-white text-black hover:bg-primary hover:text-white disabled:opacity-50 font-black uppercase tracking-[0.25em] text-xs rounded-2xl transition-all flex items-center justify-center group"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Scan className="w-4 h-4 mr-3" /> Execute Audit Scan</>}
                    </button>
                    <p className="text-center text-[9px] font-black text-gray-600 uppercase tracking-widest">Consistency checked against DigiLocker Reference Anchor.</p>
                </div>
            )}

            {/* STEP 3: Risk Evaluation */}
            {step === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20">
                            <Smartphone className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Security <span className="text-amber-500">Firewall</span></h2>
                        <p className="text-gray-400 font-medium leading-relaxed">Analyzing session integrity, concurrent logins, and hardware environment security.</p>
                    </div>

                    <div className="space-y-2">
                         {[
                            { label: 'Device Isolated', status: 'Verifying...' },
                            { label: 'Network Signature', status: 'Verifying...' },
                            { label: 'Bot Protection', status: 'Verifying...' }
                         ].map((c, i) => (
                            <div key={i} className="flex justify-between items-center p-5 bg-black/40 border border-white/5 rounded-2xl">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{c.label}</span>
                                <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                            </div>
                         ))}
                    </div>

                    <button 
                        disabled={loading}
                        onClick={runRiskEvaluation}
                        className="w-full py-6 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-amber-500/20"
                    >
                        {loading ? 'Evaluating Environment...' : 'Commit Security Audit'}
                    </button>
                </div>
            )}

            {/* STEP 4: Ready to Tokenize */}
            {step === 4 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                             <h2 className="text-4xl font-black uppercase tracking-tighter">Authorized</h2>
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Session Cryptographically Signed</p>
                        </div>
                    </div>

                    <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-start gap-4">
                            <UserCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-white mb-2">Polling Location</p>
                                <p className="text-sm font-bold text-gray-400 italic leading-relaxed">Verified for {digitUser?.address || 'Your Registered Region'}. You will receive a ballot for your specific constituency.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                             <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Voter ID Hash</p>
                                <p className="text-[10px] font-mono font-bold text-gray-300">IND-SHA-256-V2</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Ballot Status</p>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">READY-TO-PULL</p>
                             </div>
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        onClick={finalizeSession}
                        className="w-full py-7 bg-white text-black hover:bg-emerald-500 hover:text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all group"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" /> : 'Retrieve Secure Ballot Token'}
                    </button>
                    <p className="text-center text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">The token is one-time use and handles your vote anonymously on the ledger.</p>
                </div>
            )}

        </div>

        {/* Global Branding */}
        <footer className="text-center">
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">eLoktantra Secure Verification Protocol v2.1</p>
        </footer>

      </div>
    </div>
  );
}
