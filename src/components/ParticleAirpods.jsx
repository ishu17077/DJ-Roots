import React, { useEffect, useRef } from 'react';

export default function ParticleAirpods() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    if (!canvas || !container) return;
    let animationFrameId;

    // Particle Classes Setup
    const particles = [];
    const numDust = 2500;   // Tiny specs
    const numBubbles = 400; // Medium glowing dots
    const numBokeh = 40;    // Large blurred dots

    // Generate particles with a biased distribution (dense at the inner ring, trailing off outward)
    const generateParticles = (count, sizeMin, sizeMax, speedMult, opacityBase, type) => {
      for (let i = 0; i < count; i++) {
        // Use a power function to bias the distribution towards the inner radius (1.0)
        const distribution = Math.pow(Math.random(), 3);
        const normRadius = 1.0 + distribution * 1.8; // Ranges from 1.0 to 2.8

        particles.push({
          angle: Math.random() * Math.PI * 2,
          normRadius: normRadius,
          size: Math.random() * (sizeMax - sizeMin) + sizeMin,
          speed: (Math.random() * 0.002 + 0.0005) * speedMult * (Math.random() > 0.5 ? 1 : -0.2), // Mostly rotating one way
          opacity: opacityBase * (0.5 + Math.random() * 0.5),
          wobbleSpeed: Math.random() * 0.002 + 0.001,
          wobblePhase: Math.random() * Math.PI * 2,
          type: type,
          // Using DJ Roots theme colors for particles
          color: ['#ec4899', '#a855f7', '#ffffff'][Math.floor(Math.random() * 3)]
        });
      }
    };

    generateParticles(numDust, 0.2, 0.8, 1, 0.8, 'dust');
    generateParticles(numBubbles, 1.0, 2.0, 0.8, 0.6, 'bubble');
    generateParticles(numBokeh, 2.0, 6.0, 0.5, 0.15, 'bokeh');

    // Handle Resize
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let lastTime = performance.now();

    const animate = (time) => {
      const dt = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lock center exactly to the middle of the canvas (removed mouse parallax)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Calculate responsive inner radius based on screen size
      const innerRadius = Math.min(canvas.width, canvas.height) * 0.20;

      ctx.globalCompositeOperation = 'screen'; // Creates the glowing overlay effect

      particles.forEach((p) => {
        // Update physics
        p.angle += p.speed;

        // Add a gentle wobble to the radius
        const wobble = Math.sin(time * p.wobbleSpeed + p.wobblePhase) * (p.type === 'bokeh' ? 20 : 5);
        const actualRadius = (innerRadius * p.normRadius) + wobble;

        const x = centerX + Math.cos(p.angle) * actualRadius;
        const y = centerY + Math.sin(p.angle) * actualRadius;

        // Twinkle effect
        const twinkle = 0.7 + 0.3 * Math.sin(time * 0.003 + p.wobblePhase);

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);

        if (p.type === 'bokeh') {
          // Large blurred particles
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size);
          // Parse hex color to rgba
          let r = 255, g = 255, b = 255;
          if (p.color === '#ec4899') { r = 236; g = 72; b = 153; }
          else if (p.color === '#a855f7') { r = 168; g = 85; b = 247; }

          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.opacity * twinkle})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.fillStyle = gradient;
        } else {
          // Sharp dust and bubbles
          let r = 255, g = 255, b = 255;
          if (p.color === '#ec4899') { r = 236; g = 72; b = 153; }
          else if (p.color === '#a855f7') { r = 168; g = 85; b = 247; }
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * twinkle})`;
        }

        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over'; // Reset
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">

      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      />

      {/* Center Image */}
      <div className="z-10 relative pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] w-[250px] h-[250px] lg:w-[250px] lg:h-[250px]">
        <img
          src="/logo.png"
          alt="DJ Roots"
          className="w-full h-full object-contain center"
        />
      </div>

    </div>
  );
}
