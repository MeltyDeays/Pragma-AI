import React, { useRef, useEffect } from 'react';

export default function ArbolDeLaVidaCanvas({ estudiante, tareas, posiciones }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      const w = Math.min(canvas.parentElement.clientWidth || 800, 1920);
      const h = Math.min(canvas.parentElement.clientHeight || 600, 550);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Sistema de partículas de polvo estelar de fondo
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600),
      radius: Math.random() * 1.8,
      alpha: Math.random(),
      speed: 0.003 + Math.random() * 0.012,
      hue: Math.random() > 0.6 ? 190 : 280
    }));

    // Partículas de flujo de luz
    let flowParticles = [];

    const conexiones = [
      { from: 'JavaScript', to: 'React' },
      { from: 'JavaScript', to: 'Node.js' },
      { from: 'JavaScript', to: 'HTML' },
      { from: 'JavaScript', to: 'CSS' },
      { from: 'React', to: 'HTML' },
      { from: 'React', to: 'CSS' },
      { from: 'Node.js', to: 'Supabase' },
      { from: 'Python', to: 'Java' },
      { from: 'Python', to: 'C++' },
      { from: 'Java', to: 'C++' }
    ];

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
    }

    const render = () => {
      // Fondo negro profundo
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now();

      // Nebulosa interactiva que sigue al mouse
      const nebula = ctx.createRadialGradient(
        mouseX, mouseY, 40,
        mouseX, mouseY, Math.max(canvas.width, canvas.height) * 0.65
      );
      nebula.addColorStop(0, 'rgba(0, 243, 255, 0.12)');
      nebula.addColorStop(0.3, 'rgba(139, 92, 246, 0.06)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar órbitas elípticas concéntricas de fondo (Sensación 3D táctica)
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
      ctx.lineWidth = 1;
      const orbitalDistances = [120, 200, 290, 380];
      orbitalDistances.forEach((dist, idx) => {
        ctx.beginPath();
        // Usamos una inclinación en 3D para dar el aspecto de plano galáctico
        ctx.ellipse(
          canvas.width / 2, 
          canvas.height / 2, 
          dist, 
          dist * 0.55, 
          time * 0.000015 * (idx + 1), 
          0, 
          Math.PI * 2
        );
        ctx.stroke();
      });

      // Polvo estelar
      particles.forEach(p => {
        p.alpha += p.speed;
        if (p.alpha > 1 || p.alpha < 0) p.speed = -p.speed;
        ctx.globalAlpha = Math.abs(p.alpha);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${Math.abs(p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Dibujar corrientes de energía fluidas de agua y luz en 3D
      if (posiciones && tareas.length > 0) {
        conexiones.forEach(link => {
          const p1 = posiciones[link.from];
          const p2 = posiciones[link.to];
          if (!p1 || !p2) return;

          const aprobadas1 = tareas.filter(t => t.tecnologia === link.from && (t.estado === 'Aprobada' || t.estado === 'Aprobado')).length;
          const aprobadas2 = tareas.filter(t => t.tecnologia === link.to && (t.estado === 'Aprobada' || t.estado === 'Aprobado')).length;
          if (aprobadas1 === 0 || aprobadas2 === 0) return;

          const x1 = (p1.x / 100) * canvas.width;
          const y1 = (p1.y / 100) * canvas.height;
          const x2 = (p2.x / 100) * canvas.width;
          const y2 = (p2.y / 100) * canvas.height;

          // Dibujar corrientes fluidas (haz de 3 curvas con desfases)
          for (let j = 0; j < 3; j++) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(0, 243, 255, 0.35)';
            ctx.strokeStyle = j === 0 ? 'rgba(0, 243, 255, 0.28)' : j === 1 ? 'rgba(139, 92, 246, 0.22)' : 'rgba(0, 255, 102, 0.18)';
            ctx.lineWidth = j === 0 ? 2.5 : 1.2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            
            const steps = 40;
            for (let i = 0; i <= steps; i++) {
              const t = i / steps;
              const cx = x1 + (x2 - x1) * t;
              const cy = y1 + (y2 - y1) * t;
              
              const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
              const waveFreq = 0.005;
              const waveAmp = 5 + Math.sin(time * 0.003 + t * 12 + j * Math.PI) * 3;
              const offset = Math.sin(t * Math.PI * 3 + time * waveFreq + j) * waveAmp;
              
              ctx.lineTo(
                cx + Math.cos(angle) * offset,
                cy + Math.sin(angle) * offset
              );
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          // Generar partículas de luz fluyendo (máx 50 activas)
          if (Math.random() < 0.04 && flowParticles.length < 50) {
            flowParticles.push({
              fromX: x1, fromY: y1,
              toX: x2, toY: y2,
              progress: 0,
              speed: 0.004 + Math.random() * 0.007,
              size: 1.2 + Math.random() * 2.0,
              color: Math.random() > 0.5 ? '#00f3ff' : '#00ff66',
              jFactor: Math.random() * 3
            });
          }
        });
      }

      // Renderizar partículas de luz fluyendo por las corrientes
      for (let i = flowParticles.length - 1; i >= 0; i--) {
        const p = flowParticles[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          flowParticles.splice(i, 1);
          continue;
        }

        const t = p.progress;
        const cx = p.fromX + (p.toX - p.fromX) * t;
        const cy = p.fromY + (p.toY - p.fromY) * t;

        const angle = Math.atan2(p.toY - p.fromY, p.toX - p.fromX) + Math.PI / 2;
        const waveAmp = 5 + Math.sin(time * 0.003 + t * 12 + p.jFactor * Math.PI) * 3;
        const offset = Math.sin(t * Math.PI * 3 + time * 0.005 + p.jFactor) * waveAmp;
        
        const px = cx + Math.cos(angle) * offset;
        const py = cy + Math.sin(angle) * offset;

        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [posiciones, tareas]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 pointer-events-none" 
      style={{ zIndex: 0, display: 'block', width: '100%', height: '100%' }}
    />
  );
}
