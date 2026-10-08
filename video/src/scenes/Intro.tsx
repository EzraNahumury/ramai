import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Dot, EASE_POP, Words, prog } from "../lib/anim";
import { Icon, IconBadge, IconName } from "../lib/icons";
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
  icon: IconName;
  title: string;
  start: number;
  motif: (frame: number, start: number) => React.ReactNode;
};

const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 16, height: 96 };

// Each pillar is an icon, a tiny animation of the idea, and two or three words.
// The narration carries the explanation.
const PILLARS: Pillar[] = [
  {
    icon: "target",
    title: "AI matching",
    start: 152,
    // Five people; AI picks out the two who fit.
    motif: (frame, start) => (
      <div style={row}>
        {[0, 1, 2, 3, 4].map((i) => {
          const match = i === 1 || i === 3;
          const p = match ? prog(frame, start + 24 + i * 6, 14, EASE_POP) : 0;
          return <Dot key={i} size={64} fill={p} />;
        })}
      </div>
    ),
  },
  {
    icon: "coin",
    title: "Staked RSVP",
    start: 244,
    // Everyone who commits fills in, one after another.
    motif: (frame, start) => (
      <div style={row}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Dot key={i} size={64} fill={prog(frame, start + 22 + i * 6, 14, EASE_POP)} />
        ))}
      </div>
    ),
  },
  {
    icon: "star",
    title: "Reputation",
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
              gap: 16,
              padding: "12px 34px 12px 26px",
              borderRadius: 999,
              backgroundColor: "rgba(201,138,30,0.14)",
              color: colors.gold,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 58,
            }}
          >
            <Icon name="star" size={54} color={colors.gold} strokeWidth={2.2} />
            <span style={{ minWidth: 38, textAlign: "center" }}>{n}</span>
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
        paddingTop: 90,
      }}
    >
      {PILLARS.map((p, i) => {
        const enter = prog(frame, p.start, 28);
        // The newest card carries the accent until the next one arrives.
        const next = PILLARS[i + 1]?.start ?? 440;
        const active = prog(frame, p.start, 12) - prog(frame, next, 16);
        return (
          <div
            key={p.title}
            style={{
              width: 520,
              height: 470,
              boxSizing: "border-box",
              padding: "44px 40px",
              borderRadius: 36,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.surface,
              border: `2px solid ${active > 0.5 ? colors.accent : colors.line}`,
              boxShadow: `0 ${20 + active * 20}px ${60 + active * 30}px rgba(20,22,28,${0.05 + active * 0.05})`,
              opacity: enter,
              transform: `translateY(${(1 - enter) * 80 - active * 10}px)`,
            }}
          >
            <IconBadge
              name={p.icon}
              size={116}
              bg={active > 0.5 ? colors.accent : colors.accentSoft}
              color={active > 0.5 ? "#fff" : colors.accent}
              style={{ transform: `scale(${0.6 + 0.4 * prog(frame, p.start + 6, 18, EASE_POP)})` }}
            />
            {p.motif(frame, p.start)}
            <div
              style={{
                fontFamily: display,
                fontWeight: 600,
                fontSize: 56,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: colors.ink,
              }}
            >
              {p.title}
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
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 140 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: mono,
          fontSize: 24,
          letterSpacing: "0.06em",
          color: colors.muted,
          padding: "10px 22px 10px 16px",
          borderRadius: 999,
          border: `2px solid ${colors.line}`,
          backgroundColor: colors.surface,
          opacity: p,
          transform: `translateY(${(1 - p) * 24}px)`,
        }}
      >
        <Icon name="chain" size={24} color={colors.muted} />
        on BNB Smart Chain
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
