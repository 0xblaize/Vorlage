import { Mic, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  isIslandHovered: boolean;
  setIsIslandHovered: (hovered: boolean) => void;
}

export const Header = ({ theme, setTheme, isIslandHovered, setIsIslandHovered }: HeaderProps) => {
  return (
    <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-50">
      {/* Left: Brand - Tighter typography */}
      <div className="flex items-center gap-8">
        <div className={`text-2xl font-sans font-black tracking-tighter transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          VORLAGE.
        </div>
      </div>

      {/* Center: Clean Dynamic Island */}
      <div className="absolute left-1/2 -translate-x-1/2 top-20 md:top-1/2 md:-translate-y-1/2 flex justify-center z-[100]">
        <motion.div
          className={`backdrop-blur-xl overflow-hidden flex flex-col justify-center cursor-default shadow-glass-md transition-colors duration-500 relative ${theme === 'dark' ? 'bg-[#111318]/90 border border-white/10' : 'bg-white/90 border border-slate-200'}`}
          animate={{
            width: isIslandHovered ? 320 : 160,
            height: isIslandHovered ? 88 : 44,
            borderRadius: isIslandHovered ? 28 : 22,
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          onMouseEnter={() => setIsIslandHovered(true)}
          onMouseLeave={() => setIsIslandHovered(false)}
          onClick={() => setIsIslandHovered(!isIslandHovered)}
        >
          {/* Subtle top inner highlight */}
          <div className={`absolute inset-0 rounded-[inherit] pointer-events-none ${theme === 'dark' ? 'shadow-glass-inset' : 'shadow-glass-inset-light'}`} />

          <motion.div 
            className="absolute inset-0 flex items-center justify-center gap-2.5"
            animate={{ opacity: isIslandHovered ? 0 : 1, scale: isIslandHovered ? 0.9 : 1 }}
            transition={{ duration: 0.15 }}
            style={{ pointerEvents: isIslandHovered ? 'none' : 'auto' }}
          >
            <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
            <span className={`text-xs font-semibold transition-colors duration-700 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Listening</span>
          </motion.div>

          <motion.div 
            className="absolute inset-0 px-5 py-4 flex flex-col justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: isIslandHovered ? 1 : 0 }}
            transition={{ duration: 0.15, delay: isIslandHovered ? 0.1 : 0 }}
            style={{ pointerEvents: isIslandHovered ? 'auto' : 'none' }}
          >
             <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <Mic className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
                  </div>
                  <span className={`text-xs font-semibold tracking-wide transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>VORLAGE Active</span>
                </div>
                
                <div className="flex items-center gap-[3px] h-3">
                 {[...Array(4)].map((_, i) => (
                   <motion.div
                     key={i}
                     animate={{ height: isIslandHovered ? ['20%', `${Math.random() * 80 + 20}%`, '20%'] : '20%' }}
                     transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" }}
                     className={`w-[2.5px] rounded-full ${theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'}`}
                   />
                 ))}
               </div>
             </div>
             
             <div className="flex items-center justify-between mt-auto">
               <span className={`text-[10px] font-medium tracking-wide transition-colors duration-700 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Processing stream...</span>
               <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>00:04</span>
             </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-8">
        <button 
          data-magnetic="true"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <Link to="/login" data-magnetic="true" className={`hidden lg:block text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
          Sign In
        </Link>
        <Link to="/signup" data-magnetic="true" className={`text-sm font-semibold px-6 py-2.5 rounded-xl transition-all border shadow-lg hover:scale-105 ${theme === 'dark' ? 'bg-white text-slate-900 border-white hover:bg-slate-200' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'}`}>
          Early Access
        </Link>
      </div>
    </nav>
  );
};
