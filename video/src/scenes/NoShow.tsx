import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop, EASE_POP, Words, presence, prog } from "../lib/anim";
import { Icon, IconBadge, IconName } from "../lib/icons";
import { colors, display, mono, sans } from "../lib/theme";

export const NOSHOW_DURATION = 270; // 9s

// The rule the contract enforces, drawn as two outcomes. This scene explains the
// mechanism; it is a diagram, not a recording of a forfeited stake.
const Outcome: React.FC<{
  start: number;
  tone: "good" | "bad";
  who: IconName;
  title: string;
  steps: IconName[];
  result: string;
  star?: boolean;
}> = ({ start, tone, who, title, steps, result, star }) => {
  const frame = useCurrentFrame();
  const enter = prog(frame, start, 26);
  const c = tone === "good" ? colors.success : colors.accent;
  const soft = tone === "good" ? "#e4f6ee" : colors.accentSoft;
  const coinAt = start + 22 + steps.length * 16;
  const coin = prog(frame, coinAt, 30);
  return (
    <div
      style={{
        width: 640,
        boxSizing: "border-box",
        padding: "48px 44px 46px",
        borderRadius: 36,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: colors.surface,
        border: `2px solid ${colors.line}`,
        boxShadow: "0 30px 80px rgba(20,22,28,0.08)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 60}px)`,
      }}
    >
      <IconBadge
        name={who}
        size={132}
        bg={soft}
        color={c}
        style={{ transform: `scale(${0.6 + 0.4 * prog(frame, start + 6, 18, EASE_POP)})` }}
      />
      <div
        style={{
          fontFamily: display,
          fontWeight: 600,
          fontSize: 60,
          letterSpacing: "-0.02em",
          color: colors.ink,
          marginTop: 22,
        }}
      >
        {title}
      </div>

      {/* What happens, as icons: the steps, then where the coin ends up. */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 36 }}>
        {steps.map((s, i) => {
          const p = prog(frame, start + 22 + i * 16, 16, EASE_POP);
          return (
            <React.Fragment key={s}>
              <IconBadge
                name={s}
                size={76}
                bg={colors.surface2}
                color={colors.muted}
                border={colors.line}
                style={{ opacity: Math.min(1, p), transform: `scale(${0.8 + 0.2 * p})` }}
              />
              <Icon name="arrow" size={32} color="#c3c9d4" style={{ opacity: Math.min(1, p) }} />
            </React.Fragment>
          );
        })}
        <div
          style={{
            opacity: Math.min(1, coin * 1.5),
            transform: `translateX(${(1 - coin) * -40}px) rotate(${(1 - coin) * -180}deg)`,
          }}
        >
          <IconBadge name={tone === "good" ? "refund" : "absent"} size={76} bg={c} color="#fff" />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 34,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 40,
          color: c,
          opacity: coin,
        }}
      >
        {result}
        {star && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 18px 4px 12px",
              borderRadius: 999,
              backgroundColor: "rgba(201,138,30,0.14)",
              color: colors.gold,
              fontSize: 34,
            }}
          >
            <Icon name="star" size={32} color={colors.gold} strokeWidth={2.2} />
            +1
          </span>
        )}
      </div>
    </div>
  );
};

export const NoShow: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = presence(frame, 0, NOSHOW_DURATION, 12);
  const rule = prog(frame, 176, 20);
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, vis + 0.0001) }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
        <Words
          text="Skip it?"
          start={4}
          accent={["Skip"]}
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 100,
            letterSpacing: "-0.03em",
            color: colors.ink,
            justifyContent: "center",
          }}
        />
        <div style={{ display: "flex", gap: 44, marginTop: 56 }}>
          <Outcome
            start={34}
            tone="good"
            who="verified"
            title="Show up"
            steps={["scan", "chain"]}
            result="Stake back"
            star
          />
          <Outcome
            start={98}
            tone="bad"
            who="absent"
            title="No-show"
            steps={["calendar", "host"]}
            result="Stake forfeited"
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 40,
            padding: "10px 22px 10px 16px",
            borderRadius: 999,
            border: `2px solid ${colors.line}`,
            backgroundColor: colors.surface,
            fontFamily: mono,
            fontSize: 24,
            letterSpacing: "0.04em",
            color: colors.muted,
            opacity: rule,
            transform: `translateY(${(1 - rule) * 16}px)`,
          }}
        >
          <Icon name="lock" size={24} color={colors.muted} />
          enforced by the contract
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
