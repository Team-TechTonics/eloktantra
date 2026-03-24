'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, Key, Fingerprint, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';

// OAUTH GATEWAY UI: The 1-Day Winning Demo Bridge 🕵️‍♂️🛡️✨
// High-Fidelity Clone of the DigiLocker Official Login Portal
export default function OAuthAuthorizePortal() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const clientId = searchParams?.get('client_id') || 'ELOKTANTRA-2024';
  const redirectUri = searchParams?.get('redirect_uri') || '/digilocker/success';
  const state = searchParams?.get('state');

  // SIMULATE AUTH JOURNEY 🚀
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return setError('Please enter mobile or Aadhaar');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setStep(2);
    setLoading(false);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 6) return setError('PIN must be 6 digits');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setStep(3); // Moving to the Aadhaar OTP Step
    setLoading(false);
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const completeAuth = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    
    // Generate an Auth Code and redirect back
    const authCode = `CODE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const target = `${redirectUri}?code=${authCode}&state=${state}&verified=true`;
    router.push(target);
  };

  useEffect(() => {
    if (otp.every(v => v !== '')) {
      completeAuth();
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col font-sans text-[#2D3748]">
      {/* Official Gov.in Header Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
           <div className="w-12 h-12 bg-[#2E4790] rounded-lg flex items-center justify-center p-2">
              <img src="https://www.digilocker.gov.in/assets/img/logo.png" alt="DigiLocker Logo" className="w-full h-auto brightness-0 invert" />
           </div>
           <div>
             <h1 className="text-xl font-bold text-[#2E4790] leading-none mb-1">DigiLocker</h1>
             <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Authorized Login Portal</p>
           </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase">
           <Shield className="w-4 h-4 text-green-600" />
           <span>256-Bit SSL SECURE ENTRY</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
           <div className="absolute top-10 left-10 w-64 h-64 bg-[#2E4790] rounded-full blur-3xl"></div>
           <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#EF4444] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-white overflow-hidden relative z-10 transition-all duration-700 transform">
           
           {/* Progress Indicator */}
           <div className="h-1.5 w-full bg-gray-100 flex">
              <div className={`h-full bg-[#2E4790] transition-all duration-700`} style={{ width: `${(step / 3) * 100}%` }}></div>
           </div>

           <div className="p-10 md:p-12">
              <AnimatePresence mode="wait">
                 {/* STEP 1: Identification */}
                 {step === 1 && (
                   <motion.div 
                     key="id"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                     <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                           <Smartphone className="w-8 h-8 text-[#2E4790]" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Access DigiLocker</h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Verify your identity to authorize <span className="text-[#2E4790] font-bold">{clientId}</span></p>
                     </div>

                     <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative group">
                           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-hover:text-[#2E4790]">
                              <Fingerprint className="w-5 h-5 text-gray-400 group-focus-within:text-[#2E4790]" />
                           </div>
                           <input 
                             type="text" 
                             placeholder="Aadhaar / Mobile Number"
                             value={username}
                             onChange={(e) => setUsername(e.target.value)}
                             className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all outline-none font-medium text-lg"
                           />
                        </div>
                        <button 
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 bg-[#2E4790] hover:bg-[#253974] text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center space-x-2 group h-16"
                        >
                          {loading ? (
                             <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                             <>
                                <span>SIGN IN</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                             </>
                          )}
                        </button>
                     </form>
                     <div className="text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">or sign in with</p>
                        <div className="flex justify-center mt-4 space-x-4">
                           <div className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer border border-gray-100">
                              <Shield className="w-5 h-5 text-[#2E4790]" />
                           </div>
                           <div className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer border border-gray-100">
                              <Smartphone className="w-5 h-5 text-[#2E4790]" />
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 )}

                 {/* STEP 2: Security PIN */}
                 {step === 2 && (
                   <motion.div 
                     key="pin"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                     <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                           <Key className="w-8 h-8 text-[#2E4790]" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Security PIN</h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Verify your 6-digit Security PIN</p>
                     </div>

                     <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div className="relative group">
                           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="w-5 h-5 text-gray-400" />
                           </div>
                           <input 
                             type="password" 
                             maxLength={6}
                             placeholder="******"
                             value={pin}
                             onChange={(e) => setPin(e.target.value)}
                             className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all outline-none font-black text-2xl tracking-[0.5em]"
                           />
                        </div>
                        <button 
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 bg-[#2E4790] hover:bg-[#253974] text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center space-x-2 group h-16"
                        >
                          {loading ? (
                             <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                             <>
                                <span>VERIFY ACCOUNT</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                             </>
                          )}
                        </button>
                        <p onClick={() => setStep(1)} className="text-center text-sm font-bold text-[#2E4790] hover:underline cursor-pointer">Forgot Security PIN?</p>
                     </form>
                   </motion.div>
                 )}

                 {/* STEP 3: Aadhaar OTP */}
                 {step === 3 && (
                   <motion.div 
                     key="otp"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="space-y-6"
                   >
                     <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100">
                           <Shield className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">UIDAI Verification</h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium">A 6-digit OTP has been sent to the mobile number registered with your Aadhaar ( ending in <span className="text-gray-900 font-bold">4592</span> )</p>
                     </div>

                     <div className="flex justify-between gap-2 md:gap-3 py-6">
                        {otp.map((digit, i) => (
                           <input 
                             key={i}
                             id={`otp-${i}`}
                             type="text"
                             maxLength={1}
                             value={digit}
                             onChange={(e) => handleOtpInput(i, e.target.value)}
                             className="w-full aspect-square border-2 border-gray-100 bg-gray-50 rounded-xl text-center text-xl font-black focus:border-[#2E4790] focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all"
                           />
                        ))}
                     </div>

                     <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#2E4790]">
                        <span className="cursor-pointer hover:underline">Resend OTP</span>
                        <span className="text-gray-400">01:59s</span>
                     </div>

                     {loading && (
                        <div className="text-center pt-8">
                           <div className="flex items-center justify-center space-x-3 text-sm text-gray-500 font-bold uppercase tracking-tighter">
                              <div className="w-4 h-4 border-2 border-blue-200 border-t-[#2E4790] rounded-full animate-spin"></div>
                              <span>Establishing Secure Link...</span>
                           </div>
                        </div>
                     )}
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Legal Footer for Gate */}
           <div className="bg-gray-50 px-10 py-6 border-t border-gray-100 text-center">
              <p className="text-[9px] text-gray-400 uppercase font-black leading-tight">
                 This is a simulated Government of India identity bridge. All biometric data is processed 
                 under the mock Digital Identity Protection Act.
              </p>
           </div>
        </div>
      </main>

      <footer className="footer bg-[#1A1A1A] text-white/40 py-8 px-6 text-center text-[10px] uppercase font-bold tracking-[0.3em]">
         POWERED BY NATIONAL E-GOVERNANCE DIVISION (MOCK)
      </footer>
    </div>
  );
}
