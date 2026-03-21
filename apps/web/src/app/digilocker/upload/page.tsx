"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDigiLockerStore, DigiDocument } from "@/lib/store/digilocker-store"
import { Upload, FileText, CheckCircle2, ChevronLeft, Loader2, Sparkles, AlertCircle, FilePlus2, Eye, ShieldCheck, HardDrive, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DigiLockerUploadPage() {
  const router = useRouter()
  const { addDocument, user } = useDigiLockerStore()
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<string>("Aadhaar")
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append("aadhaar", file)
      
      const response = await fetch("http://localhost:5001/upload-aadhaar", {
        method: "POST",
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newDoc: DigiDocument = {
          id: data.userId || Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: docType as any,
          fileUrl: `http://localhost:5001/uploads/${data.file}`, // Simulation url
          uploadedAt: new Date().toISOString(),
          verified: true
        }
        addDocument(newDoc)
        setIsSuccess(true)
        setTimeout(() => router.push("/digilocker/dashboard"), 1500)
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      console.error("Upload error:", err)
      alert("Could not connect to authentication server")
    } finally {
      setIsUploading(false)
    }
  }

  const docTypes = [
    { id: "Aadhaar", icon: "🇮🇳", label: "Aadhaar card", desc: "Identity & Address Proof" },
    { id: "Voter ID", icon: "🗳️", label: "Voter ID Card", desc: "EPIC Number Required" },
    { id: "PAN", icon: "💳", label: "PAN Card", desc: "Income Tax Department" },
    { id: "Other", icon: "📄", label: "Other Records", desc: "Marksheets / Certificates" }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-white rounded-2xl font-black text-[#003366] text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 border-2 border-transparent hover:border-[#003366]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>
        <div className="text-center md:text-right">
           <h1 className="text-4xl font-black tracking-tight text-[#003366]">Quick Upload</h1>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Add documents to your secure vault</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-10 group">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] pl-2">Select Issuer</h3>
            <div className="grid grid-cols-2 gap-4">
              {docTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setDocType(type.id)}
                  className={`
                    p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group/item
                    ${docType === type.id 
                      ? "bg-[#003366] border-transparent shadow-2xl shadow-blue-900/20 text-white" 
                      : "bg-white border-gray-100/80 hover:border-gray-200 text-gray-500"}
                  `}
                >
                  <div className="text-3xl mb-3 group-hover/item:scale-125 transition-transform duration-500">{type.icon}</div>
                  <p className="font-extrabold text-lg tracking-tight mb-1 group-hover/item:translate-x-1 transition-transform">{type.label}</p>
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${docType === type.id ? "text-blue-200" : "text-gray-400"}`}>{type.desc}</p>
                  {docType === type.id && (
                    <div className="absolute top-4 right-4 animate-pulse">
                       <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className={`absolute bottom-0 right-0 w-24 h-24 rounded-full -mr-10 -mb-10 blur-3xl transition-opacity duration-700 ${docType === type.id ? "bg-blue-400/20 opacity-100" : "opacity-0"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] pl-2">Attach Data</h3>
            <label className={`
              flex flex-col items-center justify-center h-[300px] rounded-[3rem] border-4 border-dashed transition-all cursor-pointer group/upload relative overflow-hidden
              ${file ? "bg-emerald-50/30 border-emerald-500/50" : "bg-white border-gray-100 hover:bg-blue-50/30 hover:border-[#003366]/30"}
            `}>
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-10 space-y-6"
                  >
                    <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 group-hover/upload:scale-110 transition-transform">
                      <FilePlus2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-emerald-800 tracking-tight leading-tight">{file.name}</h4>
                      <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-[0.2em]">Ready for encryption ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-center p-10 space-y-6"
                  >
                    <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner group-hover/upload:-translate-y-2 transition-transform duration-500">
                      <Upload className="w-10 h-10 text-[#003366]/30" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xl font-black text-gray-800 tracking-tight leading-tight">Drop your file here</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto">Click to browse or drag PDF, JPG, or PNG images</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-50 group-hover/upload:bg-[#003366]/10 transition-colors" />
            </label>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-8 relative overflow-hidden">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Security Check</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] leading-relaxed">Please review information before storing in vault.</p>
              </div>

              <div className="space-y-4">
                 <div className="p-5 flex items-start gap-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <ShieldCheck className="w-6 h-6 text-[#003366] shrink-0" strokeWidth={2.5} />
                    <div>
                      <p className="font-black text-gray-800 text-sm leading-tight">Automatic Verification</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest leading-none">Powered by NPCI Secure Bridge</p>
                    </div>
                 </div>
                 <div className="p-5 flex items-start gap-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <HardDrive className="w-6 h-6 text-blue-500 shrink-0" strokeWidth={2.5} />
                    <div>
                      <p className="font-black text-gray-800 text-sm leading-tight">Clustered Storage</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest leading-none">Replicated across 3 regions</p>
                    </div>
                 </div>
              </div>

              <AnimatePresence>
                {isSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-emerald-500 rounded-3xl text-white text-center space-y-4 shadow-xl shadow-emerald-500/30"
                  >
                    <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce" strokeWidth={3} />
                    <p className="font-extrabold text-lg uppercase tracking-widest">Saved Successfully!</p>
                  </motion.div>
                ) : (
                  <button
                    onClick={handleUpload}
                    disabled={!file || !docType || isUploading}
                    className="w-full flex items-center justify-center gap-3 px-10 py-5 bg-[#003366] text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-[#002244] hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none group"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-4">
                        <Loader2 className="w-7 h-7 animate-spin" strokeWidth={3} />
                        <span className="uppercase tracking-[0.2em] font-black text-sm">Encrypting...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 group-hover:scale-125 transition-transform" />
                        <span className="uppercase tracking-[0.1em]">Complete Upload</span>
                      </>
                    )}
                  </button>
                )}
              </AnimatePresence>

              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl -z-10" />
           </div>

           <div className="p-8 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex items-center gap-4 group hover:border-[#003366]/40 transition-colors">
              <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                 <Shield className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Your data is signed by Digital Signature of Ministry officials upon upload.</p>
           </div>
        </div>
      </div>
    </div>
  )
}
