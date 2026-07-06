import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Mic } from 'lucide-react';

const LOGOS = [
  <div key="1" className="flex items-center gap-1.5 font-sans font-semibold text-sm tracking-tight whitespace-nowrap"><div className="w-4 h-4 rounded bg-current opacity-80"/>Acme Corp</div>,
  <div key="2" className="flex items-center gap-1.5 font-sans font-semibold text-sm tracking-tight whitespace-nowrap">Globex</div>,
  <div key="3" className="flex items-center gap-1.5 font-sans font-medium text-sm whitespace-nowrap">Soylent</div>,
  <div key="4" className="flex items-center gap-1.5 font-sans font-semibold text-sm tracking-widest uppercase whitespace-nowrap">Initech</div>,
  <div key="5" className="flex items-center gap-1.5 font-sans font-bold text-sm tracking-tighter whitespace-nowrap">Hooli</div>,
  <div key="6" className="flex items-center gap-1.5 font-sans font-medium text-sm tracking-wide whitespace-nowrap">Massive Dynamic</div>,
  <div key="7" className="flex items-center gap-1.5 font-sans font-semibold text-sm whitespace-nowrap">Pied Piper</div>,
  <div key="8" className="flex items-center gap-1.5 font-sans font-bold text-sm uppercase whitespace-nowrap">Umbrella</div>,
];

interface HeroProps {
  theme: 'dark' | 'light';
  setToastVisible: (visible: boolean) => void;
}

