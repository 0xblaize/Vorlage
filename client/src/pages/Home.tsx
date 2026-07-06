import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { LiveMockup } from '../components/sections/LiveMockup';
import { Features } from '../components/sections/Features';
import { UseCases } from '../components/sections/UseCases';
import { Performance } from '../components/sections/Performance';
import { Testimonials } from '../components/sections/Testimonials';
import { FAQ } from '../components/sections/FAQ';
import { NodeGraphBackground } from '../components/ui/NodeGraphBackground';
import { CmdKModal } from '../components/ui/CmdKModal';
import { CustomCursor } from '../components/ui/CustomCursor';

export default function Home() {
  const [isIslandHovered, setIsIslandHovered] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toastVisible, setToastVisible] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

  useEffect(() => {
    const originalTitle = document.title;
    if (originalTitle.includes(" | Google AI Studio")) {
      document.title = originalTitle.replace(" | Google AI Studio", "");
    }
    const observer = new MutationObserver(() => {
      const currentTitle = document.title;
      if (currentTitle.includes(" | Google AI Studio")) {
        document.title = currentTitle.replace(" | Google AI Studio", "");
      }
    });
    const titleNode = document.querySelector('title');
    if (titleNode) {
      observer.observe(titleNode, { childList: true });
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdKOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen font-sans selection:bg-fuchsia-500/30 overflow-x-hidden relative transition-colors duration-700 ${theme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <NodeGraphBackground theme={theme} />
      
      <CustomCursor theme={theme} />

      {/* Ambient noise texture overlay */}
      <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none transition-opacity duration-700 ${theme === 'dark' ? 'opacity-[0.04]' : 'opacity-[0.06]'}`} />

      <Header theme={theme} setTheme={setTheme} isIslandHovered={isIslandHovered} setIsIslandHovered={setIsIslandHovered} />
      
      <Hero theme={theme} setToastVisible={setToastVisible} />
      
      <LiveMockup theme={theme} />
      
      <Features theme={theme} />

      <UseCases theme={theme} />
      
      <Performance theme={theme} />

      <Testimonials theme={theme} />
      
      <FAQ theme={theme} />
      
      <Footer theme={theme} />

      <CmdKModal theme={theme} setTheme={setTheme} isOpen={isCmdKOpen} setIsOpen={setIsCmdKOpen} setToastVisible={setToastVisible} />

      {/* Temporary Toast Notification */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] pointer-events-none">
        <AnimatePresence>
          {toastVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-fuchsia-500 text-white' : 'bg-fuchsia-500 text-white'}`}
            >
              <Sparkles className="w-4 h-4" />
              Processing your command...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
