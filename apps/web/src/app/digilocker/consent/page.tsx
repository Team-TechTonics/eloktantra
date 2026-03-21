"use client"

import { useDigiLockerStore } from "@/lib/store/digilocker-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ShieldCheck, Info, Check, X, Shield, Lock, ExternalLink, ArrowRight, Verified, Fingerprint, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DigiLockerConsentPage() {
  const router = useRouter()
  const { user, isAuthenticated, setVerified } = useDigiLockerStore()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/digilocker/login?from=vote")
    }
  }, [isAuthenticated, router])

  if (!user) return null

  const handleAllow = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setVerified(true)
      setIsProcessing(false)
      router.push("/digilocker/success")
    }, 2500)
  }

  const permissions = [
    { title: "Personal Details", desc: "Full name, DOB, and Gender for e-KYC validation.", icon: Verified },
    { title: "Aadhaar / Voter ID", desc: "Permanent unique identification numbers only.", icon: Fingerprint },
    { title: "One-way Access", desc: "We only read data once; no documents are permanently stored on eLoktantra.", icon: Lock }
  ]

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-[0_30px_70px_rgba(0,51,102,0.15)] overflow-hidden border border-gray-100/50 group">
        
        {/* Header Section */}
        <div className="bg-[#003366] p-10 text-white relative overflow-hidden group/header">
           <div className="absolute inset-0 bg-blue-400 opacity-5 group-hover/header:opacity-10 transition-opacity duration-700 blur-3xl -z-10" />
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 ring-1 ring-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md shadow-2xl group-hover/header:rotate-6 transition-transform">
                <ShieldCheck className="w-10 h-10 text-emerald-300" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                 <h2 className="text-3xl font-black tracking-tight tracking-[-0.01em] uppercase">eLoktantra</h2>
                 <p className="text-xs font-bold text-blue-200 uppercase tracking-[0.2em] opacity-80">Consent Protocol v2.4</p>
              </div>
           </div>
           
           <div className="mt-8 p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 group/box hover:bg-white/[0.08] transition-all">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0">
                  <span className="font-black text-blue-100 text-lg uppercase">{user.name[0]}</span>
              </div>
              <div>
                <p className="text-sm font-black text-white leading-tight uppercase tracking-widest">{user.name}</p>
                <p className="text-[10px] font-bold text-blue-300/60 uppercase tracking-widest">Signed in via +91 ****{user.mobileNumber.slice(-4)}</p>
              </div>
              <button onClick={() => router.push("/digilocker/login")} className="ml-auto p-2 hover:bg-white/10 rounded-lg text-white/50 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
           </div>
        </div>

        <div className="p-10 space-y-10 relative">
          <div className="space-y-3">
             <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">Authorize Identity Link</h3>
             <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed opacity-70">Linking your DigiLocker identity to proceed with secure voting.</p>
          </div>

          <div className="space-y-6">
             {permissions.map((perm, idx) => (
                <div key={idx} className="flex gap-5 group/item cursor-default">
                   <div className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center justify-center shrink-0 group-hover/item:border-[#003366] group-hover/item:shadow-lg transition-all">
                      <perm.icon className="w-6 h-6 text-[#003366]/40 group-hover/item:text-[#003366] transition-colors" strokeWidth={2.5} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none group-hover/item:translate-x-1 transition-transform">{perm.title}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-relaxed pr-6">{perm.desc}</p>
                   </div>
                </div>
             ))}
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50 flex items-center gap-4 group/alert hover:shadow-md transition-all">
             <div className="p-2.5 bg-amber-400 rounded-xl">
                <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
             </div>
             <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-relaxed">Identity used for "One Person, One Vote" policy enforcement only.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/vote?error=consent_denied")}
              className="px-8 py-5 bg-gray-50 text-gray-400 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 hover:text-rose-500 hover:border-rose-100 border-2 border-transparent transition-all active:scale-95"
            >
              Cancel Link
            </button>
            <button
              disabled={isProcessing}
              onClick={handleAllow}
              className="px-8 py-5 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale overflow-hidden relative group/allow-btn"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center">
                   <span className="relative z-10">Allow Access</span>
                   <ArrowRight className="w-5 h-5 relative z-10 group-hover/allow-btn:translate-x-1 transition-transform" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 group-hover:scale-x-110 transition-transform origin-left" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50/50 p-6 flex flex-col items-center justify-center gap-3 border-t border-gray-100">
           <img src="https://uidai.gov.in/images/logo/aadhaar_english_logo.png" alt="Aadhaar" className="h-4 brightness-0 opacity-20 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
           <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.5em]">Digitally Signed by eSign (CCA)</p>
        </div>
      </div>
    </div>
  )
}
