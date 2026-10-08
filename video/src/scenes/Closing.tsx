import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop, EASE_IN, EASE_POP, Words, prog } from "../lib/anim";
import { Icon, IconBadge, IconName } from "../lib/icons";
import { colors, display, mono, sans } from "../lib/theme";

export const CLOSING_DURATION = 450; // 15s

const LOOP: { icon: IconName; label: string }[] = [
  { icon: "target", label: "Match" },
  { icon: "coin", label: "Stake" },
  { icon: "scan", label: "Check in" },
  { icon: "refund", label: "Refund" },
  { icon: "star", label: "Reputation" },
];
const REVEAL = 20; // first node appears
const SPIN = 70; // the highlight starts travelling
const STEP = 13; // frames it rests on each node
const RADIUS = 300;
const NODE = 124;
const CX = 960;
const CY = 470;
const CIRC = 2 * Math.PI * RADIUS;

const at = (i: number) => {
  const a = ((-90 + i * 72) * Math.PI) / 180;
  return { x: CX + RADIUS * Math.cos(a), y: CY + RADIUS * Math.sin(a) };
};

/** 0–7s: the loop that compounds. 7–15s: lockup and where to find it. */
export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const loopOut = prog(frame, 196, 22, EASE_IN);
  const lockIn = prog(frame, 214, 30);

  // The highlight walks round the ring; every full lap adds one to the counter.
  const walked = Math.max(0, frame - SPIN) / STEP;
  const hot = frame < SPIN ? -1 : Math.floor(walked) % LOOP.length;
  const laps = Math.floor((walked + 1) / LOOP.length);
  const lapAt = SPIN + (laps * LOOP.length - 1) * STEP;
  const bump = laps > 0 ? prog(frame, lapAt, 12, EASE_POP) : 1;
  const ring = prog(frame, REVEAL, 50);

  return (
    <AbsoluteFill>
      <Backdrop />

      {/* The loop */}
      <AbsoluteFill
        style={{
          opacity: 1 - loopOut,
          transform: `scale(${1 - loopOut * 0.25})`,
          transformOrigin: `${CX}px ${CY}px`,
        }}
      >
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            fill="none"
            stroke={colors.line}
            strokeWidth={4}
            strokeDasharray={`${CIRC * ring} ${CIRC}`}
            transform={`rotate(-90 ${CX} ${CY})`}
          />
          {frame >= SPIN && (
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke={colors.accent}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={`${CIRC / 5} ${CIRC}`}
              transform={`rotate(${-90 + (walked - 1) * 72} ${CX} ${CY})`}
            />
          )}
        </svg>

        {/* Reputation grows with every lap. */}
        <div
          style={{
            position: "absolute",
            left: CX - 150,
            top: CY - 70,
            width: 300,
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            color: colors.gold,
            fontFamily: display,
            fontWeight: 600,
            fontSize: 120,
            lineHeight: 1,
            opacity: prog(frame, SPIN - 14, 16),
            transform: `scale(${0.86 + 0.14 * bump})`,
          }}
        >
          <Icon name="star" size={92} color={colors.gold} strokeWidth={2} />
          {1 + laps}
        </div>

        {LOOP.map((n, i) => {
          const p = prog(frame, REVEAL + i * 9, 16, EASE_POP);
          const on = hot === i;
          const pos = at(i);
          return (
            <div
              key={n.label}
              style={{
                position: "absolute",
                left: pos.x - 150,
                top: pos.y - NODE / 2,
                width: 300,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: Math.min(1, p),
                transform: `scale(${0.7 + 0.3 * p})`,
              }}
            >
              <IconBadge
                name={n.icon}
                size={NODE}
                bg={on ? colors.accent : colors.surface}
                color={on ? "#fff" : colors.accent}
                border={on ? undefined : colors.line}
                style={{
                  boxShadow: on
                    ? "0 22px 50px rgba(255,90,36,0.3)"
                    : "0 14px 40px rgba(20,22,28,0.07)",
                  transform: `scale(${on ? 1.1 : 1})`,
                }}
              />
              <span
                style={{
                  padding: "2px 14px",
                  borderRadius: 999,
                  backgroundColor: colors.bg,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 30,
                  color: on ? colors.ink : colors.muted,
                }}
              >
                {n.label}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Lockup */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 40,
          opacity: lockIn,
          transform: `scale(${0.96 + 0.04 * lockIn})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ display: "grid", gridTemplateColumns: "44px 44px", gap: 12 }}>
            {[1, 0.4, 0.4, 1].map((o, i) => (
              <div
                key={i}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: colors.accent,
                  opacity: o,
                  transform: `scale(${prog(frame, 216 + i * 5, 16, EASE_POP)})`,
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontFamily: display,
              fontWeight: 600,
              fontSize: 150,
              letterSpacing: "-0.035em",
              lineHeight: 1,
              color: colors.ink,
            }}
          >
            Ramai
          </div>
        </div>

        <Words
          text="Events that fill up, with people who show up."
          start={246}
          stagger={3}
          style={{
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 44,
            color: colors.muted,
            marginTop: 34,
            justifyContent: "center",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 18,
            marginTop: 64,
            opacity: prog(frame, 286, 22),
            transform: `translateY(${(1 - prog(frame, 286, 22)) * 20}px)`,
          }}
        >
          <Chip icon="chain" text="BNB Smart Chain testnet" />
          <Chip icon="doc" text="github.com/EzraNahumury/ramai" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ icon: IconName; text: string }> = ({ icon, text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "10px 26px 10px 10px",
      borderRadius: 999,
      backgroundColor: colors.surface,
      border: `2px solid ${colors.line}`,
      fontFamily: mono,
      fontSize: 25,
      color: colors.ink,
    }}
  >
    <IconBadge name={icon} size={48} bg={colors.accentSoft} color={colors.accent} />
    {text}
  </div>
);
