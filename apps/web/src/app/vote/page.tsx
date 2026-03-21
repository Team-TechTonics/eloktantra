'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';

export default function VotePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState('');
  const [votingToken, setVotingToken] = useState('');
  const [error, setError] = useState('');
  const [livenessStep, setLivenessStep] = useState(0);
  const [livenessCountdown, setLivenessCountdown] = useState(0);
  const [isPoseLocked, setIsPoseLocked] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionRef = useRef<any>(null);
  const isPoseLockedRef = useRef(false);
  const router = useRouter();

  const livenessInstructions = [
    "Focus your eyes on the center",
    "Slowly turn your head LEFT",
    "Slowly turn your head RIGHT",
    "Now look UP towards the CEILING",
    "Now look DOWN at your KEYBOARD",
    "STAY STILL: Finalizing Biometric Scan..."
  ];

  const livenessStatus = [
    "Calibrating Biometrics...",
    "Validating Head Rotation...",
    "Confirming Profile Geometry...",
    "Checking Depth Landmarks...",
    "Detecting Anti-Spoof Patterns...",
    "Finalizing Verification..."
  ];

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Model loading failed:", err);
      }
    };
    loadModels();

    const searchParams = new URLSearchParams(window.location.search);
    const verified = searchParams.get('verified');
    const userId = searchParams.get('userId');

    if (verified === 'true' && userId) {
      setStep(2);
      setUser({ id: userId, name: 'Ramanuj' });
    }
  }, []);

  const handleDigiLockerMock = () => {
    setError('');
    // Open in a new tab instead of a popup
    window.open('/digilocker/login?from=vote', '_blank');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setError("Camera access denied. Please enable your webcam.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
  const startLivenessFlow = async () => {
    if (!modelsLoaded) {
      setError("AI Models are still loading. Please wait...");
      return;
    }

    setLivenessStep(0);
    setLivenessCountdown(3);
    setLoading(true);
    setIsPoseLocked(false);
    let current = 0;
    
    const checkPose = async () => {
      if (!videoRef.current || step !== 2) return;

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (!detection) {
        setIsPoseLocked(false);
        setLivenessCountdown(3); // Reset timer if face lost
        requestAnimationFrame(checkPose);
        return;
      }

      const landmarks = detection.landmarks;
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const mouth = landmarks.getMouth();

      const faceWidth = Math.abs(rightEye[3].x - leftEye[0].x);
      const faceCenter = (leftEye[0].x + rightEye[3].x) / 2;
      const noseTip = nose[3];

      let isCurrentPoseCorrect = false;

      // Real Pose Logic
      if (current === 0) { // Center
        isCurrentPoseCorrect = Math.abs(noseTip.x - faceCenter) < faceWidth * 0.15;
      } else if (current === 1) { // Left
        isCurrentPoseCorrect = (noseTip.x - faceCenter) < -faceWidth * 0.2;
      } else if (current === 2) { // Right
        isCurrentPoseCorrect = (noseTip.x - faceCenter) > faceWidth * 0.2;
      } else if (current === 3) { // Up
        const eyeNoseDist = noseTip.y - (leftEye[0].y + rightEye[3].y)/2;
        isCurrentPoseCorrect = eyeNoseDist < faceWidth * 0.2;
      } else if (current === 4) { // Down
        const eyeNoseDist = noseTip.y - (leftEye[0].y + rightEye[3].y)/2;
        isCurrentPoseCorrect = eyeNoseDist > faceWidth * 0.4;
      } else {
        isCurrentPoseCorrect = true; // Hold Still
      }

      if (isCurrentPoseCorrect) {
        if (!isPoseLocked) {
          setIsPoseLocked(true);
          isPoseLockedRef.current = true;
        }
      } else {
        setIsPoseLocked(false);
        isPoseLockedRef.current = false;
        setLivenessCountdown(3);
      }

      requestAnimationFrame(checkPose);
    };

    // Run the real detection loop
    checkPose();

    // The countdown logic now only progresses if isPoseLocked is true
    const interval = setInterval(() => {
      setLivenessCountdown(prev => {
        if (isPoseLockedRef.current && prev <= 1) {
          if (current < livenessInstructions.length - 1) {
            current++;
            setLivenessStep(current);
            isPoseLockedRef.current = false; // Require new lock for next step
            setIsPoseLocked(false);
            return 3;
          } else {
            clearInterval(interval);
            completeFaceVerification();
            return 0;
          }
        } else if (isPoseLockedRef.current) {
          return prev - 1;
        }
        return 3; 
      });
    }, 1000); 
  };

  const completeFaceVerification = async () => {
    setLoading(true);
    try {
      // 1. Capture Image
      const canvas = document.createElement('canvas');
      if (videoRef.current) {
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      }
      const image = canvas.toDataURL('image/png');

      // 2. Call backend for matching and liveness validation
      // Fallback: If user.id is missing, use session-id
      const finalUserId = user?.id || `anon-${Date.now()}`;
      
      const response = await fetch('http://localhost:5001/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, userId: finalUserId })
      });
      const data = await response.json();

      if (data.success) {
        stopCamera();
        setStep(3);
      } else {
        setError(data.error || 'Face verification failed');
      }
    } catch (err) {
      setError('Internal verification error');
    } finally {
      setLoading(false);
    }
  };

  const handleRiskAndToken = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call backend to generate real voting token
      const response = await fetch('http://localhost:5001/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      const data = await response.json();

      if (data.success) {
        setVotingToken(data.token);
        setStep(4);
      } else {
        setError(data.error || 'Identity evaluation failed');
      }
    } catch (err) {
      setError('Security bridge unavailable');
    } finally {
      setLoading(false);
    }

  };
  
  useEffect(() => {
    if (step === 2) {
      startCamera();
    }
    return () => stopCamera();
  }, [step]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="max-w-2xl w-full bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 z-0"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(step - 1) * 33}%` }}></div>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center z-10 text-sm font-bold transition-all ${step >= s ? 'bg-primary text-white scale-110' : 'bg-[#222] text-gray-500'}`}>
              {s}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: DigiLocker Auth */}
        {step === 1 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold mb-4 text-white">Identity Verification</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              To proceed with voting, we need to verify your identity using <span className="text-white font-semibold">DigiLocker</span>. This ensures a "One Person, One Vote" policy.
            </p>
            <button
              onClick={handleDigiLockerMock}
              disabled={loading}
              className="w-full py-4 bg-[#2162da] hover:bg-[#1a4fb0] disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-3 shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-2.18c-1.39-.41-2.5-1.52-2.91-2.91L5.91 11.41C4.7 12.33 4 13.59 4 15c0 2.21 1.79 4 4 4 1.1 0 2.06-.45 2.74-1.16l.26-.34zm.16-6.66l2.18-1.55c-.16-.3-.34-.58-.54-.84l-1.64 2.39zm3.93 1.57l1.55 2.18c.3-.16.58-.34.84-.54l-2.39-1.64z"/></svg>
                  <span>Connect DigiLocker</span>
                </>
              )}
            </button>
            <p className="mt-6 text-xs text-gray-500">Secure connection powered by eLoktantra Auth Bridge</p>
          </div>
        )}

        {/* Step 2: Automated Face Verification */}
        {step === 2 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black mb-4 text-white uppercase tracking-tighter">AI Liveness Shield</h1>
            <p className="text-gray-400 mb-8 leading-relaxed font-medium">
              Authenticating <span className="text-primary font-bold">{user?.name}</span>...
            </p>
            
            <div className="relative w-72 h-72 mx-auto mb-10 group">
               {/* Scanning Pulse Elements */}
               <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
               <div className="absolute -inset-2 rounded-full border-2 border-primary/40 border-dotted animate-spin-slow"></div>
               
               <div className="w-full h-full rounded-full border-4 border-white/10 overflow-hidden bg-black shadow-2xl shadow-primary/20 relative z-10 transition-transform duration-700">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* High-tech Scanning UI Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-[12px] border-black/40 rounded-full"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/40 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/40 animate-pulse"></div>
                  
                  {/* Step Success Overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                       <div className="w-full h-1 bg-primary/20 absolute bottom-1/4">
                          <div 
                             className="h-full bg-primary transition-all duration-[2800ms] linear" 
                             style={{ width: loading ? '100%' : '0%' }}
                             key={livenessStep}
                          ></div>
                       </div>
                    </div>
                  )}
               </div>
               
               {livenessStep < 5 && loading && (
                 <div 
                   data-pose-locked={isPoseLocked}
                   className={`absolute -top-6 -right-6 p-4 rounded-3xl shadow-2xl border-4 font-black transition-all duration-300 scale-110
                   ${isPoseLocked ? 'bg-primary text-white border-white animate-pulse' : 'bg-white text-black border-primary'}`}>
                   <div className="text-[10px] uppercase opacity-70 tracking-widest mb-1">
                     {isPoseLocked ? 'Capturing' : 'Aligning'}
                   </div>
                   <div className="text-2xl">
                     {isPoseLocked ? `${livenessCountdown}s` : '...'}
                   </div>
                 </div>
               )}
            </div>

            <div className={`
              mb-10 p-6 rounded-3xl border transition-all duration-500
              ${isPoseLocked ? 'bg-primary/20 border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/5'}
            `}>
               <p className={`text-lg font-black uppercase tracking-[0.2em] transition-all
                 ${isPoseLocked ? 'text-white scale-105' : 'text-gray-500'}`}>
                  {livenessInstructions[livenessStep]}
               </p>
               {livenessStep < 6 && loading && (
                 <p className="text-[10px] font-bold text-primary mt-2 uppercase tracking-widest leading-none">
                   {isPoseLocked ? livenessStatus[livenessStep] : "Move your head to begin scan"}
                 </p>
               )}
            </div>

            {!loading || livenessStep >= 6 ? (
              <button
                onClick={startLivenessFlow}
                className="w-full py-5 bg-primary hover:bg-accent text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 uppercase tracking-[0.4em] text-sm group"
              >
                <span className="group-hover:translate-x-1 transition-transform block">START BIO-SCAN</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-4 py-5 text-gray-400 font-extrabold uppercase tracking-widest text-[10px] italic">
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                 Mapping Facial Contours...
              </div>
            )}
          </div>
        )}

        {/* Step 3: Risk Evaluation */}
        {step === 3 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold mb-4 text-white">Security Check</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              One final step. Our AI risk engine is evaluating your session parameters for security compliance.
            </p>
            
            <div className="space-y-4 mb-8">
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                 <span className="text-sm text-gray-400">Device Trusted</span>
                 <span className="text-green-500 font-bold text-sm">SECURE</span>
               </div>
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                 <span className="text-sm text-gray-400">Location Signature</span>
                 <span className="text-green-500 font-bold text-sm">VERIFIED</span>
               </div>
            </div>

            <button
              onClick={handleRiskAndToken}
              disabled={loading}
              className="w-full py-4 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-bold rounded-xl transition-all"
            >
              {loading ? "Evaluating..." : "Complete Security Check"}
            </button>
          </div>
        )}

        {/* Step 4: Success & Token */}
        {step === 4 && (
          <div className="text-center animate-in zoom-in duration-700">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-white">Verification Complete</h1>
            <p className="text-gray-400 mb-8">
              Verification successful. You are now authorized to cast your vote.
            </p>
            
            <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl mb-8">
              <span className="text-xs text-primary font-bold uppercase tracking-widest block mb-2">Your One-Time Voting Token</span>
              <div className="text-xl font-mono text-white font-bold tracking-wider break-all">
                {votingToken}
              </div>
              <p className="text-[10px] text-gray-500 mt-4">This token expires in 2 hours and can only be used once.</p>
            </div>

            <button
              onClick={() => router.push('/vote/delhi-2024?token=' + votingToken)}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-xl shadow-red-500/20 group"
            >
              <span className="group-hover:translate-x-1 transition-transform block">Proceed to eEVM Console →</span>
            </button>
            
            <p className="mt-6 text-sm text-gray-500">Voting stage will open in the next phase of the project.</p>
          </div>
        )}

      </div>
    </div>
  );
}
