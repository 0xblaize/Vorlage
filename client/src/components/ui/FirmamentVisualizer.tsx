import { useEffect, useRef } from 'react';

interface VisualizerProps {
  isListening: boolean;
  theme: 'dark' | 'light';
}

export const FirmamentVisualizer = ({ isListening, theme }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let animationFrameId: number;
    let time = 0;

    // Create particles
    const particleCount = 60;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      baseRadius: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += isListening ? 0.05 : 0.01;

      // Draw glowing central orb
      const centerX = width / 2;
      const centerY = height / 2;
      
      const pulse = Math.sin(time) * 0.5 + 0.5;
      const orbRadius = isListening ? 150 + pulse * 50 : 100 + pulse * 20;

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      
      if (theme === 'dark') {
        gradient.addColorStop(0, isListening ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.05)');
        gradient.addColorStop(0.5, isListening ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.02)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        gradient.addColorStop(0, isListening ? 'rgba(56, 189, 248, 0.1)' : 'rgba(56, 189, 248, 0.05)');
        gradient.addColorStop(0.5, isListening ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.02)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((p, i) => {
        // Speed multiplier based on state
        const speed = isListening ? 3 : 1;
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Swirling effect around center
        const dxCenter = centerX - p.x;
        const dyCenter = centerY - p.y;
        const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        
        if (isListening && distCenter > 50) {
          // Add a subtle gravitational pull and swirl
          p.x += (dxCenter / distCenter) * 0.5;
          p.y += (dyCenter / distCenter) * 0.5;
          p.x += (dyCenter / distCenter) * 1.5; // Swirl
          p.y -= (dxCenter / distCenter) * 1.5;
        }

        // Wrap around
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        p.radius = Math.max(
          0.1,
          p.baseRadius + Math.sin(time + p.phase) * (isListening ? 2 : 0.5),
        );

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = theme === 'dark' 
          ? `rgba(186, 230, 253, ${isListening ? 0.8 : 0.3})` 
          : `rgba(2, 132, 199, ${isListening ? 0.6 : 0.2})`;
        ctx.fill();

        // Draw lightning/neural connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          const maxDist = isListening ? 250 : 150;

          if (dist2 < maxDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            
            // If listening, make lines jittery like lightning
            if (isListening) {
              const midX = (p.x + p2.x) / 2 + (Math.random() - 0.5) * 20;
              const midY = (p.y + p2.y) / 2 + (Math.random() - 0.5) * 20;
              ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
            } else {
              ctx.lineTo(p2.x, p2.y);
            }
            
            const opacity = (1 - dist2 / maxDist) * (isListening ? 0.4 : 0.1);
            ctx.strokeStyle = theme === 'dark' 
              ? `rgba(56, 189, 248, ${opacity})` 
              : `rgba(14, 165, 233, ${opacity})`;
            ctx.lineWidth = isListening ? 1.5 : 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isListening]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};
