"use client";

import { useEffect, useRef, useState, useMemo } from "react";

const BLOCK_SIZE = 24;
const COVER_COLOR = "#ffffff";

type Cell = {
  covered: boolean;
  revealAt: number;
};

interface MinecraftTerrainCanvasProps {
  stage: "idle" | "analyzing" | "generating" | "complete";
  progress?: number;
}

export default function MinecraftTerrainCanvas({ stage, progress = 0 }: MinecraftTerrainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  const { cols, rows, cells, totalCells } = useMemo(() => {
    const canvas = canvasRef.current;
    const rect = canvas ? canvas.getBoundingClientRect() : { width: 400, height: 280 };
    const c = Math.max(1, Math.floor(rect.width / BLOCK_SIZE));
    const r = Math.max(1, Math.floor(rect.height / BLOCK_SIZE));
    const grid: Cell[][] = [];
    const flat: Cell[] = [];

    for (let y = 0; y < r; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < c; x++) {
        const cell: Cell = { covered: false, revealAt: 0 };
        row.push(cell);
        flat.push(cell);
      }
      grid.push(row);
    }

    const indices = flat.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    indices.forEach((cellIndex, order) => {
      flat[cellIndex].revealAt = order;
    });

    return {
      cols: c,
      rows: r,
      cells: grid,
      totalCells: c * r,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const c = cols;
    const r = rows;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, rect.width, rect.height);

      const revealRatio = stage === "complete" ? 1 : Math.min(progress, 1);
      const targetCount = Math.floor(totalCells * revealRatio);
      const currentFrame = frameRef.current;

      for (let y = 0; y < r; y++) {
        for (let x = 0; x < c; x++) {
          const cell = cells[y][x];
          const order = cell.revealAt;
          const shouldReveal = order < targetCount;

          if (!shouldReveal) continue;

          const revealProgress = Math.min(1, (currentFrame - order * 0.5) / 12);
          if (revealProgress <= 0) continue;

          const px = x * BLOCK_SIZE;
          const py = y * BLOCK_SIZE;

          ctx.globalAlpha = revealProgress;
          ctx.fillStyle = COVER_COLOR;
          ctx.fillRect(px, py, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

          if (revealProgress > 0.8) {
            ctx.fillStyle = "rgba(0,0,0,0.12)";
            ctx.fillRect(px, py + BLOCK_SIZE - 3, BLOCK_SIZE - 1, 2);
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.fillRect(px, py, BLOCK_SIZE - 1, 2);
          }
        }
      }

      ctx.globalAlpha = 1;
      frameRef.current++;

      if (stage !== "complete") {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    frameRef.current = 0;
    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [stage, progress, cols, rows, totalCells, cells]);

  const statusText = useMemo(() => {
    if (stage === "analyzing") return "Analyzing repo structure...";
    if (stage === "generating") return "Generating questions...";
    if (stage === "complete") return "Terrain ready";
    return "Preparing...";
  }, [stage]);

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-md overflow-hidden border border-subtle bg-canvas">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute top-3 right-3 font-mono text-[11px] text-text-tertiary bg-canvas/80 px-2 py-1 rounded border border-subtle">
        {statusText}
      </div>
      <div className="absolute bottom-3 left-3 right-3 h-1 bg-surface-alt/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-purple transition-all duration-500 ease-out rounded-full"
          style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
        />
      </div>
      {stage === "complete" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="font-mono text-sm text-accent-green">Terrain ready</span>
        </div>
      )}
    </div>
  );
}
