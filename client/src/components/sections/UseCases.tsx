import { motion } from 'motion/react';
import { Cloud, Gamepad2, Network } from 'lucide-react';

interface UseCasesProps {
  theme: 'dark' | 'light';
}

export const UseCases = ({ theme }: UseCasesProps) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  const cases = [
    {
      icon: <Network className="w-5 h-5" />,
      title: "Enterprise Microservices",
      desc: "Speak your Kubernetes deployments and service meshes into existence. Automatically generate the boilerplate YAML mapping directly to your node graph.",
    },
    {
      icon: <Gamepad2 className="w-5 h-5" />,
      title: "Game Logic & AI State",
      desc: "Map out complex NPC behavior trees, dialogue options, and quest states purely through conversation with the VORLAGE engine.",
    },
    {
      icon: <Cloud className="w-5 h-5" />,
      title: "Cloud Infrastructure",
      desc: "Dictate AWS, GCP, or Azure topologies. Watch VPCs, Subnets, and Load Balancers connect visually in real-time before applying Terraform.",
    }
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      className="w-full max-w-6xl mx-auto mt-32 px-6 relative z-10"
    >
      <div className="mb-12">
        <h2 className={`text-3xl font-sans font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Built for <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-300 to-slate-500 dark:from-white dark:to-slate-400">Every Vertical</span>
        </h2>
        <p className={`text-base max-w-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Scale from single-node prototypes to massive enterprise deployments without changing your workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cases.map((useCase, i) => (
          <motion.div key={i} variants={itemVariants} className={`p-8 rounded-2xl border relative overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-[#111318] border-white/5 hover:border-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className={`absolute inset-0 pointer-events-none rounded-[inherit] ${theme === 'dark' ? 'shadow-glass-inset' : 'shadow-glass-inset-light'}`} />

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              {useCase.icon}
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{useCase.title}</h3>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{useCase.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
