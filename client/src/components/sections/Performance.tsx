import { motion } from 'motion/react';

interface PerformanceProps {
  theme: 'dark' | 'light';
}

export const Performance = ({ theme }: PerformanceProps) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="w-full max-w-5xl mx-auto mt-32 text-center"
    >
      <h2 className={`text-4xl font-display font-medium mb-12 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        Built for extreme <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Performance</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
        {[
          { label: "Average Latency", value: "12ms" },
          { label: "Requests/sec", value: "10k+" },
          { label: "Uptime SLA", value: "99.99%" },
          { label: "Memory Footprint", value: "<50MB" }
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`text-3xl font-display font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
            <div className={`text-xs uppercase tracking-wider font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{stat.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
