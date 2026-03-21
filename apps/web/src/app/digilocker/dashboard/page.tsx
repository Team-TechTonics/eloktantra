"use client"

import { useDigiLockerStore, DigiDocument } from "@/lib/store/digilocker-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FileText, FileUp, ShieldCheck, Trash2, ExternalLink, Plus, Search, Filter, Shield, Clock, HardDrive, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DigiLockerDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, removeDocument } = useDigiLockerStore()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/digilocker/login")
    }
  }, [isAuthenticated, router])

  if (!user) return null

  const filteredDocs = user.documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Welcome Banner & Stats Card */}
      <div className="relative group overflow-hidden">
        <div className="absolute inset-0 bg-[#003366] rounded-[3rem] shadow-2xl skew-x-1 group-hover:skew-x-0 transition-transform duration-700" />
        <div className="absolute inset-0 bg-blue-900/50 rounded-[3rem] scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10" />
        <div className="relative p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-12 border border-white/10 rounded-[3rem] backdrop-blur-sm">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 ring-1 ring-white/20 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-inner">
               <ShieldCheck className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
               <span>Identity Verified</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">नमस्ते, {user.name}</h1>
              <p className="text-blue-100/70 font-bold text-lg max-w-sm">Access your government-verified digital documents anytime, anywhere.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
             <StatCard icon={HardDrive} label="Total Storage" value="1.2 GB" color="bg-emerald-500/20" textColor="text-emerald-300" />
             <StatCard icon={FileText} label="Documents" value={user.documents.length.toString()} color="bg-amber-500/20" textColor="text-amber-300" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="w-full md:max-w-md relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#003366] transition-colors" />
          <input 
            type="text" 
            placeholder="Search documents by name or type..."
            className="w-full pl-14 pr-6 py-4.5 bg-white border-2 border-transparent focus:border-[#003366] rounded-2xl shadow-sm focus:shadow-blue-900/10 outline-none font-bold text-sm transition-all text-gray-800 placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#003366] transition-all group shrink-0 shadow-sm active:scale-95">
            <Filter className="w-6 h-6 text-gray-500 group-hover:text-[#003366] transition-colors" />
          </button>
          <button 
            onClick={() => router.push("/digilocker/upload")}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-[#003366] text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:bg-[#002244] hover:-translate-y-0.5 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <Plus className="w-6 h-6" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredDocs.map((doc, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={doc.id}
              className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1.5 transition-all group overflow-hidden relative"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="p-4 rounded-2xl bg-blue-50/50 group-hover:bg-[#003366] transition-colors duration-500 shadow-inner group-hover:shadow-blue-900/20">
                  <FileText className="w-8 h-8 text-[#003366] group-hover:text-white transition-colors duration-500" />
                </div>
                <div className="flex gap-1">
                  <button className="p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-colors group-hover:shadow-sm">
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => removeDocument(doc.id)}
                    className="p-2.5 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors group-hover:shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-[#003366] transition-colors line-clamp-1">{doc.name}</h3>
                    {doc.verified && <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={2.5} />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1.5 bg-gray-100/50 rounded-xl text-[10px] uppercase font-black text-gray-500 tracking-widest border border-gray-200/30">{doc.type}</span>
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                   <button className="flex-1 py-3 px-4 bg-gray-50 hover:bg-[#003366]/5 rounded-xl text-xs font-black text-[#003366] uppercase tracking-[0.15em] border border-gray-100 transition-all flex items-center justify-center gap-2">
                     <ExternalLink className="w-4 h-4" />
                     View Document
                   </button>
                </div>
              </div>

              {/* Decorative background element */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#003366]/[0.015] rounded-full group-hover:scale-150 transition-transform duration-700 blur-2xl" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State Card */}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-20 bg-white/50 border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <FileUp className="w-10 h-10 text-gray-300" />
             </div>
             <div className="text-center space-y-2">
               <h3 className="text-2xl font-black text-gray-400 tracking-tight">No Documents Found</h3>
               <p className="text-gray-400 font-bold uppercase text-xs tracking-widest leading-relaxed">Try adjusting your search or upload a new record</p>
             </div>
             <button 
                onClick={() => router.push("/digilocker/upload")}
                className="px-8 py-3.5 bg-gray-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-900/10 hover:bg-gray-900 transition-all active:scale-95"
             >
               Explore Marketplace
             </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, textColor }: { icon: any; label: string; value: string; color: string; textColor: string }) {
  return (
    <div className={`p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center text-center gap-3 backdrop-blur-md shadow-lg`}>
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className={`w-6 h-6 ${textColor}`} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-sm font-black tracking-tight">{value}</p>
        <p className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em]">{label}</p>
      </div>
    </div>
  )
}
