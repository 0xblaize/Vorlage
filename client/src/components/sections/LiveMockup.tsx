import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Box, Database, Zap } from 'lucide-react';

interface LiveMockupProps {
  theme: 'dark' | 'light';
}

export const LiveMockup = ({ theme }: LiveMockupProps) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="w-full max-w-6xl mx-auto mt-24 relative z-10 px-6"
      style={{ perspective: 2000 }}
    >
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`p-10 md:p-14 rounded-3xl border relative overflow-hidden flex flex-col lg:flex-row gap-12 items-center transition-colors duration-500 ${theme === 'dark' ? 'bg-[#111318] border-white/5 shadow-glass-lg shadow-black/80' : 'bg-white border-slate-200 shadow-glass-lg shadow-slate-200/50'}`}
      >
        <div className={`absolute inset-0 pointer-events-none rounded-[inherit] ${theme === 'dark' ? 'shadow-glass-inset' : 'shadow-glass-inset-light'}`} />

        <div className="flex-1 w-full relative z-10 min-w-0">
          <h2 className={`text-3xl md:text-4xl font-sans font-semibold tracking-tight mb-4 leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Watch your architecture <br className="hidden md:block"/> assemble in real-time.
          </h2>
          <p className={`text-sm md:text-base leading-relaxed mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Our proprietary engine processes speech through Deepgram and OpenAI, instantly reflecting spatial node-graphs via WebSockets before you even finish your sentence.
          </p>

          <div className={`rounded-xl border overflow-hidden relative shadow-sm ${theme === 'dark' ? 'bg-[#0a0a0c] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
             <div className={`flex px-3 py-2 border-b items-center gap-2 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
               <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-500/50" />
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-500/50" />
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-500/50" />
               </div>
               <span className={`text-[10px] font-mono ml-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>transcript.txt</span>
             </div>
             
             <div className="p-4">
               <div className="flex items-center gap-2 mb-3">
                 <div className="flex gap-0.5">
                   <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 1 }} className={`w-0.5 rounded-full ${theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'}`} />
                   <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className={`w-0.5 rounded-full ${theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'}`} />
                   <motion.div animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className={`w-0.5 rounded-full ${theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'}`} />
                 </div>
               </div>
               <p className={`font-mono text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                 <span className="text-slate-500">"</span>
                 Create a new <span className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>auth service</span> that connects to a <span className={`${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>PostgreSQL database</span>, and add a <span className={`${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>Redis cache</span> layer...
                 <span className="text-slate-500">"</span>
                 <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className={`inline-block w-1.5 h-3 ml-1 translate-y-0.5 ${theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'}`} />
               </p>
             </div>
          </div>
        </div>

        <div className={`flex-1 w-full min-w-0 h-[380px] rounded-2xl border relative overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-[#0a0a0c] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
           <div className={`flex px-3 py-2 border-b items-center gap-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <div className={`text-[10px] font-medium px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>canvas.tsx</div>
              <div className={`text-[10px] font-medium px-2 py-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>schema.prisma</div>
           </div>

           <div className="absolute inset-0 top-8 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />
           
           <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }} className={`absolute top-[20%] left-[10%] p-2.5 rounded-lg border flex items-center gap-2 z-10 shadow-sm ${theme === 'dark' ? 'bg-[#1a1c23] border-white/10' : 'bg-white border-slate-200'}`}>
             <div className={`w-6 h-6 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><Box className="w-3.5 h-3.5"/></div>
             <span className={`text-[11px] font-medium pr-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Auth Service</span>
           </motion.div>

           <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.6 }} className={`absolute top-[50%] right-[10%] p-2.5 rounded-lg border flex items-center gap-2 z-10 shadow-sm ${theme === 'dark' ? 'bg-[#1a1c23] border-white/10' : 'bg-white border-slate-200'}`}>
             <div className={`w-6 h-6 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}><Database className="w-3.5 h-3.5"/></div>
             <span className={`text-[11px] font-medium pr-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>PostgreSQL</span>
           </motion.div>

           <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 1.0 }} className={`absolute bottom-[15%] left-[35%] p-2.5 rounded-lg border flex items-center gap-2 z-10 shadow-sm ${theme === 'dark' ? 'bg-[#1a1c23] border-white/10' : 'bg-white border-slate-200'}`}>
             <div className={`w-6 h-6 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}><Zap className="w-3.5 h-3.5"/></div>
             <span className={`text-[11px] font-medium pr-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Redis Cache</span>
           </motion.div>

           <svg className="absolute inset-0 w-full h-full pointer-events-none mt-8" preserveAspectRatio="none">
             <motion.path initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }} d="M 10% 20% C 50% 20%, 50% 50%, 90% 50%" fill="none" stroke={theme === 'dark' ? '#334155' : '#cbd5e1'} strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
             <motion.path initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }} d="M 10% 20% C 30% 80%, 40% 80%, 50% 80%" fill="none" stroke={theme === 'dark' ? '#334155' : '#cbd5e1'} strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
           </svg>
        </div>
      </motion.div>
    </motion.div>
  );
};
