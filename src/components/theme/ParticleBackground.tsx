import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const CONNECTION_DISTANCE = 140;
    const MOUSE = { x: -1000, y: -1000 };
    const MOUSE_ATTRACT_RADIUS = 280;
    const MOUSE_ATTRACT_FORCE = 0.012;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Significantly more particles for a richer effect
      const numParticles = Math.min(
        Math.floor((canvas.width * canvas.height) / 8000),
        220
      );

      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.5 + 0.6,
          opacity: Math.random() * 0.5 + 0.15,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      MOUSE.x = e.clientX;
      MOUSE.y = e.clientY;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((p) => {
        // Drift toward cursor
        const mdx = MOUSE.x - p.x;
        const mdy = MOUSE.y - p.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mDist < MOUSE_ATTRACT_RADIUS && mDist > 1) {
          const force = MOUSE_ATTRACT_FORCE * (1 - mDist / MOUSE_ATTRACT_RADIUS);
          p.vx += (mdx / mDist) * force;
          p.vy += (mdy / mDist) * force;
        }

        // Dampen velocity to keep motion fluid
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Clamp max speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.2) {
          p.vx = (p.vx / speed) * 1.2;
          p.vy = (p.vy / speed) * 1.2;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Draw particle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 140, 255, ${p.opacity})`;
        ctx.fill();

        // Subtle glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 140, 255, ${p.opacity * 0.06})`;
        ctx.fill();
      });

      // Draw connections (constellation lines)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108, 140, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse proximity glow — brighter near cursor
        const mdx2 = particles[i].x - MOUSE.x;
        const mdy2 = particles[i].y - MOUSE.y;
        const mDist2 = Math.sqrt(mdx2 * mdx2 + mdy2 * mdy2);
        if (mDist2 < 200) {
          const mOpacity = (1 - mDist2 / 200) * 0.35;
          ctx.beginPath();
          ctx.arc(particles[i].x, particles[i].y, particles[i].radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${mOpacity})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="particle-canvas"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
