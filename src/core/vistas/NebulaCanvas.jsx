import React, { useRef, useEffect } from 'react';

export default function NebulaCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      const w = Math.min(canvas.parentElement.clientWidth || 300, 1920);
      const h = Math.min(canvas.parentElement.clientHeight || 200, 550);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Inicialización de partículas de estrellas fijas con efecto parallax
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600),
      radius: Math.random() * 1.5,
      alpha: Math.random(),
      speed: 0.01 + Math.random() * 0.02
    }));

    // Seguir el mouse para un gradiente interactivo
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
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar la nebulosa interactiva de fondo
      const nebula = ctx.createRadialGradient(
        mouseX, mouseY, 50,
        mouseX, mouseY, Math.max(canvas.width, canvas.height) * 0.7
      );
      nebula.addColorStop(0, 'rgba(0, 243, 255, 0.08)');
      nebula.addColorStop(0.3, 'rgba(124, 58, 237, 0.04)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujo del Twinkle Effect de estrellas
      stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;
        ctx.globalAlpha = Math.abs(star.alpha);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
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
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 0, display: 'block', width: '100%', height: '100%' }}
    />
  );
}
