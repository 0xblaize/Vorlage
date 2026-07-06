import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, Sparkles, ChevronRight, Sun, Moon } from 'lucide-react';

interface CmdKModalProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setToastVisible: (visible: boolean) => void;
}

export const CmdKModal = ({ theme, setTheme, isOpen, setIsOpen, setToastVisible }: CmdKModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`fixed top-[10%] sm:top-[15%] left-1/2 -translate-x-1/2 w-[95%] max-w-lg p-4 rounded-2xl shadow-2xl z-[101] border ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center border-b border-slate-500/20 pb-4 mb-4 gap-3">
              <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
              <input 
                type="text" 
                placeholder="Type a command or search..." 
                autoFocus
                className={`flex-1 bg-transparent border-none outline-none text-lg ${theme === 'dark' ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
              />
              <div className={`px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>ESC</div>
            </div>
            
            <div className="space-y-1">
              <div className={`text-xs font-semibold px-2 py-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>ACTIONS</div>
              
              <button 
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                onClick={() => {
                  setIsOpen(false);
                  setToastVisible(true);
                  setTimeout(() => setToastVisible(false), 3000);
                }}
              >
                <div className="flex items-center gap-3">
                  <Mic className="w-4 h-4 text-fuchsia-500" />
                  <span>Start Voice Recording</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className={`px-2 py-1 rounded text-xs font-sans ${theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>⌘</kbd>
                  <kbd className={`px-2 py-1 rounded text-xs font-sans ${theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Space</kbd>
                </div>
              </button>
              
              <button className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Generate Node-Graph</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className={`px-2 py-1 rounded text-xs font-sans ${theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>⌘</kbd>
                  <kbd className={`px-2 py-1 rounded text-xs font-sans ${theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>G</kbd>
                </div>
              </button>

              <div className={`text-xs font-semibold px-2 py-2 mt-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>NAVIGATION</div>

              <button className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}>
                <div className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span>Go to Features</span>
                </div>
                <kbd className={`px-2 py-1 rounded text-xs font-sans ${theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>G + F</kbd>
              </button>

              <button 
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                  <span>Toggle Theme</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className={`px-2 py-1 rounded text-xs font-sans ${theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>⌘</kbd>
                  <kbd className={`px-2 py-1 rounded text-xs font-sans ${theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>T</kbd>
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
