import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Dot, EASE_POP, Words, prog } from "../lib/anim";
import { colors, display, mono, sans } from "../lib/theme";

export const INTRO_DURATION = 450; // 15s

// Where the four logo dots start before they gather into the mark.
const SCATTER = [
  { x: -720, y: -330 },
  { x: 640, y: -380 },
  { x: -560, y: 360 },
  { x: 760, y: 300 },
];
const MARK = 46;
const GAP = 12;

/** The Ramai mark: a 2×2 cluster, solid on one diagonal and soft on the other. */
const Lockup: React.FC = () => {
  const frame = useCurrentFrame();
  const word = prog(frame, 30, 26);
  // After the tagline lands, the lockup shrinks into a header for the pillars.
  const dock = prog(frame, 118, 30);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        transform: `translateY(${dock * -378}px) scale(${1 - dock * 0.5})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${MARK}px ${MARK}px`,
            gap: GAP,
          }}
        >
          {SCATTER.map((from, i) => {
            const p = prog(frame, 2 + i * 4, 34);
            const solid = i === 0 || i === 3;
            return (
              <div
                key={i}
                style={{
                  width: MARK,
                  height: MARK,
                  borderRadius: "50%",
                  backgroundColor: colors.accent,
                  opacity: (solid ? 1 : 0.4) * Math.min(1, p * 1.6),
                  transform: `translate(${(1 - p) * from.x}px, ${(1 - p) * from.y}px) scale(${0.5 + p * 0.5})`,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 150,
            letterSpacing: "-0.035em",
            color: colors.ink,
            lineHeight: 1,
            opacity: word,
            transform: `translateX(${(1 - word) * -30}px)`,
          }}
        >
          Ramai
        </div>
      </div>
      <Words
        text="Fill the room with the right people."
        start={56}
        stagger={3}
        style={{
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 46,
          color: colors.muted,
          marginTop: 38,
          justifyContent: "center",
          opacity: 1 - dock,
        }}
      />
    </AbsoluteFill>
  );
};

type Pillar = {
  k: string;
  title: string;
  body: string;
  start: number;
  motif: (frame: number, start: number) => React.ReactNode;
};

const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, height: 56 };

const PILLARS: Pillar[] = [
  {
    k: "01",
    title: "AI finds the right people",
    body: "One sentence becomes a full event, matched to the people most likely to come — with the reason why.",
    start: 152,
    // Five people; AI picks out the two who fit.
    motif: (frame, start) => (
      <div style={row}>
        {[0, 1, 2, 3, 4].map((i) => {
          const match = i === 1 || i === 3;
          const p = match ? prog(frame, start + 24 + i * 6, 14, EASE_POP) : 0;
          return <Dot key={i} size={44} fill={p} />;
        })}
      </div>
    ),
  },
  {
    k: "02",
    title: "A stake makes RSVP real",
    body: "A small refundable deposit replaces the empty tap. Show up and it comes straight back.",
    start: 244,
    // Everyone who commits fills in, one after another.
    motif: (frame, start) => (
      <div style={row}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Dot key={i} size={44} fill={prog(frame, start + 22 + i * 6, 14, EASE_POP)} />
        ))}
      </div>
    ),
  },
  {
    k: "03",
    title: "Showing up counts",
    body: "Every verified check-in becomes on-chain reputation you own and carry to the next event.",
    start: 338,
    // Reputation ticks up with each check-in.
    motif: (frame, start) => {
      const n = Math.round(
        interpolate(frame, [start + 22, start + 62], [0, 5], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      );
      return (
        <div style={row}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 22px",
              borderRadius: 999,
              backgroundColor: "rgba(201,138,30,0.14)",
              color: colors.gold,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 34,
            }}
          >
            <span>★</span>
            <span style={{ minWidth: 22, textAlign: "center" }}>{n}</span>
          </div>
        </div>
      );
    },
  },
];

const Pillars: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 36,
        paddingTop: 110,
      }}
    >
      {PILLARS.map((p, i) => {
        const enter = prog(frame, p.start, 28);
        // The newest card carries the accent border until the next one arrives.
        const next = PILLARS[i + 1]?.start ?? 440;
        const active = prog(frame, p.start, 12) - prog(frame, next, 16);
        return (
          <div
            key={p.k}
            style={{
              width: 520,
              height: 500,
              boxSizing: "border-box",
              padding: "42px 44px",
              borderRadius: 32,
              backgroundColor: colors.surface,
              border: `2px solid ${active > 0.5 ? colors.accent : colors.line}`,
              boxShadow: `0 ${20 + active * 20}px ${60 + active * 30}px rgba(20,22,28,${0.05 + active * 0.05})`,
              opacity: enter,
              transform: `translateY(${(1 - enter) * 80 - active * 10}px)`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: mono, fontSize: 26, color: colors.accent }}>{p.k}</span>
              {p.motif(frame, p.start)}
            </div>
            <div
              style={{
                fontFamily: display,
                fontWeight: 600,
                fontSize: 54,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: colors.ink,
                marginTop: 44,
              }}
            >
              {p.title}
            </div>
            <div
              style={{
                fontFamily: sans,
                fontSize: 27,
                lineHeight: 1.45,
                color: colors.muted,
                marginTop: 22,
              }}
            >
              {p.body}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Footer: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 404, 24);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: p,
          transform: `translateY(${(1 - p) * 24}px)`,
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 24,
            letterSpacing: "0.06em",
            color: colors.muted,
            padding: "10px 20px",
            borderRadius: 999,
            border: `2px solid ${colors.line}`,
            backgroundColor: colors.surface,
          }}
        >
          on BNB Smart Chain
        </span>
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 34, color: colors.ink }}>
          Here’s how it works →
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const Intro: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Lockup />
    <Pillars />
    <Footer />
  </AbsoluteFill>
);
