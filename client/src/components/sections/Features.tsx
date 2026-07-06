import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Mic, Sparkles, Command } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlowCard } from '../ui/GlowCard';

interface FeaturesProps {
  theme: 'dark' | 'light';
}

export const Features = ({ theme }: FeaturesProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [2, -2]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-2, 2]), { stiffness: 100, damping: 30 });

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

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0 } }
        }}
        className="w-full max-w-6xl mx-auto mt-24 relative z-10 flex flex-col md:flex-row items-center gap-16 px-6"
      >
        <motion.div variants={itemVariants} className="flex-1 space-y-6 min-w-0">
           <h2 className={`text-4xl md:text-5xl font-sans font-semibold tracking-tight leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
             Integrate via <br/> <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-300 to-slate-500 dark:from-white dark:to-slate-400">Python SDK</span>
           </h2>
           <p className={`text-base leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
             VORLAGE is built for extensibility. Connect our WebSocket API directly to your React Flow application, and leverage our Python FastAPI engine to customize your LLM prompting and STT parameters.
           </p>
           <div className="pt-4 flex flex-wrap items-center gap-4">
             <Link to="/signup" data-magnetic="true" className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm ${theme === 'dark' ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
               Read Documentation
             </Link>
             <Link to="/signup" data-magnetic="true" className={`px-5 py-2.5 rounded-lg font-medium text-sm border transition-colors ${theme === 'dark' ? 'border-white/20 hover:bg-white/10 text-slate-200' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}>
               Get API Key
             </Link>
           </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex-1 w-full min-w-0" style={{ perspective: 2000 }}>
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`rounded-2xl overflow-hidden border shadow-glass-lg relative max-w-full ${theme === 'dark' ? 'bg-[#0a0a0c] border-white/10 shadow-black/80' : 'bg-white border-slate-200 shadow-slate-200/50'}`}
          >
            {/* Top inner highlight */}
            <div className={`absolute inset-0 pointer-events-none rounded-[inherit] ${theme === 'dark' ? 'shadow-glass-inset' : 'shadow-glass-inset-light'}`} />

            {/* Mac window controls */}
            <div className={`flex px-4 py-3 border-b gap-2 items-center ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
               <div className="w-2.5 h-2.5 rounded-full bg-slate-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-slate-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-slate-500/50" />
               <span className={`ml-3 text-[11px] font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>app.tsx</span>
            </div>
            <div className={`p-6 text-[13px] font-mono leading-relaxed overflow-x-auto whitespace-pre ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
<span className="text-[#c678dd]">import</span> &#123; <span className="text-[#e5c07b]">useVorlage</span> &#125; <span className="text-[#c678dd]">from</span> <span className="text-[#98c379]">'@vorlage/react'</span>;
<span className="text-[#c678dd]">import</span> &#123; <span className="text-[#e5c07b]">ReactFlow</span> &#125; <span className="text-[#c678dd]">from</span> <span className="text-[#98c379]">'reactflow'</span>;

<span className="text-[#c678dd]">export function</span> <span className="text-[#61afef]">ArchitectureCanvas</span>() &#123;
  <span className="text-[#5c6370]">// Zero-latency WebSocket stream</span>
  <span className="text-[#c678dd]">const</span> &#123; <span className="text-[#e06c75]">nodes</span>, <span className="text-[#e06c75]">edges</span> &#125; = <span className="text-[#61afef]">useVorlage</span>(&#123;
    apiKey: process.env.<span className="text-[#e5c07b]">NEXT_PUBLIC_VORLAGE_KEY</span>,
    engine: <span className="text-[#98c379]">'fastapi-gpt4o'</span>
  &#125;);

  <span className="text-[#c678dd]">return</span> (
    <span className="text-[#56b6c2]">&lt;</span><span className="text-[#e5c07b]">ReactFlow</span> <span className="text-[#d19a66]">nodes</span>=<span className="text-[#56b6c2]">&#123;</span>nodes<span className="text-[#56b6c2]">&#125;</span> <span className="text-[#d19a66]">edges</span>=<span className="text-[#56b6c2]">&#123;</span>edges<span className="text-[#56b6c2]">&#125;</span> <span className="text-[#56b6c2]">/&gt;</span>
  );
&#125;
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bento Grid */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="w-full max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left px-6"
      >
        <motion.div variants={itemVariants}>
          <GlowCard theme={theme} className="h-full">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-6 border shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Mic className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
            </div>
            <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Zero-Latency STT</h3>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Continuous WebSocket streaming to Deepgram and OpenAI for instantaneous speech recognition.</p>
          </GlowCard>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <GlowCard theme={theme} className="h-full">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-6 border shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Sparkles className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
            </div>
            <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Spatial Node-Graphs</h3>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Translate concepts into visual node structures dynamically rendered with React Flow & Zustand.</p>
          </GlowCard>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <GlowCard theme={theme} className="h-full">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-6 border shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Command className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
            </div>
            <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Python FastAPI Engine</h3>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>High-performance backend utilizing OpenAI GPT-4o to parse intent and build logical architectures.</p>
          </GlowCard>
        </motion.div>
      </motion.div>
    </>
  );
};
