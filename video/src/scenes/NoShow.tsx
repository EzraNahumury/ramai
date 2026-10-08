import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop, EASE_POP, Words, presence, prog } from "../lib/anim";
import { Icon, IconBadge, IconName } from "../lib/icons";
import { colors, display, mono, sans } from "../lib/theme";

export const NOSHOW_DURATION = 270; // 9s

// The rule the contract enforces, drawn as two lanes. This scene explains the
// mechanism; it is a diagram, not a recording of a forfeited stake.
const Lane: React.FC<{
  start: number;
  tone: "good" | "bad";
  who: IconName;
  title: string;
  steps: { icon: IconName; text: string }[];
  result: string;
}> = ({ start, tone, who, title, steps, result }) => {
  const frame = useCurrentFrame();
  const enter = prog(frame, start, 26);
  const c = tone === "good" ? colors.success : colors.accent;
  const soft = tone === "good" ? "#e4f6ee" : colors.accentSoft;
  const coin = prog(frame, start + 58, 34);
  return (
    <div
      style={{
        width: 800,
        boxSizing: "border-box",
        padding: "40px 44px 44px",
        borderRadius: 32,
        backgroundColor: colors.surface,
        border: `2px solid ${colors.line}`,
        boxShadow: "0 24px 70px rgba(20,22,28,0.07)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 60}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <IconBadge name={who} size={76} bg={soft} color={c} />
        <span
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 54,
            letterSpacing: "-0.02em",
            color: colors.ink,
          }}
        >
          {title}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 38 }}>
        {steps.map((s, i) => {
          const p = prog(frame, start + 22 + i * 16, 16, EASE_POP);
          return (
            <React.Fragment key={s.text}>
              {i > 0 && (
                <Icon
                  name="arrow"
                  size={30}
                  color="#c3c9d4"
                  style={{ opacity: Math.min(1, p) }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 20px 12px 12px",
                  borderRadius: 999,
                  backgroundColor: colors.surface2,
                  border: `2px solid ${colors.line}`,
                  fontFamily: sans,
                  fontWeight: 500,
                  fontSize: 26,
                  color: colors.ink,
                  opacity: Math.min(1, p),
                  transform: `scale(${0.85 + 0.15 * p})`,
                }}
              >
                <IconBadge name={s.icon} size={42} bg={colors.surface} color={colors.muted} border={colors.line} />
                {s.text}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginTop: 36,
          paddingTop: 30,
          borderTop: `2px solid ${colors.line}`,
        }}
      >
        <div
          style={{
            transform: `translateX(${(1 - coin) * (tone === "good" ? 60 : -60)}px) rotate(${(1 - coin) * (tone === "good" ? 180 : -180)}deg)`,
            opacity: Math.min(1, coin * 1.5),
          }}
        >
          <IconBadge name="coin" size={64} bg={c} color="#fff" />
        </div>
        <span
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 34,
            color: c,
            opacity: coin,
          }}
        >
          {result}
        </span>
      </div>
    </div>
  );
};

export const NoShow: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = presence(frame, 0, NOSHOW_DURATION, 12);
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, vis + 0.0001) }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Words
          text="And if you skip it?"
          start={4}
          accent={["skip"]}
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 92,
            letterSpacing: "-0.03em",
            color: colors.ink,
            justifyContent: "center",
          }}
        />
        <div style={{ display: "flex", gap: 40, marginTop: 70 }}>
          <Lane
            start={34}
            tone="good"
            who="verified"
            title="You show up"
            steps={[
              { icon: "scan", text: "Checked in" },
              { icon: "chain", text: "On-chain" },
            ]}
            result="Stake back + ★ 1 reputation"
          />
          <Lane
            start={98}
            tone="bad"
            who="absent"
            title="You don’t"
            steps={[
              { icon: "calendar", text: "Deadline passes" },
              { icon: "host", text: "Organizer settles" },
            ]}
            result="Stake is forfeited"
          />
        </div>
        <div
          style={{
            marginTop: 54,
            fontFamily: mono,
            fontSize: 26,
            color: colors.muted,
            opacity: prog(frame, 176, 20),
          }}
        >
          Enforced by the RamaiEvents contract, not by a promise.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
