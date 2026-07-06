import { motion } from 'motion/react';
import { FAQItem } from '../ui/FAQItem';

interface FAQProps {
  theme: 'dark' | 'light';
}

export const FAQ = ({ theme }: FAQProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
      }}
      className="w-full max-w-3xl mx-auto mt-32 px-6"
    >
      <div className="text-center mb-12">
        <h2 className={`text-4xl font-display font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-rose-400">Questions</span>
        </h2>
        <p className={`text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          Everything you need to know about VORLAGE's technical capabilities.
        </p>
      </div>
      
      <div className={`rounded-3xl border p-6 md:p-8 ${theme === 'dark' ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
        {[
          {
            question: "How does the zero-latency streaming work?",
            answer: "We utilize persistent WebSocket connections established at the edge. Audio data is streamed in chunks to Deepgram for speech-to-text, and the resulting transcripts are simultaneously piped into our FastAPI backend via GPT-4o, bypassing traditional REST overhead."
          },
          {
            question: "Can I self-host the VORLAGE engine?",
            answer: "Yes. The core engine is available as a Docker container. You can deploy it within your own VPC to ensure data compliance while maintaining sub-20ms latency."
          },
          {
            question: "What state management libraries are supported?",
            answer: "Out of the box, our React SDK integrates seamlessly with Zustand and Redux. The visual node-graph relies on React Flow, meaning you can plug in any custom node logic you desire."
          },
          {
            question: "Is it scalable for production workloads?",
            answer: "Absolutely. During our validation phase, the architecture handled 10,000+ concurrent requests per second with a 99.99% uptime SLA, drawing less than 50MB of memory per instance."
          }
        ].map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} theme={theme} />
        ))}
      </div>
    </motion.div>
  );
};
