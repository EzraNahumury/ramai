import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import cuts from "../cuts.json";
import { Backdrop, EASE_POP, prog } from "../lib/anim";
import { Icon, IconBadge, IconName } from "../lib/icons";
import { colors, display, mono, sans } from "../lib/theme";

type CutName = keyof typeof cuts;
type Zoom = { s: number; x: number; y: number }; // scale + focus point in % of the frame

export type Beat = {
  cuts: CutName[];
  icon: IconName;
  label: string;
  zoom?: Zoom;
  url?: string;
  role?: Role;
  /** Shows the reputation counter ticking 0 → 1 over the footage. */
  star?: boolean;
};

export type Role = "Organizer" | "Participant" | "Anyone";

export type WalkthroughProps = {
  title: string;
  url: string;
  role: Role;
  beats: Beat[];
};

const LEAD = 0; // footage starts with the scene, so the frame never slides in empty
const TAIL = 8;
const NO_ZOOM: Zoom = { s: 1, x: 50, y: 50 };

const ROLE_ICON: Record<Role, IconName> = {
  Organizer: "host",
  Participant: "user",
  Anyone: "search",
};

const beatFrames = (b: Beat) => b.cuts.reduce((n, c) => n + cuts[c], 0);

export const walkthroughDuration = (p: WalkthroughProps) =>
  LEAD + p.beats.reduce((n, b) => n + beatFrames(b), 0) + TAIL;

const FRAME_W = 1280;
const FRAME_H = 720;
const BAR_H = 54;

