import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

interface TestimonialsProps {
  theme: 'dark' | 'light';
}

const reviews = [
  {
    name: "Sarah Chen",
    role: "VP of Engineering at CloudScale",
    quote: "VORLAGE fundamentally changed how we draft system architectures. Speaking our AWS topology into existence cut our planning meetings from 4 hours to 45 minutes."
  },
  {
    name: "Marcus Aurelius",
    role: "Principal Architect, Nexus AI",
    quote: "The zero-latency streaming is not a gimmick; it's a technical marvel. The websocket integration with our internal React Flow dashboards was flawless."
  },
  {
    name: "Elena Rodriguez",
    role: "Founder, Systemize",
    quote: "I've never seen an SDK this clean. The FastAPI backend parsing intent so accurately means we can trust the spatial node-graphs generated 99% of the time."
  },
  {
    name: "David Kim",
    role: "Lead Game Developer",
    quote: "We use VORLAGE to map out complex dialogue trees and state machines. It feels like magic to just describe the quest logic and watch the nodes wire themselves."
  }
];

export const Testimonials = ({ theme }: TestimonialsProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto mt-32 px-6 overflow-hidden relative z-10">
      <div className="text-center mb-16">
        <h2 className={`text-3xl font-sans font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Loved by <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-300 to-slate-500 dark:from-white dark:to-slate-400">Engineering Leaders</span>
        </h2>
        <p className={`text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          See what top architects are saying about the voice-to-node experience.
        </p>
      </div>

      <div className="relative w-full flex items-center">
        {/* Fade edges */}
        <div className={`absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r pointer-events-none transition-colors duration-700 ${theme === 'dark' ? 'from-slate-900 to-transparent' : 'from-slate-50 to-transparent'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l pointer-events-none transition-colors duration-700 ${theme === 'dark' ? 'from-slate-900 to-transparent' : 'from-slate-50 to-transparent'}`} />
        
        <motion.div 
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {/* First Set */}
          <div className="flex gap-6 pr-6 items-center">
            {reviews.map((review, i) => (
              <div key={`a-${i}`} className={`w-80 p-8 rounded-2xl border flex flex-col gap-6 flex-shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#111318] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className={`absolute inset-0 pointer-events-none rounded-[inherit] ${theme === 'dark' ? 'shadow-glass-inset' : 'shadow-glass-inset-light'}`} />
                <Quote className={`w-6 h-6 opacity-30 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                <p className={`text-sm leading-relaxed flex-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  "{review.quote}"
                </p>
                <div>
                  <div className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{review.name}</div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{review.role}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Second Set */}
          <div className="flex gap-6 pr-6 items-center">
            {reviews.map((review, i) => (
              <div key={`b-${i}`} className={`w-80 p-8 rounded-2xl border flex flex-col gap-6 flex-shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#111318] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className={`absolute inset-0 pointer-events-none rounded-[inherit] ${theme === 'dark' ? 'shadow-glass-inset' : 'shadow-glass-inset-light'}`} />
                <Quote className={`w-6 h-6 opacity-30 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                <p className={`text-sm leading-relaxed flex-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  "{review.quote}"
                </p>
                <div>
                  <div className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{review.name}</div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{review.role}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
