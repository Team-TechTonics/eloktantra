"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDigiLockerStore } from "@/lib/store/digilocker-store"
import { ShieldCheck, Phone, Smartphone, ChevronRight, Fingerprint, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DigiLockerLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useDigiLockerStore()
  
  const [step, setStep] = useState(1) // 1: Aadhaar/Mobile, 2: OTP
  const [inputValue, setInputValue] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fromVote = searchParams.get("from") === "vote"

  useEffect(() => {
    if (isAuthenticated) {
      if (fromVote) {
        router.push("/digilocker/consent")
      } else {
        router.push("/digilocker/dashboard")
      }
    }
  }, [isAuthenticated, fromVote, router])

  const handleNext = () => {
    if (inputValue.length < 10) {
      setError("Please enter a valid Aadhaar or Mobile Number")
      return
    }
    setError("")
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
    }, 1500)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerify = () => {
    if (otp.some(v => v === "")) {
      setError("Please enter the full 6-digit OTP")
      return
    }
    setError("")
    setIsLoading(true)
    setTimeout(() => {
      login(inputValue)
      setIsLoading(false)
      // Redirect handled by useEffect
    }, 2000)
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,51,102,0.12)] border border-gray-100/50 overflow-hidden group">
        
        {/* Progress Bar */}
        <div className="h-2 flex w-full">
          <motion.div 
            initial={{ width: "50%" }}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            className={`h-full ${step === 1 ? "bg-amber-400" : "bg-emerald-500"} transition-all duration-700`} 
          />
        </div>

        <div className="p-10 pt-12 space-y-10">
          <div className="text-center space-y-4">
            <div className="mx-auto bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-10 h-10 text-[#003366]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#003366] tracking-tight">Login to DigiLocker</h2>
              <p className="mt-2 text-sm text-gray-500 font-semibold tracking-wide uppercase">Identity Verification Service</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#003366] transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Aadhaar / Mobile Number"
                      className="block w-full pl-12 pr-4 py-4.5 bg-gray-50/50 border-2 border-transparent focus:border-[#003366] focus:bg-white rounded-2xl leading-5 transition-all outline-none font-bold text-lg placeholder:text-gray-400/80 shadow-sm focus:shadow-blue-900/10"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-rose-500 text-sm font-bold bg-rose-50 p-3 rounded-xl border border-rose-100"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider text-center leading-relaxed">
                    By continuing, you agree to allow DigiLocker to send a verification code to your registered mobile number.
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4.5 bg-[#003366] text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-[#002244] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none group/btn overflow-hidden relative"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10">Continue</span>
                      <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Verify OTP</p>
                  <p className="text-sm text-gray-400 font-semibold italic">Sent to ending with ****{inputValue.slice(-4)}</p>
                </div>

                <div className="flex justify-between gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      className="w-12 h-16 bg-gray-50 border-2 border-transparent focus:border-[#003366] focus:bg-white rounded-xl text-center font-black text-2xl shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-100"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                    />
                  ))}
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-rose-500 text-sm font-bold bg-rose-50 p-3 rounded-xl border border-rose-100"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={handleVerify}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4.5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Fingerprint className="w-6 h-6" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-2 text-xs font-black text-[#003366]/60 hover:text-[#003366] uppercase tracking-[0.2em] transition-colors"
                  >
                    Resend Code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-gray-50 p-6 flex items-center justify-center gap-6 border-t border-gray-100">
           <img src="https://www.digilocker.gov.in/assets/img/play-store.png" alt="Play Store" className="h-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
           <img src="https://www.digilocker.gov.in/assets/img/app-store.png" alt="App Store" className="h-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
        </div>
      </div>
    </div>
  )
}
