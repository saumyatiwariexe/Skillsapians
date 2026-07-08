"use client";

import { useEffect, useRef } from "react";

export default function DotMatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const gutter = isMobile ? 16 : 12;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    const dotColor = "124, 108, 246";
    const angle = Math.PI / 4;

    function render() {
      if (!canvas || !ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const gridSizeX = Math.floor(w / gutter);
      const gridSizeY = Math.floor(h / gutter);
      const gridCells = gridSizeX * gridSizeY;
      const centerX = w / 2;
      const centerY = h / 2;
      const maxDist = Math.max(centerX, centerY);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      const processedDots: Array<{
        finalX: number;
        finalY: number;
        opacity: number;
      }> = [];

      for (let i = 0; i < gridCells; i++) {
        const col = i % gridSizeX;
        const row = Math.floor(i / gridSizeX);
        const x = col * gutter;
        const y = row * gutter;

        const dx = x - mouseX;
        const dy = y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const distFactor = dist / maxDist;
          const rotationFactor = (1 - distFactor) * Math.PI * 2;

          const rotatedX =
            x * Math.cos(rotationFactor * angle) -
            y * Math.sin(rotationFactor * angle);
          const rotatedY =
            x * Math.sin(rotationFactor * angle) +
            y * Math.cos(rotationFactor * angle);

          const finalX = x + (rotatedX - x) * distFactor;
          const finalY = y + (rotatedY - y) * distFactor;
          const scale = 1 + (1 - distFactor) * 0.5;
          const radius = 1.2 * scale;
          const opacity = (1 - distFactor) * 0.8;

          for (let j = 0; j < processedDots.length; j++) {
            const other = processedDots[j];
            const cdx = finalX - other.finalX;
            const cdy = finalY - other.finalY;
            const cDist = Math.sqrt(cdx * cdx + cdy * cdy);

            if (cDist < maxDist * 0.15) {
              ctx.beginPath();
              ctx.moveTo(finalX, finalY);
              ctx.lineTo(other.finalX, other.finalY);
              ctx.lineWidth = 0.5;
              ctx.strokeStyle = `rgba(${dotColor}, ${Math.min(opacity, other.opacity) * 0.3})`;
              ctx.stroke();
            }
          }

          ctx.beginPath();
          ctx.arc(finalX, finalY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dotColor}, ${opacity})`;
          ctx.fill();

          processedDots.push({ finalX, finalY, opacity });
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
