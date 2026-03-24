import Link from 'next/link';
import { 
  Users, Globe, AlertCircle, 
  ShieldCheck, BookOpen, Fingerprint, 
  Zap, BarChart3, ChevronRight 
} from 'lucide-react';

const stats = [
  { value: '1.4B+', label: 'Citizens', icon: '👥' },
  { value: '543', label: 'Constituencies', icon: '🗺️' },
  { value: '8,500+', label: 'Candidates', icon: '🏛️' },
  { value: '100%', label: 'Transparency', icon: '🔍' },
];

const features = [
  {
    title: 'Candidate Audit',
    description: 'De-anonymized background checks, judicial records, and verified asset disclosures for every listed candidate.',
    href: '/candidates',
    icon: <Users className="w-6 h-6" />,
    color: 'from-blue-500/10 to-blue-600/5',
    border: 'hover:border-blue-500/25',
    iconColor: 'text-blue-400 bg-blue-500/10',
  },
  {
    title: 'Polling Streams',
    description: 'Hierarchical tracking of election cycles. Follow state and national results in a secure, immutable ledger.',
    href: '/elections',
    icon: <Globe className="w-6 h-6" />,
    color: 'from-orange-500/10 to-orange-600/5',
    border: 'hover:border-orange-500/25',
    iconColor: 'text-orange-400 bg-orange-500/10',
  },
  {
    title: 'Civic Grievances',
    description: 'Scoped reporting of regional infrastructure and community issues directly linked to constituent representatives.',
    href: '/issues',
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'from-red-500/10 to-red-600/5',
    border: 'hover:border-red-500/25',
    iconColor: 'text-red-400 bg-red-500/10',
  },
  {
    title: 'Digital Manifestos',
    description: 'Immutably filed policy commitments and development roadmaps, accessible via candidate audit profiles.',
    href: '/candidates',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-emerald-500/10 to-emerald-600/5',
    border: 'hover:border-emerald-500/25',
    iconColor: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    title: 'Identity Ledger',
    description: 'Biometric liveness checks and DigiLocker consensus ensure every vote is cast by a verified human citizen.',
    href: '/dashboard',
    icon: <Fingerprint className="w-6 h-6" />,
    color: 'from-purple-500/10 to-purple-600/5',
    border: 'hover:border-purple-500/25',
    iconColor: 'text-purple-400 bg-purple-500/10',
  },
  {
    title: 'The Secure Ballot',
    description: 'AES-256 encrypted, blockchain-verified digital voting system designed for India\'s scale and diversity.',
    href: '/vote',
    icon: <ShieldCheck className="w-6 h-6" />,
    color: 'from-primary/10 to-primary/5',
    border: 'hover:border-primary/25',
    iconColor: 'text-primary bg-primary/10',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#020408] text-white overflow-x-hidden selection:bg-primary/30">

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -ml-64 -mb-64" />

        <div className="container mx-auto max-w-7xl relative z-10 text-center space-y-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-1000">
            <Zap className="w-4 h-4 text-primary mr-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Next-Gen Democratic Protocol</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] animate-in fade-in zoom-in-95 duration-1000">
            E-LOK<br /><span className="text-primary italic">TANTRA</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed border-l-2 border-primary/20 pl-8 text-left italic">
            "Empowering India&apos;s democracy through radical transparency, verifiable elections, and direct civic participation — powered by AI &amp; Blockchain."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Link href="/elections" className="group px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-primary hover:text-white transition-all shadow-2xl flex items-center">
                Initialize System <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/vote" className="px-10 py-5 bg-primary/10 text-primary border border-primary/20 font-black text-xs uppercase tracking-widest rounded-full hover:bg-primary/20 transition-all flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" /> Secure Ballot
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Board */}
      <div className="border-y border-white/5 bg-white/2 backdrop-blur-3xl py-16">
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {stats.map((s, i) => (
                    <div key={i} className="text-center group">
                        <div className="text-5xl font-black text-white mb-2 group-hover:text-primary transition-colors">{s.value}</div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Core Features */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-7xl">
            <div className="mb-20 text-center">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Infrastructure <span className="text-primary">Shield</span></h2>
                <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((f, i) => (
                    <Link key={i} href={f.href} className={`group p-10 bg-[#0d1117] border border-white/5 rounded-[3rem] transition-all duration-500 hover:border-primary/30 hover:bg-white/2 hover:-translate-y-2`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-10 ${f.iconColor} group-hover:scale-110 transition-transform`}>
                            {f.icon}
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">{f.title}</h3>
                        <p className="text-gray-400 font-medium leading-relaxed mb-8">{f.description}</p>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-white transition-colors">
                            Explore <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Final Action */}
      <section className="pb-40 px-6">
        <div className="container mx-auto max-w-4xl">
            <div className="bg-primary/5 border border-primary/20 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                <div className="relative z-10 space-y-8">
                    <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">Your <span className="text-primary">Vote</span>,<br /> Your Legacy.</h2>
                    <p className="text-gray-400 font-medium text-lg max-w-xl mx-auto">Digitally signed. Immutably recorded. Powerfully verified. Join the movement for a 100% transparent democracy.</p>
                    <div className="pt-8">
                        <Link href="/vote" className="inline-flex items-center px-12 py-6 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all shadow-[0_20px_50px_rgba(255,107,0,0.3)] active:scale-95 group-hover:scale-105">
                            Launch Secure Ballot Gateway
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#020408]">
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="text-center md:text-left space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">e-Lok<span className="text-primary">Tantra</span></h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Digital Democratic Infrastructure · India 2024</p>
                </div>
                <div className="flex flex-wrap justify-center gap-12">
                    {['Candidates', 'Elections', 'Issues', 'Dashboard'].map(l => (
                        <Link key={l} href={`/${l.toLowerCase()}`} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                            {l}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      </footer>

    </div>
  );
}
