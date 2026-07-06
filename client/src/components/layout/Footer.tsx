import { Facebook, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  theme: 'dark' | 'light';
}

export const Footer = ({ theme }: FooterProps) => {
  return (
    <footer className="relative w-full overflow-hidden flex flex-col items-center mt-10">
      {/* Top Section (above the horizon) */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-24 pb-48 relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-sm">
          <p className={`text-sm leading-relaxed mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Build zero-latency, voice-controlled architectural canvases. Translate speech into spatial node-graphs via a continuous WebSocket stream.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-800 hover:bg-slate-200'}`}>
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-800 hover:bg-slate-200'}`}>
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-800 hover:bg-slate-200'}`}>
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className={`flex gap-8 text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
          <a href="#" className="hover:text-fuchsia-500 transition-colors">Features</a>
          <a href="#" className="hover:text-fuchsia-500 transition-colors">How to Use</a>
          <a href="#" className="hover:text-fuchsia-500 transition-colors">Why?</a>
          <a href="#" className="hover:text-fuchsia-500 transition-colors">Faqs</a>
        </div>
      </div>

      {/* Horizon Background */}
      <div className="absolute top-[320px] sm:top-[220px] left-1/2 -translate-x-1/2 w-[250%] sm:w-[150%] h-[1200px] sm:h-[800px] rounded-[100%] flex justify-center z-0 pointer-events-none">
        {/* The main solid planet area */}
        <div className={`absolute inset-0 rounded-[100%] ${theme === 'dark' ? 'bg-black' : 'bg-slate-100'}`} />
        
        {/* The outer glowing halo */}
        <div className={`absolute -top-[2px] left-[25%] right-[25%] h-[10px] rounded-[100%] blur-[4px] ${theme === 'dark' ? 'bg-white/40' : 'bg-white/80'}`} />
        <div className={`absolute -top-[5px] left-[10%] right-[10%] h-[30px] rounded-[100%] blur-[15px] ${theme === 'dark' ? 'bg-indigo-400/40' : 'bg-indigo-400/30'}`} />
        <div className={`absolute -top-[15px] left-[15%] right-[15%] h-[60px] rounded-[100%] blur-[40px] ${theme === 'dark' ? 'bg-fuchsia-500/30' : 'bg-fuchsia-500/20'}`} />
        <div className={`absolute -top-[30px] left-[20%] right-[20%] h-[120px] rounded-[100%] blur-[80px] ${theme === 'dark' ? 'bg-white/10' : 'bg-white/50'}`} />
      </div>

      {/* Bottom Section (inside the planet) */}
      <div className="w-full relative z-10 pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col sm:flex-row justify-between items-center pt-8 border-t text-xs ${theme === 'dark' ? 'border-white/10 text-slate-500' : 'border-slate-300 text-slate-500'}`}>
            <p>© 2026 VORLAGE. All rights reserved.</p>
            <div className="flex gap-8 mt-4 sm:mt-0">
              <a href="#" className="hover:text-fuchsia-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-fuchsia-500 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
