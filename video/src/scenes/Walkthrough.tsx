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
import { Backdrop, EASE_IN, EASE_IO, EASE_POP, Headline, prog } from "../lib/anim";
import { Icon, IconBadge, IconName } from "../lib/icons";
import { colors, mono, sans } from "../lib/theme";

type CutName = keyof typeof cuts;
type Zoom = { s: number; x: number; y: number }; // scale + focus point in % of the frame

export type Beat = {
  cuts: CutName[];
  icon: IconName;
  /** Two or three words, shown on a chip beside the window. */
  label: string;
  zoom?: Zoom;
  url?: string;
  role?: Role;
  /** Shows the reputation counter ticking 0 → 1 over the footage. */
  star?: boolean;
};

export type Role = "Organizer" | "Participant" | "Anyone";

export type WalkthroughProps = {
  /** Headline shown beside the window as the scene opens: plain line, accent line. */
  title: [string, string];
  url: string;
  role: Role;
  beats: Beat[];
};

const LEAD = 0; // footage starts with the scene, so the frame never slides in empty
const TAIL = 8;
const INTRO = 50; // frames the window sits to one side while the headline is up
const NO_ZOOM: Zoom = { s: 1, x: 50, y: 50 };

const ROLE_ICON: Record<Role, IconName> = {
  Organizer: "host",
  Participant: "user",
  Anyone: "search",
};

const beatFrames = (b: Beat) => b.cuts.reduce((n, c) => n + cuts[c], 0);

export const walkthroughDuration = (p: WalkthroughProps) =>
  LEAD + p.beats.reduce((n, b) => n + beatFrames(b), 0) + TAIL;

const FRAME_W = 1440;
const FRAME_H = 810;
const BAR_H = 54;
const WIN_H = FRAME_H + BAR_H;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// The window leans a few degrees, swapping side each beat.
const tiltOf = (i: number) => (i % 2 === 0 ? -3 : 3);

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
  const moveAt = current === 0 ? INTRO + 8 : starts[current] + 4;
  const zt = prog(frame, moveAt, 28, EASE_IO);
  const z = {
    s: lerp(from.s, to.s, zt),
    x: lerp(from.x, to.x, zt),
    y: lerp(from.y, to.y, zt),
  };

  const enter = prog(frame, 0, 26);
  const exit = interpolate(frame, [total - 10, total], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // The window starts small and turned away, then docks to the centre.
  const dock = prog(frame, INTRO, 32, EASE_IO);
  const beatTilt = lerp(current === 0 ? tiltOf(0) : tiltOf(current - 1), tiltOf(current), zt);
  const ry = lerp(-17, beatTilt + Math.sin(frame / 48) * 0.5, dock);
  const rx = lerp(5, 1.2, dock);

  const activeUrl = beats[current].url ?? url;
  const activeRole = beats[current].role ?? role;

  const starBeat = beats.findIndex((b) => b.star);
  const starAt = starBeat >= 0 ? starts[starBeat] + 26 : -1;

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      <Backdrop />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          paddingLeft: 120,
          opacity: 1 - prog(frame, INTRO - 8, 12, EASE_IN),
          transform: `translateX(${prog(frame, INTRO - 8, 12, EASE_IN) * -40}px)`,
        }}
      >
        <Headline a={title[0]} b={title[1]} start={4} size={84} />
      </AbsoluteFill>

      <AbsoluteFill style={{ perspective: 2600 }}>
        <div
          style={{
            position: "absolute",
            left: (1920 - FRAME_W) / 2,
            top: 56,
            width: FRAME_W,
            height: WIN_H,
            transformStyle: "preserve-3d",
            opacity: enter,
            transform: `translate(${(1 - dock) * 350}px, ${(1 - dock) * 30 + (1 - enter) * 60}px) scale(${lerp(0.6, 1, dock)}) rotateX(${rx}deg) rotateY(${ry}deg)`,
          }}
        >
          {/* Browser frame holding the real screen recording. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              overflow: "hidden",
              backgroundColor: colors.surface,
              border: `2px solid ${colors.line}`,
              boxShadow: "0 50px 120px rgba(20,22,28,0.16)",
            }}
          >
            <div
              style={{
                height: BAR_H,
                boxSizing: "border-box",
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
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 21,
                  color: colors.ink,
                }}
              >
                <IconBadge name={ROLE_ICON[activeRole]} size={34} bg={colors.ink} color="#fff" />
                {activeRole}
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

              {starAt >= 0 && frame >= starAt - 4 && <StarTick frame={frame} at={starAt} />}
            </div>
          </div>

          {/* One chip per beat, floating off the edge furthest from where the camera looks. */}
          {beats.map((b, i) => {
            const inAt = i === 0 ? INTRO + 24 : starts[i] + 8;
            const outAt = i === beats.length - 1 ? total - 8 : starts[i + 1] - 4;
            if (frame < inAt || frame > outAt + 8) return null;
            const pop = prog(frame, inAt, 16, EASE_POP);
            const leave = prog(frame, outAt, 8, EASE_IN);
            const focus = b.zoom ?? NO_ZOOM;
            // The star counter owns the top-right corner on its beat.
            const onLeft = focus.x >= 58 || !!b.star;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: focus.y > 55 ? 130 : 620,
                  left: onLeft ? -150 : undefined,
                  right: onLeft ? undefined : -150,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 30px 12px 12px",
                  borderRadius: 999,
                  backgroundColor: colors.surface,
                  border: `2px solid ${colors.line}`,
                  boxShadow: "0 24px 60px rgba(20,22,28,0.18)",
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 32,
                  color: colors.ink,
                  whiteSpace: "nowrap",
                  opacity: Math.min(1, pop) * (1 - leave),
                  transform: `translateZ(70px) scale(${0.7 + 0.3 * pop - 0.1 * leave})`,
                  transformOrigin: onLeft ? "0% 50%" : "100% 50%",
                }}
              >
                <IconBadge name={b.icon} size={60} bg={colors.accent} color="#fff" />
                {b.label}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
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
        right: 38,
        top: 34,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 30px 14px 22px",
        borderRadius: 999,
        backgroundColor: "#fff7e8",
        border: `2px solid ${colors.gold}`,
        boxShadow: "0 16px 40px rgba(201,138,30,0.25)",
        color: colors.gold,
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 48,
        opacity: Math.min(1, p),
        transform: `scale(${0.7 + 0.3 * p + (flipped ? 0.1 * (1 - bump) : 0)})`,
        transformOrigin: "100% 0%",
      }}
    >
      <Icon name="star" size={46} color={colors.gold} strokeWidth={2.2} />
      <span style={{ minWidth: 30, textAlign: "center" }}>{flipped ? 1 : 0}</span>
    </div>
  );
};
