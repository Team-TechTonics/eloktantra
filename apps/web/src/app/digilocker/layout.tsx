"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck, LogOut, LayoutDashboard, FileUp, Shield } from "lucide-react"
import { useDigiLockerStore } from "@/lib/store/digilocker-store"
import { motion } from "framer-motion"

export default function DigiLockerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useDigiLockerStore()

  // Simplified navbar without logout for login page
  const isLoginPage = pathname === "/digilocker/login"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-blue-100">
      {/* Government Header */}
      <header className="bg-[#003366] text-white shadow-md z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/digilocker" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-white p-1.5 rounded-full shadow-inner shadow-blue-900/10">
              <ShieldCheck className="w-6 h-6 text-[#003366]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight leading-none uppercase">DigiLocker</span>
              <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-blue-200">Government of India</span>
            </div>
          </Link>

          {!isLoginPage && isAuthenticated && (
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-1">
                <NavLink href="/digilocker/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === "/digilocker/dashboard"} />
                <NavLink href="/digilocker/upload" icon={FileUp} label="Upload" active={pathname === "/digilocker/upload"} />
              </nav>
              <div className="h-6 w-px bg-white/20 hidden md:block" />
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-xs font-semibold text-white/90">Welcome back,</span>
                  <span className="text-sm font-bold text-white leading-tight">{user?.name}</span>
                </div>
                <button 
                  onClick={() => {
                    logout()
                    window.location.href = "/digilocker/login"
                  }}
                  className="p-2.5 rounded-xl hover:bg-white/10 text-white transition-all active:scale-95 group relative"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  <span className="sr-only">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area with Background Pattern */}
      <main className="flex-1 relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-fixed opacity-100">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-gray-50/50 pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Securely encrypted by 256-bit AES</span>
          </div>
          <p>© 2026 Ministry of Electronics & IT, Government of India</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#003366] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#003366] transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`
        px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 font-bold text-sm
        ${active 
          ? "bg-white/10 text-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] ring-1 ring-white/20" 
          : "text-white/70 hover:text-white hover:bg-white/5"}
      `}
    >
      <Icon className={`w-4 h-4 ${active ? "animate-pulse" : ""}`} />
      <span>{label}</span>
    </Link>
  )
}
