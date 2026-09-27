"use client";

import { useEffect, useRef } from "react";

/**
 * Animated node network: square "people" nodes drift, link to nearby nodes
 * (a crowd forming — "ramai"), pulses travel along links, and pixel-gradient
 * blocks float behind. Canvas-based for smooth continuous motion.
 */
export function NetworkHero() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const col = (n: string, fb: string) => css.getPropertyValue(n).trim() || fb;
    const INK = col("--ink", "#14161c");
    const BLUE = col("--net-blue", "#3b5bdb");
    const NETINK = col("--net-ink", "#1d2a5b");
    const ACCENT = col("--accent", "#ff5a24");
    const RED = col("--net-red", "#d6455f");
    const SURFACE = col("--surface", "#ffffff");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    type Node = { x: number; y: number; vx: number; vy: number; s: number; warm: boolean; hl: boolean };
    type Big = { x: number; y: number; s: number; c: string; vx: number; vy: number; a: number };
    type Pulse = { a: number; b: number; t: number; speed: number };

    let nodes: Node[] = [];
    let bigs: Big[] = [];
    let pulses: Pulse[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    function init() {
      const rect = canvas!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.max(1, Math.floor(W * dpr));
      canvas!.height = Math.max(1, Math.floor(H * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.round((W * H) / 26000);
      const N = Math.max(18, Math.min(46, density));
      nodes = Array.from({ length: N }, (_, i) => ({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.35, 0.35),
        vy: rand(-0.35, 0.35),
        s: rand(4, 9),
        warm: Math.random() < 0.28,
        hl: i === 2,
      }));

      const bigCols = [BLUE, NETINK, ACCENT, RED];
      bigs = Array.from({ length: 14 }, () => ({
        x: rand(0, W),
        y: rand(0, H),
        s: rand(22, 58),
        c: bigCols[Math.floor(Math.random() * bigCols.length)],
        vx: rand(-0.08, 0.08),
        vy: rand(-0.08, 0.08),
        a: rand(0.05, 0.16),
      }));

      pulses = Array.from({ length: 5 }, () => ({
        a: Math.floor(Math.random() * N),
        b: Math.floor(Math.random() * N),
        t: Math.random(),
        speed: rand(0.003, 0.007),
      }));
    }

    function hexA(hex: string, a: number) {
      const h = hex.replace("#", "");
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${a})`;
    }

    const TH = 150;
    let raf = 0;
    let t = 0;

    function frame() {
      t += 1;
      ctx!.clearRect(0, 0, W, H);

      // floating gradient blocks
      for (const b of bigs) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -60) b.x = W + 60;
        if (b.x > W + 60) b.x = -60;
        if (b.y < -60) b.y = H + 60;
        if (b.y > H + 60) b.y = -60;
        ctx!.fillStyle = hexA(b.c, b.a);
        ctx!.fillRect(b.x, b.y, b.s, b.s);
      }

      // move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // links between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < TH) {
            ctx!.strokeStyle = hexA(INK, 0.18 * (1 - d / TH));
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();
          }
        }
      }

      // traveling pulses along links
      for (const p of pulses) {
        p.t += p.speed;
        if (p.t >= 1) {
          p.t = 0;
          p.a = p.b;
          p.b = Math.floor(Math.random() * nodes.length);
        }
        const A = nodes[p.a];
        const B = nodes[p.b];
        if (!A || !B) continue;
        const px = A.x + (B.x - A.x) * p.t;
        const py = A.y + (B.y - A.y) * p.t;
        ctx!.fillStyle = hexA(ACCENT, 0.9);
        ctx!.fillRect(px - 2, py - 2, 4, 4);
      }

      // nodes (squares)
      for (const n of nodes) {
        const size = n.hl ? n.s + 3 + Math.sin(t / 30) * 1.5 : n.s;
        const color = n.warm ? ACCENT : BLUE;
        if (n.hl) {
          ctx!.fillStyle = hexA(ACCENT, 0.95);
          ctx!.fillRect(n.x - size / 2, n.y - size / 2, size, size);
        } else {
          ctx!.fillStyle = SURFACE;
          ctx!.fillRect(n.x - size / 2, n.y - size / 2, size, size);
          ctx!.strokeStyle = hexA(color, 0.8);
          ctx!.lineWidth = 1.4;
          ctx!.strokeRect(n.x - size / 2, n.y - size / 2, size, size);
        }
      }

      raf = requestAnimationFrame(frame);
    }

    init();
    if (reduce) {
      frame(); // single static frame
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => init();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    />
  );
}
