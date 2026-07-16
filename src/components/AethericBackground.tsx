import { useEffect, useRef } from "react";

export default function AethericBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class for flow
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      speed: number;
    }

    const particles: Particle[] = [];
    const colors = ["#3b82f6", "#8b5cf6", "#6366f1", "#1e40af"];

    // Initialize particles
    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.02 + 0.01,
      });
    }

    let mouse = { x: width / 2, y: height / 2, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let time = 0;

    // Render loop
    const render = () => {
      time += 0.002;
      ctx.clearRect(0, 0, width, height);

      // Create rich deep background gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, "#080c1d");
      bgGrad.addColorStop(0.5, "#040611");
      bgGrad.addColorStop(1, "#010206");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw flowing sine waves (Aetheric Flow)
      ctx.lineWidth = 1.5;
      for (let waveIndex = 0; waveIndex < 3; waveIndex++) {
        ctx.beginPath();
        const offset = waveIndex * 150;
        const amplitude = 40 + waveIndex * 15;
        const frequency = 0.0015 - waveIndex * 0.0003;

        for (let x = 0; x < width; x += 10) {
          // Calculate Y with multiple sine inputs for organic warp
          let y =
            height * 0.5 +
            Math.sin(x * frequency + time + offset) * amplitude +
            Math.cos(x * 0.005 - time * 1.5 + offset) * (amplitude * 0.3);

          // Gently pull wave towards mouse if close
          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 300) {
              const pull = (300 - dist) / 300;
              y += (mouse.y - y) * pull * 0.15;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Beautiful glowing gradient for waves
        const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
        if (waveIndex === 0) {
          waveGrad.addColorStop(0, "rgba(59, 130, 246, 0)");
          waveGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.12)");
          waveGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
        } else if (waveIndex === 1) {
          waveGrad.addColorStop(0, "rgba(139, 92, 246, 0)");
          waveGrad.addColorStop(0.5, "rgba(139, 92, 246, 0.15)");
          waveGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
        } else {
          waveGrad.addColorStop(0, "rgba(99, 102, 241, 0)");
          waveGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.1)");
          waveGrad.addColorStop(1, "rgba(99, 102, 241, 0)");
        }

        ctx.strokeStyle = waveGrad;
        ctx.shadowBlur = waveIndex === 1 ? 15 : 0;
        ctx.shadowColor = waveIndex === 1 ? "rgba(139, 92, 246, 0.3)" : "transparent";
        ctx.stroke();
      }
      ctx.shadowBlur = 0; // reset

      // Draw and update particles
      particles.forEach((p, index) => {
        // Organic sinusoidal motion + standard velocity
        p.x += p.vx + Math.sin(time * 5 + index) * 0.1;
        p.y += p.vy + Math.cos(time * 3 + index) * 0.1;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Interactive mouse push
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            // Push away
            p.x += (dx / dist) * force * 2;
            p.y += (dy / dist) * force * 2;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect nearby particles for a digital constellation effect
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const edgeAlpha = (120 - dist) / 120 * 0.12;
            ctx.strokeStyle = `rgba(139, 92, 246, ${edgeAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1.0; // reset

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      id="aetheric-canvas"
    />
  );
}
