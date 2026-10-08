import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, display } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.in(Easing.cubic);
export const EASE_POP = Easing.bezier(0.34, 1.56, 0.64, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 progress starting at `start`, lasting `duration` frames. */
export const prog = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE_OUT,
) => interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });

/** 1 while visible: eases in at `inAt`, eases out before `outAt`. */
export const presence = (frame: number, inAt: number, outAt: number, fade = 15) =>
  prog(frame, inAt, fade) - prog(frame, outAt - fade, fade, EASE_IN);

/** Faint grid-paper backdrop that fades toward the edges. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.15) % 64;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${colors.line} 1.5px, transparent 1.5px), linear-gradient(90deg, ${colors.line} 1.5px, transparent 1.5px)`,
          backgroundSize: "64px 64px",
          backgroundPosition: `${drift}px ${drift}px`,
          maskImage:
            "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(0,0,0,0.9), transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(0,0,0,0.9), transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Words rise in one after another. Words listed in `accent` take the accent colour. */
export const Words: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  accent?: string[];
  /** Colours the whole line with the accent. */
  allAccent?: boolean;
  style?: React.CSSProperties;
}> = ({ text, start, stagger = 4, accent = [], allAccent = false, style }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0 0.26em", ...style }}>
      {words.map((w, i) => {
        const p = prog(frame, start + i * stagger, 22);
        const isAccent = allAccent || accent.indexOf(w.replace(/[.,!?]/g, "")) >= 0;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * 46}px)`,
              color: isAccent ? colors.accent : undefined,
              fontStyle: isAccent ? "italic" : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** The film's headline: a plain line, then a second line in the accent. A few words each. */
export const Headline: React.FC<{
  a: string;
  b: string;
  start: number;
  /** Frame the second line starts on; defaults to just after the first. */
  startB?: number;
  size?: number;
  center?: boolean;
  style?: React.CSSProperties;
}> = ({ a, b, start, startB, size = 88, center = false, style }) => {
  const line: React.CSSProperties = {
    fontFamily: display,
    fontWeight: 600,
    fontSize: size,
    lineHeight: 1.08,
    letterSpacing: "-0.03em",
    color: colors.ink,
    justifyContent: center ? "center" : undefined,
  };
  return (
    <div style={style}>
      <Words text={a} start={start} style={line} />
      <Words text={b} start={startB ?? start + 10} allAccent style={{ ...line, marginTop: size * 0.08 }} />
    </div>
  );
};

/** A single "person" dot: hollow when absent, filled when present. */
export const Dot: React.FC<{
  size: number;
  fill: number; // 0 hollow → 1 filled
  color?: string;
  style?: React.CSSProperties;
}> = ({ size, fill, color = colors.accent, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `${Math.max(2, size * 0.08)}px solid ${fill > 0.5 ? color : "#cfd5e0"}`,
      boxSizing: "border-box",
      background: `radial-gradient(circle, ${color} ${fill * 72}%, transparent ${fill * 72 + 1}%)`,
      transform: `scale(${0.86 + fill * 0.14})`,
      ...style,
    }}
  />
);
