'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useStrictVotingLock } from "@/hooks/useStrictVotingLock"
import axios from "axios"
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSecureVotingSession } from '@/hooks/useSecureVotingSession';
import { useElection, generateVotingToken, castVote } from '@/lib/api/voting';
import { useDigiLockerStore } from '@/lib/store/digilocker-store';

import { getStoredUser } from '@/lib/api/auth';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import * as faceapi from 'face-api.js';

// Declare the secureAPI for TypeScript
declare global {
  interface Window {
    secureAPI?: {
      onViolation: (callback: (reason: string) => void) => void;
    };
  }
}

function VotingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const electionId = params?.electionId as string;
  const { user: digitUser } = useDigiLockerStore();


  // Token Enforcement (Moved to top level)
  useEffect(() => {
    const token = searchParams?.get('token');
    if (!token) {
      router.push('/vote');
    }
  }, [router, searchParams]);

  const { data: election, isLoading: isLoadingElection } = useElection(electionId);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [blinking, setBlinking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violations, setViolations] = useState(0);
  const [activeViolation, setActiveViolation] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [faceAligned, setFaceAligned] = useState(false);
  const [facePresent, setFacePresent] = useState(true);
  const [warning, setWarning] = useState("");
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [alignmentMessage, setAlignmentMessage] = useState("Position yourself");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showVVPAT, setShowVVPAT] = useState(false);
  const [voteHash, setVoteHash] = useState("");
  const lastAlertTimeRef = useRef<number>(0);
  const isDevMode = searchParams?.get('dev') === 'true';
  const { isLocked, violated, violationCount, unlock } = useStrictVotingLock();

  // 🛠️ Developer Mode Auto-Bypass
  useEffect(() => {
    // We no longer auto-grant permissions so the developer can see the Identity Verification UI/Rules
  }, [searchParams]);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setupVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const referenceDescriptor = useRef<Float32Array | null>(null);
  const consecutiveNegativeDetections = useRef<number>(0);

  const { session, error, terminateSession, completeSession, resetSession } = useSecureVotingSession(electionId);

  // 🔄 Model loading on mount (Step 1)
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        console.log("Face API Models loaded (tinyFaceDetector)");
      } catch (err) {
        console.error("Failed to load Face API models:", err);
      }
    };

    loadModels();
  }, []);

  // 🚀 React Safety Effect for Stream Binding (Step 2)
  useEffect(() => {
    if (stream && setupVideoRef.current) {
      console.log("Binding stream to video element...");
      setupVideoRef.current.srcObject = stream;

      setupVideoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded. Width:", setupVideoRef.current?.videoWidth);
        setupVideoRef.current?.play().catch(err => {
          console.error("Video play error in useEffect:", err);
        });
      };
    }
  }, [stream]);

  const handleEnableCamera = async () => {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      setStream(camStream);
      setCameraReady(true);

      // Manual binding and play trigger (Step 1)
      if (setupVideoRef.current) {
        setupVideoRef.current.srcObject = camStream;
        setupVideoRef.current.onloadedmetadata = () => {
          console.log("Initial video play attempt. Width:", setupVideoRef.current?.videoWidth);
          setupVideoRef.current?.play().catch(err => {
            console.error("Manual video play error:", err);
          });
        };
      }
    } catch (err) {
      console.error("Camera permission failed", err);
      alert("Camera permission failed");
    }
  };

  const handleEnableMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      setMicReady(true);
    } catch (err) {
      console.error("Microphone permission denied", err);
      alert("Microphone permission denied");
    }
  };

  const handleGrantPermission = async () => {
    if (!cameraReady || !micReady || !faceAligned || multipleFaces) {
      alert(multipleFaces ? "Security violation: Multiple faces detected" : "Please enable BOTH Camera and Microphone access, and ensure your face is aligned.");
      return;
    }
    setIsInitializing(true);
    await initProctoring();
  };


  // 🛡️ SAFE FACE DETECTION LOOP (RELIABLE VERSION)
  useEffect(() => {
    if (!cameraReady || !setupVideoRef.current) return;

    let interval: NodeJS.Timeout;

    // 🚀 STEP 5: DELAY BEFORE START (1.5s)
    const timeout = setTimeout(() => {
      console.log("Starting detection loop after delay...");
      
      interval = setInterval(async () => {
        try {
          if (!setupVideoRef.current) return;

          // 🚀 STEP 2: WAIT FOR VIDEO READY
          if (
            setupVideoRef.current.videoWidth === 0 ||
            setupVideoRef.current.videoHeight === 0
          ) {
            console.log("Waiting for video dimensions...");
            return;
          }

          // 🚀 STEP 4: DEBUG LOGS
          console.log("Video size:", setupVideoRef.current.videoWidth, "x", setupVideoRef.current.videoHeight);

          // 🚀 STEP 3: OPTIMIZED CONFIG
          const detections = await faceapi.detectAllFaces(
            setupVideoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.2
            })
          );

          console.log("Detections found:", detections.length);

          let isAlignedNow = false;
          let currentWarning = "";
          let isMultipleFaces = detections.length > 1;

          // ❌ NO FACE (Step 2 & Step 7)
          if (detections.length === 0) {
            currentWarning = "Ensure proper lighting and face visibility";
            isAlignedNow = false;
          } else if (detections.length > 1) {
          // ❌ MULTIPLE FACES (Step 2)
          currentWarning = "Multiple faces detected";
          isAlignedNow = false;
          if (Date.now() - lastAlertTimeRef.current > 5000) {
            alert("Security violation: Multiple faces detected");
            lastAlertTimeRef.current = Date.now();
          }
        } else {
          // ✅ ONE FACE DETECTED - CHECK ALIGNMENT
          const box = detections[0].box;
          const vw = setupVideoRef.current.videoWidth;
          const vh = setupVideoRef.current.videoHeight;

          if (vw > 0 && vh > 0) {
            const cx = box.x + box.width / 2;
            const cy = box.y + box.height / 2;

            const isCentered =
              cx > vw * 0.3 && cx < vw * 0.7 &&
              cy > vh * 0.3 && cy < vh * 0.7;

            const fullyVisible =
              box.x > 10 && box.y > 10 &&
              box.x + box.width < vw - 10 &&
              box.y + box.height < vh - 10;

            const faceArea = box.width * box.height;
            const frameArea = vw * vh;

            const sizeValid =
              faceArea > frameArea * 0.08 &&
              faceArea < frameArea * 0.4;

            if (!isCentered) {
              currentWarning = "Center your face";
            } else if (!fullyVisible) {
              currentWarning = "Keep full face inside frame";
            } else if (faceArea < frameArea * 0.08) {
              currentWarning = "Move closer";
            } else if (faceArea > frameArea * 0.4) {
              currentWarning = "Too close! Move back";
            } else {
              isAlignedNow = true;
              currentWarning = "";
            }
          }
        }

        // 🎨 Draw Box Function (Step 4) - Using local state to avoid closure issues
        if (canvasRef.current && setupVideoRef.current) {
          const canvas = canvasRef.current;
          const video = setupVideoRef.current;
          
          if (video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              detections.forEach(det => {
                const { x, y, width, height } = det.box;
                ctx.strokeStyle = isAlignedNow ? "#22c55e" : "#ef4444";
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, width, height);
                ctx.shadowBlur = 10;
                ctx.shadowColor = isAlignedNow ? "#22c55e" : "#ef4444";
                ctx.strokeRect(x, y, width, height);
                ctx.shadowBlur = 0;
              });
            }
          }
        }

        // Batch state updates
        setFaceAligned(isAlignedNow);
        setWarning(currentWarning);
        setMultipleFaces(isMultipleFaces);

      } catch (err) {
        console.error("Face detection error:", err);
      }
      }, 800);
    }, 1500);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [cameraReady]);

  // 🛡️ CONTINUOUS AI PROCTORING LOOP (STEP 2)
  useEffect(() => {
    if (!isPermissionGranted || !videoRef.current) return;

    console.log("Starting continuous proctoring loop...");

    const interval = setInterval(async () => {
      try {
        if (!videoRef.current || videoRef.current.videoWidth === 0) return;

        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.2 // Reduced for better sensitivity
          })
        );

        if (detections.length === 0) {
          consecutiveNegativeDetections.current += 1;
          
          // Only trigger violation after 5 consecutive failures (~3.5 seconds)
          if (consecutiveNegativeDetections.current >= 5) {
            setFacePresent(false);
            setWarning("Face not visible");
            setViolations(v => v + 1);
            console.warn("Security Violation: Face missing (persistent)");
          }
          return;
        }

        // ✅ Face found - Reset grace counter
        consecutiveNegativeDetections.current = 0;
        setFacePresent(true);
        setMultipleFaces(detections.length > 1);
        
        if (detections.length > 1) {
          setWarning("Multiple faces detected");
          setViolations(v => v + 1);
        } else {
          setWarning("");
        }

      } catch (err) {
        console.error("Continuous proctoring error:", err);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [isPermissionGranted]);

  // 🛡️ AUTO-TERMINATION LOGIC (STEP 3)
  useEffect(() => {
    if (violations >= 5) {
      alert("Voting terminated due to security violations. Please contact the administrator.");
      window.location.href = "/dashboard";
    }
  }, [violations]);

  // REMOVED OLD detectFaces and startDetectionLoop logic

  const initProctoring = async () => {
    try {
      // 1. Models already loaded in useEffect

      // 2. Obtain/Reuse Camera Stream
      let stream = activeStreamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        activeStreamRef.current = stream;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 🔍 STEP 4: DEBUG CHECK
        console.log("Stream tracks initialized:", stream.getTracks());
        
        // 🔒 STEP 7: SAFETY CHECK
        if (!stream || stream.getVideoTracks().length === 0) {
          alert("Camera Hardware Error: No video tracks detected. Please check your camera connection.");
          setIsInitializing(false);
          return;
        }

        // 🔒 STEP 2 & 3: WAIT FOR VIDEO READY & FORCE PLAY
        await new Promise((resolve) => {
          if (!videoRef.current) return resolve(false);
          videoRef.current.onloadedmetadata = async () => {
             console.log("Metadata Loaded - Native Size:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
             try {
               await videoRef.current?.play();
               resolve(true);
             } catch (playErr) {
               console.warn("Auto-play blocked or failed:", playErr);
               resolve(true); // Still resolve to allow manual play attempts
             }
          };
          // Fallback if metadata already loaded
          if (videoRef.current.readyState >= 1) resolve(true);
        });

        // Detection loop is now handled globally via useEffect
      }

      // 3. Start Recording
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunks.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      setIsPermissionGranted(true);

    } catch (err: any) {
      console.error("Proctoring initialization failed", err);
      const errorMessage = err?.message || "Internal Access Error";
      alert(`Identity Setup Error: ${errorMessage}\n\nPlease refresh the page.`);
      setIsInitializing(false);
    }
  };

  // Electron & Cleanup Effect
  useEffect(() => {
    if (window.secureAPI) {
      window.secureAPI.onViolation((reason) => {
        console.warn("Electron Violation:", reason);
        terminateDueToSecurity(`System violation detected: ${reason}`);
      });
    }

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleViolation = (message: string) => {
    setViolations(prev => {
      const newCount = prev + 1;
      setActiveViolation(message);
      return newCount;
    });
  };

  const terminateDueToSecurity = (message: string) => {
    alert(message);
    terminateSession();
    window.location.href = "/dashboard";
  };

  // Handle Session Errors (bypassed in Developer Mode)
  useEffect(() => {
    const isDevMode = searchParams?.get('dev') === 'true';
    if (error && !isDevMode) {
      alert(`Access Denied: ${error}`);
      router.push("/dashboard/elections");
    }
  }, [error, router, searchParams]);


  useEffect(() => {
    if (violated && !activeViolation) {
      handleViolation("Security violation detected: Leaving voting screen or using restricted keys.");
    }
  }, [violated]);

  // VVPAT Auto-Completion Effect
  useEffect(() => {
    if (showVVPAT) {
      const timer = setTimeout(() => {
        setShowVVPAT(false);
        setIsSubmitting(false);
        completeSession();
        unlock();
        alert(`Vote successfully recorded and verified.\n\nTransaction Hash: ${voteHash}\nViolations: ${violations}\n\nThank you for participating in a secure, transparent election.`);
        router.push("/dashboard");
      }, 7000); // 7 seconds matching real VVPAT display time
      return () => clearTimeout(timer);
    }
  }, [showVVPAT, voteHash, violations, router, completeSession, unlock]);

  if (isLoadingElection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Secure Ballot...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-black uppercase tracking-widest text-lg">Election Not Found</p>
          <button onClick={() => router.push('/dashboard')} className="text-primary hover:underline">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // ─── ⚖️ HIERARCHICAL CANDIDATE FILTERING ─────────────────
  const allCandidates = (election as any)?.candidates || [];
  const candidates = allCandidates.filter((c: any) => 
    !digitUser?.constituencyId || 
    c.constituencyId === digitUser.constituencyId || 
    c.constituencyId === (election as any).constituencyId ||
    isDevMode // Show all in dev mode
  );

  const getElectionYear = () => {
    if (!election?.start_time) return new Date().getFullYear();
    const date = new Date(election.start_time);
    return isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
  };


  const generateVoteHash = () => {
    const hash = Math.random().toString(36).substring(2, 12).toUpperCase();
    setVoteHash(hash);
  };

  const playPrinterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 2);

      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 2);
    } catch (e) {
      console.log("Audio simulation failed", e);
    }
  };

  const stopRecording = () => {
    return new Promise<Blob>((resolve) => {
      if (!mediaRecorderRef.current) return;
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        resolve(blob);
      };
      mediaRecorderRef.current.stop();
    });
  };

  const handleVote = (id: string) => {
    if (selectedCandidate === id) return;
    setSelectedCandidate(id);
    setBlinking(true);

    // Play physical sound
    const audio = new Audio("/button-click-sound.mp3");
    audio.play().catch((err) => console.log("Audio play blocked or failed", err));

    setTimeout(() => {
      setBlinking(false);
    }, 1000);
  };

  const handleVoteSubmission = async (candidateId: string) => {
    if (!candidateId || !election) return;
    
    setIsSubmitting(true);
    try {
      // 1. Capture hardware proof (Video Audit)
      const videoBlob = await stopRecording();
      
      // 2. Submit to HIGH-SECURITY Node.js API
      console.log("Casting ballot via Secure Gateway...");
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          candidateId,
          electionId: election.id,
          constituencyId: digitUser?.constituencyId || (election as any).constituencyId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setVoteHash(result.blockchainHash);
        
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-proof-${electionId}.webm`;
        a.click();
        
        completeSession();
        unlock();
        
        alert(`Voting Successful!\nTransaction: ${result.blockchainHash}`);
        router.push("/dashboard");
      } else {
        throw new Error(result.error || "Ballot rejected.");
      }
    } catch (err: any) {
      console.error("Voting failed:", err);
      alert(`Voting Failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleQuit = async () => {
    if (!confirm("Are you sure you want to quit? This will count as one of your 3 allowed attempts.")) return;
    terminateSession();
    router.push("/login");
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center relative">
      {/* OS-Lock Security Overlay */}
      {violated && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-32 h-32 bg-red-600/10 rounded-full flex items-center justify-center mb-10 border-4 border-red-600 shadow-[0_0_80px_rgba(220,38,38,0.3)]">
            <svg className="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-2 uppercase tracking-tighter">Violated rules of voting</h2>
          <p className="text-red-500 font-extrabold uppercase tracking-[0.4em] text-xs mb-8">Voting session terminated</p>
          
          <div className="max-w-xl space-y-6 mb-12">
            <p className="text-gray-500 leading-relaxed font-bold text-sm md:text-base uppercase tracking-wide">
                Hardware-level tamper detected. The voting environment was compromised by a window blur, tab switch, or unauthorized keyboard action.
            </p>
            <div className="py-2 px-6 bg-red-600/5 border border-red-600/20 rounded-full inline-block">
              <span className="text-red-600/60 font-black uppercase tracking-[0.2em] text-[10px]">Registry Violation Code: ST-08A-BLK</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
              <div className="py-3 px-6 bg-red-600/10 border border-red-600/20 rounded-2xl inline-block">
                  <span className="text-red-500 font-black uppercase tracking-widest text-xs">Violation Count: {violationCount}</span>
              </div>
              
              <button 
                onClick={() => window.location.reload()}
                className="px-12 py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-gray-200 transition-all shadow-2xl shadow-white/10 active:scale-95"
              >
                Re-Align Face to Unlock
              </button>
          </div>

          <div className="mt-12 flex items-center space-x-3 text-gray-500 font-black uppercase tracking-widest text-[10px]">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             <span>Strict Hardware-Level Security Active</span>
          </div>
        </div>
      )}
      {/* 🔐 Permission Consent Overlay */}
      {!isPermissionGranted && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
          <div className="max-w-xl w-full p-12 text-center space-y-8 animate-in zoom-in duration-500">
            <div className={`relative mx-auto w-64 h-48 rounded-3xl overflow-hidden border-2 shadow-2xl bg-black group transition-all duration-700 ${
              faceAligned ? 'border-green-500' : 'border-orange-500/50'
            }`}>
              {cameraReady ? (
                <>
                  <video
                    ref={setupVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover animate-in fade-in duration-1000"
                  />
                  {/* Grid Overlay (Step 3) */}
                  <div className="absolute inset-0 pointer-events-none z-40">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
                      {Array(9).fill(0).map((_, i) => (
                        <div key={i} className="border border-white/20" />
                      ))}
                    </div>
                  </div>
                  {/* Face Box Canvas (Step 4) */}
                  <canvas ref={canvasRef} className="absolute inset-0 z-50 pointer-events-none" />

                  <div className="absolute inset-0 pointer-events-none border-2 border-primary/10 rounded-3xl" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-3 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 pointer-events-none z-[60]">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${faceAligned ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-[8px] font-black uppercase text-white/90 tracking-widest">Live Preview</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${faceAligned ? 'text-green-500' : 'text-primary'}`}>
                      {faceAligned ? "ALIGNED ✅" : warning || "ALIGNING..."}
                    </span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 animate-pulse">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">Identity Verification</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Position yourself before entering</p>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-md mx-auto">
              <button
                onClick={() => !cameraReady && handleEnableCamera()}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-4 group ${
                  cameraReady 
                  ? 'bg-green-500 border-green-600 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  cameraReady ? 'bg-white text-green-500' : 'bg-white/5 text-gray-500 group-hover:text-primary'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">Camera</div>
                  <div className="text-xs font-bold">{cameraReady ? 'Ready' : 'Grant Access'}</div>
                </div>
              </button>

              <button
                onClick={() => !micReady && handleEnableMic()}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-4 group ${
                  micReady 
                  ? 'bg-green-500 border-green-600 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  micReady ? 'bg-white text-green-500' : 'bg-white/5 text-gray-500 group-hover:text-primary'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">Microphone</div>
                  <div className="text-xs font-bold">{micReady ? 'Ready' : 'Grant Access'}</div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-left space-y-4">
                <div className="flex items-center space-x-3 text-green-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Privacy Guarantee</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Your hardware is only active during the session for security verification. No data is stored permanently.</p>
              </div>

              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 text-left space-y-3">
                <div className="flex items-center space-x-3 text-primary">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Election Protocol</span>
                </div>
                <ul className="text-[10px] text-gray-400 space-y-1.5 font-bold uppercase tracking-tight">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> No 2 persons in frame</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Strict: No weapons</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Clear backgroud (Rec.)</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Vote alone only</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleGrantPermission}
              disabled={isInitializing || !cameraReady || !micReady || !faceAligned || multipleFaces}
              className="w-full max-w-sm py-5 bg-primary hover:bg-accent text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-primary/40 active:scale-[0.98] disabled:opacity-50"
            >
              {isInitializing ? 'Preparing Secure Ballot...' : (cameraReady && micReady && faceAligned && !multipleFaces ? 'Go to Ballot' : (warning || 'Allow Hardware & Align Face'))}
            </button>
            {warning && (
              <div className="text-red-500 mt-2 text-xs font-black uppercase tracking-widest animate-pulse">
                {warning}
              </div>
            )}
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Please click "Allow" in your browser popup after clicking the icons above.</p>
          </div>
        </div>
      )}

      {/* Live Proctoring Preview & Violations (Step 4, 5, 6) */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col items-end space-y-3">
        <div className={`relative w-48 h-36 rounded-2xl shadow-2xl border-2 transition-all duration-500 overflow-hidden bg-black group ${
          warning ? 'border-red-500 shadow-red-500/20' : 'border-primary/50'
        }`}>
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          
          {/* Visual Alert Overlay (Step 6) */}
          {warning && (
            <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none z-10" />
          )}

          <div className="absolute inset-0 border-2 border-green-500/20 rounded-2xl pointer-events-none z-0">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="border border-green-500/10 opacity-40 transition-opacity" />
              ))}
            </div>
          </div>

          <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20">
            <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${warning ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="text-[8px] font-black uppercase text-white/90 tracking-widest">
                AI Proctoring
              </span>
            </div>
            
            {/* Violation Display (Step 5) */}
            <div className={`px-2 py-1 rounded-full border backdrop-blur-md transition-all ${
              violations > 0 ? 'bg-red-600 border-red-400 text-white' : 'bg-white/10 border-white/20 text-white/60'
            }`}>
              <span className="text-[8px] font-black uppercase tracking-widest">
                {violations}/5 Violations
              </span>
            </div>
          </div>

          {/* Warning Message UI (Step 4) */}
          {warning && (
            <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md text-center animate-bounce z-30">
              {warning}
            </div>
          )}
        </div>

        {activeViolation && (
          <div className="w-48 p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/20 animate-in slide-in-from-right duration-300">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-red-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Security Warning</p>
                <p className="text-[9px] text-gray-300 font-medium leading-[1.3]">{activeViolation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLocked && <div className="fixed inset-0 z-50 pointer-events-none" />}

      <div className="max-w-6xl mx-auto w-full px-4">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-2 orange-text-gradient uppercase tracking-tight">Digital Voting Booth</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] mb-6 italic opacity-70">General Assembly 2024 • South Delhi • Station 08A</p>
          
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">{election?.title || 'Active Election'}</h2>
          <p className="text-gray-400 font-medium text-xs md:text-sm mt-1 uppercase tracking-widest">
            {getElectionYear()} • {election?.constituency || 'General'}
          </p>
        </header>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-16 relative">
          {/* 🗳️ Indian EVM Ballot Unit */}
          <div className="flex-shrink-0 relative z-10 w-full lg:w-auto flex flex-col items-center">
            <div className="bg-[#D1D5DB] p-4 rounded-xl shadow-2xl w-full max-w-lg border-4 border-[#9CA3AF] relative">
          {/* Top Panel */}
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-6 bg-[#1D4ED8] rounded-sm shadow-inner" />
              <span className="text-[10px] font-black text-gray-700 uppercase">Ballot Unit</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${selectedCandidate ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
              <span className="text-[8px] font-bold text-gray-600 mt-1 uppercase">Ready</span>
            </div>
          </div>

          {/* Candidate List Container */}
          <div className="bg-white rounded-sm border-2 border-gray-400 overflow-hidden shadow-inner">
            {candidates.map((candidate: any, index: number) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between border-b border-gray-300 transition-colors hover:bg-gray-50"
              >
                {/* LEFT SIDE: Metadata & Label */}
                <div className="flex items-center flex-1 h-20 px-4 border-r border-gray-400">
                  <div className="text-black font-black text-lg w-10 border-r border-gray-200 h-full flex items-center">
                    {index + 1}
                  </div>
                  <div className="w-16 h-16 flex items-center justify-center border-r border-gray-200 p-2">
                    <img
                      src={(candidate as any).symbol || (candidate as any).logo || '/globe.svg'}
                      alt="symbol"
                      className="w-full h-full object-contain grayscale"
                    />
                  </div>
                  <div className="flex-1 pl-4">
                    <div className="text-black font-black text-lg leading-tight uppercase tracking-tighter">
                      {candidate.name}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {candidate.party}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: LED & Hardware Button */}
                <div className="flex items-center space-x-6 px-6 h-20 bg-gray-100">
                  {/* LED */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-300
                      ${selectedCandidate === candidate.id
                        ? "bg-green-500 border-green-400 shadow-[0_0_12px_#22c55e]"
                        : "bg-red-500 border-red-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"}
                      ${selectedCandidate === candidate.id && blinking ? "animate-pulse" : ""}
                    `}
                  />

                  {/* BLUE OVAL BUTTON */}
                  <button
                    onClick={() => handleVote(candidate.id)}
                    className={`w-14 h-8 bg-[#1D4ED8] rounded-full shadow-[0_4px_0_#1e3a8a] active:shadow-none active:translate-y-1 transition-all border border-blue-800 ${
                      selectedCandidate === candidate.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Panel */}
          <div className="mt-4 pt-4 border-t border-gray-400 flex justify-between items-center text-gray-600">
            <span className="text-[9px] font-black uppercase">SL NO: 2024-SD-08A</span>
            <div className="w-16 h-4 bg-gray-400 rounded-sm opacity-50" />
          </div>
        </div>

        <div className="pt-8 space-y-6 relative z-10">
          <div className="flex flex-col items-center">
            <button
              onClick={() => selectedCandidate && handleVoteSubmission(selectedCandidate)}
              disabled={!selectedCandidate || isSubmitting}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden border-b-8 active:border-b-0 active:translate-y-2 ${
                selectedCandidate 
                  ? "bg-green-600 hover:bg-green-500 border-green-800 text-white shadow-xl shadow-green-900/40" 
                  : "bg-gray-800 border-gray-900 text-gray-600 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center space-x-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : 'Confirm Vote'}
            </button>
          </div>

          <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] leading-relaxed">
              Hardware ID: EVM-EL-2024-SD08 <br/>
              Secure Tamper-Proof Digital Ledger Active
            </p>
          </div>

          <button
            onClick={handleQuit}
            className="w-full py-3 text-gray-600 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Emergency Quit
          </button>
          <div className="pt-4 border-t border-white/5 mt-4">
            <button
              onClick={() => {
                resetSession();
                setViolations(0);
                setActiveViolation(null);
                referenceDescriptor.current = null;
                alert("Developer: Session Reset Successful! Identity reference cleared. You can now vote again.");
              }}
              className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500/70 border border-yellow-500/30 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all"
            >
              Developer: Reset Session & Retry
            </button>
          </div>
          <p className="text-[10px] text-gray-500 text-center font-black uppercase tracking-widest mt-4">By casting your vote, you agree to our blockchain-verified anonymous AI-proctored voting protocol.</p>
        </div>
      </div>

      {/* 🔌 The Connecting Wire (Industrial Cable) */}
      <div className="hidden lg:block absolute left-1/2 top-1/2 w-48 h-8 bg-gray-700 -translate-x-1/2 -translate-y-1/2 z-0 rounded-full border-y-[3px] border-gray-500 shadow-2xl">
        <div className="w-full h-full flex items-center justify-between px-4 opacity-40">
          <div className="w-1.5 h-4 bg-black rounded-full" />
          <div className="w-1.5 h-4 bg-black rounded-full" />
          <div className="w-1.5 h-4 bg-black rounded-full" />
          <div className="w-1.5 h-4 bg-black rounded-full" />
        </div>
      </div>

      {/* 🧾 Integrated VVPAT Component */}
      <div className="flex-shrink-0 relative z-10 w-full lg:w-auto flex flex-col items-center">
        <style>{`
          @keyframes printSlip {
            0% { transform: translateY(-100%); opacity: 0; }
            20% { opacity: 1; }
            80% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-printSlip {
            animation: printSlip 4s ease-out forwards;
          }
        `}</style>
        
        <div className="bg-[#D1D5DB] w-80 h-[540px] rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.4),inset_0_2px_10px_rgba(255,255,255,0.5)] p-6 flex flex-col items-center border-t-[12px] border-gray-100 border-x-[6px] border-gray-400 border-b-[16px] border-gray-500 relative overflow-hidden">
          {/* Industrial Rivets */}
          <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-gray-500 shadow-inner overflow-hidden">
            <div className="w-full h-px bg-black/20 mt-0.5 rotate-45" />
          </div>
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-500 shadow-inner overflow-hidden">
            <div className="w-full h-px bg-black/20 mt-0.5 -rotate-45" />
          </div>
          <div className="absolute bottom-10 left-4 w-2 h-2 rounded-full bg-gray-600 shadow-inner overflow-hidden">
            <div className="w-full h-px bg-black/20 mt-0.5 rotate-45" />
          </div>
          <div className="absolute bottom-10 right-4 w-2 h-2 rounded-full bg-gray-600 shadow-inner overflow-hidden">
            <div className="w-full h-px bg-black/20 mt-0.5 -rotate-45" />
          </div>

          {/* Side Texture/Grip */}
          <div className="absolute left-1 top-24 bottom-24 w-1 flex flex-col justify-between py-4 opacity-20">
            {Array(15).fill(0).map((_, i) => <div key={i} className="w-full h-px bg-black" />)}
          </div>
          <div className="absolute right-1 top-24 bottom-24 w-1 flex flex-col justify-between py-4 opacity-20">
            {Array(15).fill(0).map((_, i) => <div key={i} className="w-full h-px bg-black" />)}
          </div>

          {/* Machine Header */}
          <div className="bg-[#1D4ED8] w-full h-22 rounded-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_8px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center border-b-8 border-blue-900 mb-6 relative group transform hover:scale-[1.01] transition-transform">
            <div className="w-32 h-2 bg-blue-950/40 rounded-full mb-2 shadow-inner" />
            <div className="text-[10px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md text-center">Election Commission of India</div>
            <div className="text-[8px] font-bold text-blue-200/60 uppercase tracking-widest mt-1">Voter Verifiable Paper Audit Trail</div>
          </div>

          {/* Paper View Window with Rugged Frame */}
          <div className="relative bg-[#111827] w-68 h-52 rounded-xl border-[8px] border-[#4B5563] shadow-[0_10px_25px_rgba(0,0,0,0.4),inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center group-hover:border-gray-500 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 left-0 w-full h-2 bg-black/40 z-20" /> {/* "The Slot" shadow */}
            
            <div className="relative w-56 h-40 overflow-hidden bg-[#F3F4F6] rounded shadow-inner flex items-center justify-center border-2 border-black/10">
              {/* The "Paper Slip" - ONLY SHOW WHEN PRINTING */}
              {showVVPAT ? (
                <div className="absolute top-0 w-full bg-white p-6 shadow-2xl border-x border-gray-100 animate-printSlip z-0">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 p-2 border-2 border-gray-100 rounded-full bg-gray-50 shadow-sm">
                      <img 
                        src={(candidates.find((c: any) => c.id === selectedCandidate) as any)?.symbol || '/globe.svg'} 
                        className="w-full h-full object-contain grayscale opacity-80" 
                        alt="symbol"
                      />
                    </div>

                    <div className="text-center">
                      <div className="text-black font-black text-sm uppercase tracking-tighter">
                        {candidates.find((c: any) => c.id === selectedCandidate)?.name}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {candidates.find((c: any) => c.id === selectedCandidate)?.party}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-dashed border-gray-300 w-full text-center">
                      <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1 text-center">Blockchain Receipt</div>
                      <div className="text-[9px] font-mono text-gray-400 break-all leading-none bg-gray-50 p-2 rounded border border-gray-100 shadow-inner">
                        {voteHash}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center px-4">
                  Idle • Waiting for Vote
                </div>
              )}
            </div>
          </div>

          {/* Hardware Status Area */}
          <div className="mt-6 flex flex-col items-center space-y-4 w-full bg-gray-300/50 p-4 rounded-xl border border-white/20 shadow-inner">
            <div className="flex items-center space-x-8">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${showVVPAT ? 'bg-green-500 shadow-[0_0_20px_#22c55e] animate-pulse relative' : 'bg-gray-600 shadow-inner relative'}`}>
                  {showVVPAT && <div className="absolute inset-[-4px] rounded-full border border-green-500/30 animate-ping" />}
                </div>
                <span className="text-[8px] font-black text-gray-600 mt-2 uppercase tracking-tighter">Machine Busy</span>
              </div>
              <div className="flex flex-col items-center opacity-40">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-inner" />
                <span className="text-[8px] font-black text-gray-600 mt-2 uppercase tracking-tighter">Audit Wait</span>
              </div>
            </div>

            <div className="w-3/4 h-px bg-gray-400/50" />

            <div className="text-center">
              <div className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1 text-center">Veri-Paper Audit Entry</div>
              <p className="text-[8px] text-gray-600 leading-none uppercase font-bold max-w-[180px] mx-auto opacity-70 text-center">
                Do not clear or interfere. Paper slip valid for 7 seconds.
              </p>
            </div>
          </div>

          {/* Machine ID Tag */}
          <div className="absolute bottom-6 right-6 opacity-30 select-none">
            <div className="text-[8px] font-black text-gray-800 uppercase bg-gray-400/50 px-2 py-1 rounded border border-black/10">VVP-SRI-2024-SD-008</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
);
}

export default function VotingPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-black">
         <div className="text-center space-y-4">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
           <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Entering Secure Region...</p>
         </div>
       </div>
    }>
      <VotingContent />
    </Suspense>
  );
}
