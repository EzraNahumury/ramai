/**
 * Signature hero art: a pixel-gradient field with a connected node graph.
 * The graph reads as people/events linking up — "ramai" (a crowd) forming —
 * so the art is about the product, not decoration. CSS-animated, subtle.
 */

type Block = { x: number; y: number; s: number; fill: string; o: number };
type Node = { x: number; y: number; hl?: boolean };

// left + right + bottom pixel clusters (hand-tuned for balance)
const blocks: Block[] = [
  // left cluster (cool)
  { x: 90, y: 150, s: 40, fill: "url(#gCool)", o: 0.5 },
  { x: 134, y: 120, s: 24, fill: "url(#gCool)", o: 0.35 },
  { x: 140, y: 196, s: 30, fill: "url(#gCool)", o: 0.65 },
  { x: 96, y: 210, s: 18, fill: "var(--net-blue)", o: 0.5 },
  { x: 180, y: 250, s: 22, fill: "url(#gCool)", o: 0.45 },
  { x: 120, y: 300, s: 34, fill: "url(#gCool)", o: 0.3 },
  { x: 210, y: 180, s: 14, fill: "var(--net-ink)", o: 0.4 },
  // right cluster (cool → ink)
  { x: 1030, y: 120, s: 44, fill: "url(#gCool)", o: 0.5 },
  { x: 1088, y: 160, s: 26, fill: "url(#gCool)", o: 0.4 },
  { x: 1030, y: 190, s: 20, fill: "var(--net-blue)", o: 0.5 },
  { x: 1100, y: 230, s: 34, fill: "url(#gCool)", o: 0.55 },
  { x: 1060, y: 270, s: 16, fill: "var(--net-ink)", o: 0.45 },
  { x: 1020, y: 300, s: 24, fill: "url(#gCool)", o: 0.3 },
  // bottom-center cluster (warm → red)
  { x: 470, y: 560, s: 40, fill: "url(#gWarm)", o: 0.5 },
  { x: 520, y: 590, s: 26, fill: "url(#gWarm)", o: 0.6 },
  { x: 560, y: 556, s: 20, fill: "var(--net-red)", o: 0.55 },
  { x: 600, y: 588, s: 30, fill: "url(#gWarm)", o: 0.4 },
  { x: 660, y: 566, s: 22, fill: "url(#gWarm)", o: 0.5 },
  { x: 700, y: 596, s: 16, fill: "var(--accent)", o: 0.5 },
  { x: 430, y: 592, s: 18, fill: "url(#gWarm)", o: 0.35 },
];

const nodes: Node[] = [
  { x: 250, y: 430 },
  { x: 332, y: 470, hl: true },
  { x: 432, y: 502 },
  { x: 560, y: 470 },
  { x: 662, y: 512 },
  { x: 772, y: 462 },
  { x: 882, y: 500 },
  { x: 980, y: 440 },
  { x: 1052, y: 360 },
  { x: 180, y: 180 },
  { x: 1030, y: 150 },
];

const edges: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [9, 0], [3, 1], [10, 8], [6, 8],
];

export function NetworkHero() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    >
      <defs>
        <linearGradient id="gCool" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--net-blue)" />
          <stop offset="100%" stopColor="var(--net-ink)" />
        </linearGradient>
        <linearGradient id="gWarm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--net-red)" />
        </linearGradient>
      </defs>

      {/* pixel field */}
      <g className="float-slow">
        {blocks.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.s} height={b.s} fill={b.fill} opacity={b.o} />
        ))}
      </g>

      {/* connectors */}
      <g stroke="var(--ink)" strokeOpacity="0.25" strokeWidth="1">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
        ))}
      </g>

      {/* nodes */}
      <g>
        {nodes.map((n, i) => (
          <rect
            key={i}
            x={n.x - 6}
            y={n.y - 6}
            width={12}
            height={12}
            fill={n.hl ? "var(--accent)" : "var(--surface)"}
            stroke={n.hl ? "var(--accent)" : "var(--ink)"}
            strokeWidth={1.5}
            className={i % 3 === 0 ? "node-pulse" : undefined}
            style={{ animationDelay: `${(i % 5) * 0.4}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