export const Hero = ({ theme, setToastVisible }: HeroProps) => {
  const [volumes, setVolumes] = useState<number[]>(Array(24).fill(20));

  // Typewriter State
  const WORDS = ["your voice.", "your thoughts.", "your architecture.", "your intuition."];
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = WORDS[wordIndex];
    const timeoutSpeed = isDeleting ? 40 : text === currentWord ? 2500 : 80;
    
    const timer = setTimeout(() => {
      if (isDeleting) {
        if (text === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % WORDS.length);
        } else {
          setText(prev => prev.slice(0, -1));
        }
      } else {
        if (text === currentWord) {
          setIsDeleting(true);
        } else {
          setText(currentWord.slice(0, text.length + 1));
        }
      }
    }, timeoutSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [3, -3]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-3, 3]), { stiffness: 100, damping: 30 });

  useEffect(() => {
    let time = 0;
    const intervalId = setInterval(() => {
      time += 0.15;
      const newVolumes = Array(24).fill(0).map((_, i) => {
        const base = Math.sin(time + i * 0.4) * 35 + 45;
        const noise = Math.random() * 25;
        return Math.max(15, Math.min(100, base + noise));
      });
      setVolumes(newVolumes);
    }, 120);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };
  const scaleItemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-32 flex flex-col items-center text-center min-h-[calc(100vh-88px)] justify-center"
    >
      {/* Tighter Typography */}
      <motion.h1 variants={itemVariants} className={`text-6xl sm:text-8xl font-sans font-semibold tracking-tight mb-6 leading-[1.05] mt-12 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        The interface is <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-300 to-slate-600 dark:from-white dark:to-slate-500">{text}</span>
        <motion.span 
          animate={{ opacity: [1, 0] }} 
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className={`inline-block w-[3px] h-[60px] sm:h-[80px] ml-2 -translate-y-1 ${theme === 'dark' ? 'bg-white' : 'bg-slate-900'}`}
        />
      </motion.h1>

      <motion.p variants={itemVariants} className={`text-base md:text-lg max-w-2xl mb-16 font-normal leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        Zero-latency architectural canvas. Translate speech into spatial node-graphs via a continuous WebSocket stream. Designed for performance.
      </motion.p>

      {/* Figma-Quality Widget Card */}
      <div style={{ perspective: 2000, transformStyle: "preserve-3d" }}>
        <motion.div 
          variants={scaleItemVariants}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative group cursor-pointer"
          onClick={() => {
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3000);
          }}
          data-magnetic="true"
        >
          {/* Subtle diffused shadow instead of neon glow */}
          <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/10 to-transparent blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 rounded-3xl" style={{ transform: "translateZ(-50px)" }} />
          
          {/* Floating 3D Nodes */}
          <motion.div 
            animate={{ y: [0, -20, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -left-16 sm:-left-32 -top-16 sm:-top-24 z-20 p-3 sm:p-4 rounded-xl sm:rounded-2xl border backdrop-blur-md flex items-center gap-2 sm:gap-3 shadow-glass-md ${theme === 'dark' ? 'bg-[#1a1c23]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}
            style={{ transform: "translateZ(100px)" }}
          >
             <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-fuchsia-500" />
             <span className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Auth Node</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 25, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className={`absolute -right-20 sm:-right-40 top-16 sm:top-20 z-20 p-3 sm:p-4 rounded-xl sm:rounded-2xl border backdrop-blur-md flex items-center gap-2 sm:gap-3 shadow-glass-md ${theme === 'dark' ? 'bg-[#1a1c23]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}
            style={{ transform: "translateZ(150px)" }}
          >
             <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-indigo-500" />
             <span className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Database</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className={`absolute left-16 sm:left-24 -bottom-16 sm:-bottom-24 z-20 p-3 sm:p-4 rounded-xl sm:rounded-2xl border backdrop-blur-md flex items-center gap-2 sm:gap-3 shadow-glass-md ${theme === 'dark' ? 'bg-[#1a1c23]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}
            style={{ transform: "translateZ(80px)" }}
          >
             <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500" />
             <span className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Redis Cache</span>
          </motion.div>

          <div className={`relative p-3 sm:p-5 rounded-3xl flex items-center pr-12 sm:pr-20 gap-8 sm:gap-12 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f1115]/90 border border-white/10 shadow-glass-lg shadow-black/50 backdrop-blur-xl' : 'bg-white/90 border border-slate-200 shadow-glass-lg shadow-slate-200/50 backdrop-blur-xl'}`}>
            
            {/* Top inner highlight for 3D realism */}
            <div className={`absolute inset-0 rounded-3xl pointer-events-none ${theme === 'dark' ? 'shadow-glass-inset' : 'shadow-glass-inset-light'}`} />

            {/* Clean square-ish mic container */}
            <div className={`w-28 h-28 sm:w-40 sm:h-40 rounded-2xl flex items-center justify-center relative overflow-hidden border ${theme === 'dark' ? 'bg-black/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <img src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400&auto=format&fit=crop" alt="Studio Mic" className="absolute inset-0 w-full h-full object-cover scale-[1.1] grayscale opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent mix-blend-overlay" />
            </div>
            
            <div className="flex flex-col items-start justify-center h-full py-4 z-10">
               <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                 <Mic className={`w-5 h-5 sm:w-6 sm:h-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                 <span className={`text-sm sm:text-base font-medium tracking-wide ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Audio Input</span>
                 <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full ml-1 sm:ml-2 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
               </div>
               
               {/* Sleek, flat visualizer */}
               <div className="flex items-end gap-[3px] sm:gap-1 h-12 w-[160px] sm:h-16 sm:w-[240px] overflow-hidden">
                 {volumes.slice(0, 24).map((vol, i) => (
                   <motion.div key={i} animate={{ height: `${vol}%` }} transition={{ duration: 0.1, ease: "linear" }} className={`w-1.5 sm:w-2 rounded-t-sm opacity-80 ${theme === 'dark' ? 'bg-slate-300' : 'bg-slate-600'}`} />
                 ))}
               </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Refined Trust Bar */}
      <motion.div variants={itemVariants} className={`mt-32 w-full max-w-5xl mx-auto overflow-hidden relative z-10`}>
        <p className={`text-[10px] font-semibold uppercase tracking-widest mb-6 text-center ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Trusted by innovative teams worldwide</p>
        <div className="relative w-full flex items-center">
           <div className={`absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r pointer-events-none ${theme === 'dark' ? 'from-slate-900 to-transparent' : 'from-slate-50 to-transparent'}`} />
           <div className={`absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l pointer-events-none ${theme === 'dark' ? 'from-slate-900 to-transparent' : 'from-slate-50 to-transparent'}`} />
           <motion.div className="flex w-max" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
             <div className="flex gap-12 sm:gap-20 pr-12 sm:pr-20 items-center">{LOGOS.map((logo, i) => <div key={`a-${i}`} className={`opacity-40 hover:opacity-80 transition-opacity duration-300 cursor-pointer ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{logo}</div>)}</div>
             <div className="flex gap-12 sm:gap-20 pr-12 sm:pr-20 items-center">{LOGOS.map((logo, i) => <div key={`b-${i}`} className={`opacity-40 hover:opacity-80 transition-opacity duration-300 cursor-pointer ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{logo}</div>)}</div>
           </motion.div>
        </div>
      </motion.div>
    </motion.main>
  );
};