export const Walkthrough: React.FC<WalkthroughProps> = ({ title, url, role, beats }) => {
  const frame = useCurrentFrame();
  const total = walkthroughDuration({ title, url, role, beats });

  // Where each beat starts on the scene's own clock.
  const starts: number[] = [];
  beats.reduce((at, b) => {
    starts.push(at);
    return at + beatFrames(b);
  }, LEAD);

  // Every piece of footage, back to back, with the frame it starts on.
  const clips: { name: CutName; from: number }[] = [];
  let cursor = LEAD;
  for (const b of beats) {
    for (const name of b.cuts) {
      clips.push({ name, from: cursor });
      cursor += cuts[name];
    }
  }

  let current = 0;
  for (let i = 0; i < beats.length; i++) if (frame >= starts[i]) current = i;

  // Camera: ease from the previous beat's framing to this beat's.
  const zoomOf = (i: number) => beats[i]?.zoom ?? NO_ZOOM;
  const from = current === 0 ? NO_ZOOM : zoomOf(current - 1);
  const to = zoomOf(current);
  const zt = prog(frame, starts[current] + 4, 26);
  const z = {
    s: from.s + (to.s - from.s) * zt,
    x: from.x + (to.x - from.x) * zt,
    y: from.y + (to.y - from.y) * zt,
  };

  const enter = prog(frame, 0, 26);
  const exit = interpolate(frame, [total - 10, total], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const activeUrl = beats[current].url ?? url;
  const activeRole = beats[current].role ?? role;

  const starBeat = beats.findIndex((b) => b.star);
  const starAt = starBeat >= 0 ? starts[starBeat] + 26 : -1;

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      <Backdrop />

      {/* Left rail: who is acting, what this step proves, and the beats as they happen. */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 150,
          width: 420,
          opacity: enter,
          transform: `translateX(${(1 - enter) * -30}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 20px 8px 8px",
            borderRadius: 999,
            backgroundColor: colors.surface,
            border: `2px solid ${colors.line}`,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 26,
            color: colors.ink,
          }}
        >
          <IconBadge name={ROLE_ICON[activeRole]} size={44} bg={colors.ink} color="#fff" />
          {activeRole}
        </div>

        <div
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 62,
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            color: colors.ink,
            marginTop: 30,
          }}
        >
          {title}
        </div>

        <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 20 }}>
          {beats.map((b, i) => {
            const on = prog(frame, starts[i], 16, EASE_POP);
            const done = i < current;
            const active = i === current;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: 0.38 + 0.62 * Math.min(1, on),
                }}
              >
                <IconBadge
                  name={b.icon}
                  size={56}
                  bg={active ? colors.accent : done ? colors.accentSoft : colors.surface}
                  color={active ? "#fff" : done ? colors.accent : colors.muted}
                  border={active || done ? undefined : colors.line}
                  style={{ transform: `scale(${active ? 0.9 + 0.1 * on : 1})` }}
                />
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: active ? 600 : 500,
                    fontSize: 28,
                    lineHeight: 1.25,
                    color: active ? colors.ink : colors.muted,
                  }}
                >
                  {b.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Browser frame holding the real screen recording. */}
      <div
        style={{
          position: "absolute",
          left: 560,
          top: (1080 - (FRAME_H + BAR_H)) / 2,
          width: FRAME_W,
          height: FRAME_H + BAR_H,
          borderRadius: 22,
          overflow: "hidden",
          backgroundColor: colors.surface,
          border: `2px solid ${colors.line}`,
          boxShadow: "0 40px 100px rgba(20,22,28,0.14)",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 60}px)`,
        }}
      >
        <div
          style={{
            height: BAR_H,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 22px",
            backgroundColor: colors.surface2,
            borderBottom: `2px solid ${colors.line}`,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: "#d5dae3" }}
            />
          ))}
          <div
            style={{
              marginLeft: 18,
              display: "flex",
              alignItems: "center",
              gap: 10,
              height: 34,
              padding: "0 16px",
              borderRadius: 999,
              backgroundColor: colors.surface,
              border: `2px solid ${colors.line}`,
              fontFamily: mono,
              fontSize: 19,
              color: colors.muted,
            }}
          >
            <Icon name="lock" size={16} color={colors.muted} />
            {activeUrl}
          </div>
        </div>

        <div style={{ position: "relative", width: FRAME_W, height: FRAME_H, overflow: "hidden" }}>
          <div
            style={{
              width: FRAME_W,
              height: FRAME_H,
              transform: `scale(${z.s})`,
              transformOrigin: `${z.x}% ${z.y}%`,
            }}
          >
            {clips.map((c) => (
              <Sequence key={c.name} from={c.from} durationInFrames={cuts[c.name]} layout="none">
                <OffthreadVideo
                  src={staticFile(`cuts/${c.name}.mp4`)}
                  muted
                  style={{ position: "absolute", inset: 0, width: FRAME_W, height: FRAME_H }}
                />
              </Sequence>
            ))}
          </div>

          {starAt >= 0 && frame >= starAt - 4 && (
            <StarTick frame={frame} at={starAt} />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Reputation going from 0 to 1 — the payoff of the whole flow. */
const StarTick: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const p = prog(frame, at, 18, EASE_POP);
  const flipped = frame >= at + 34;
  const bump = prog(frame, at + 34, 14, EASE_POP);
  return (
    <div
      style={{
        position: "absolute",
        right: 34,
        top: 30,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 28px 14px 20px",
        borderRadius: 999,
        backgroundColor: "#fff7e8",
        border: `2px solid ${colors.gold}`,
        boxShadow: "0 16px 40px rgba(201,138,30,0.25)",
        color: colors.gold,
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 40,
        opacity: Math.min(1, p),
        transform: `scale(${0.7 + 0.3 * p + (flipped ? 0.08 * (1 - bump) : 0)})`,
        transformOrigin: "100% 0%",
      }}
    >
      <Icon name="star" size={40} color={colors.gold} strokeWidth={2.2} />
      <span style={{ minWidth: 26, textAlign: "center" }}>{flipped ? 1 : 0}</span>
      <span style={{ fontSize: 26, fontWeight: 500, color: colors.muted }}>reputation</span>
    </div>
  );
};
