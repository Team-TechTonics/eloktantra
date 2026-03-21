"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles, PartyPopper, UserCheck, CheckCircle, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useDigiLockerStore } from "@/lib/store/digilocker-store"

export default function DigiLockerSuccessPage() {
  const router = useRouter()
  const { user, isVerified } = useDigiLockerStore()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // If user somehow lands here without verification, send back
    if (!isVerified) {
      const timeout = setTimeout(() => {
        router.push("/digilocker/dashboard");
      }, 100);
      return () => clearTimeout(timeout);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Simulation: Sending verified status back to voting page
          // Using a small delay to ensure no render cycle conflicts
          setTimeout(() => {
             router.push("/vote?verified=true&userId=" + user?.id)
          }, 0);
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVerified, router, user])

  if (!user) return null

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full text-center space-y-10 group"
      >
        <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40">
           <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping scale-150 blur-3xl opacity-30 group-hover:bg-blue-500/20 transition-colors" />
           <div className="absolute inset-x-0 bottom-0 h-10 w-full bg-white/50 blur-3xl rounded-full" />
           <div className="relative w-full h-full bg-emerald-500 p-8 rounded-[3rem] shadow-2xl shadow-emerald-900/40 flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-1000">
             <CheckCircle2 className="w-full h-full text-white" strokeWidth={3} />
           </div>
           {/* Floating elements */}
           <motion.div 
             animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-4 -right-4 p-3 bg-white shadow-xl rounded-2xl border border-emerald-50"
           >
              <UserCheck className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
           </motion.div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
             <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">Verification Success!</h2>
             <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] leading-relaxed">Identity linked to eLoktantra Protocol</p>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest px-8 leading-relaxed">You have been successfully authenticated with DigiLocker. You are now authorized to cast your encrypted vote.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-emerald-100 shadow-xl shadow-emerald-900/5 space-y-6">
           <div className="flex items-center justify-between px-2">
              <div className="text-left space-y-0.5">
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Tracking ID</p>
                 <p className="text-sm font-black text-gray-900 uppercase">TX-ELOK-829K1-Z</p>
              </div>
              <div className="h-10 w-px bg-emerald-100/50" />
              <div className="text-right space-y-0.5">
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Status</p>
                 <p className="text-sm font-black text-emerald-600 uppercase flex items-center justify-end gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                 </p>
              </div>
           </div>

           <div className="h-px w-full bg-emerald-50" />

           <div className="space-y-4">
              <button
                onClick={() => router.push("/vote?verified=true&userId=" + user.id)}
                className="w-full flex items-center justify-center gap-3 px-8 py-4.5 bg-[#003366] text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-[#002244] hover:-translate-y-1 active:scale-[0.98] transition-all group/btn outline-none ring-offset-4 focus:ring-4 focus:ring-blue-100"
              >
                <span className="uppercase tracking-[0.1em]">Identity Linked</span>
                <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1.5 transition-transform" />
              </button>
              <p className="text-[10px] font-black text-[#003366]/40 uppercase tracking-[0.3em] transition-opacity">Redirecting in {countdown}s...</p>
           </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-300 uppercase tracking-[0.2em] pt-6">
           <Shield className="w-4 h-4" />
           <span>Secure Verification Portal</span>
        </div>
      </motion.div>
    </div>
  )
}
