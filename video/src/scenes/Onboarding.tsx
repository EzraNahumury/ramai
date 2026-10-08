import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, EASE_POP, Words, presence, prog } from "../lib/anim";
import { Icon, IconBadge, IconName } from "../lib/icons";
import { colors, display, mono, sans } from "../lib/theme";

export const ONBOARDING_DURATION = 330; // 11s

const EMAIL = "you@email.com";
const INTERESTS = ["futsal", "casual sports", "beginners"];

const Card: React.FC<{
  index: number;
  start: number;
  icon: IconName;
  title: string;
  children: React.ReactNode;
}> = ({ index, start, icon, title, children }) => {
  const frame = useCurrentFrame();
  const enter = prog(frame, start, 28);
  // The card being "performed" carries the accent until the next one starts.
  const active = prog(frame, start, 12) - prog(frame, start + 78, 16);
  return (
    <div
      style={{
        width: 520,
        height: 452,
        boxSizing: "border-box",
        padding: "40px 42px",
        borderRadius: 32,
        backgroundColor: colors.surface,
        border: `2px solid ${active > 0.5 ? colors.accent : colors.line}`,
        boxShadow: `0 ${20 + active * 18}px ${60 + active * 30}px rgba(20,22,28,${0.05 + active * 0.05})`,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 70 - active * 8}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <IconBadge
          name={icon}
          size={84}
          bg={active > 0.5 ? colors.accent : colors.accentSoft}
          color={active > 0.5 ? "#fff" : colors.accent}
        />
        <span style={{ fontFamily: mono, fontSize: 26, color: colors.accent }}>0{index}</span>
      </div>
      <div
        style={{
          fontFamily: display,
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          color: colors.ink,
          marginTop: 30,
        }}
      >
        {title}
      </div>
      <div style={{ marginTop: 26 }}>{children}</div>
    </div>
  );
};

const field: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  height: 68,
  padding: "0 22px",
  borderRadius: 16,
  border: `2px solid ${colors.line}`,
  backgroundColor: colors.surface2,
  fontFamily: mono,
  fontSize: 27,
  color: colors.ink,
};

export const Onboarding: React.FC = () => {
  const frame = useCurrentFrame();
  const out = presence(frame, 0, ONBOARDING_DURATION, 12);

  // 1) email types in
  const typed = Math.round(
    interpolate(frame, [58, 58 + EMAIL.length * 3], [0, EMAIL.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const caretOn = frame < 110 && Math.floor(frame / 12) % 2 === 0;

  // 2) wallet appears on its own
  const wallet = prog(frame, 150, 20, EASE_POP);
  const noSeed = prog(frame, 172, 18);

  return (
    <AbsoluteFill style={{ opacity: Math.min(1, out + 0.0001) }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Words
          text="No wallet setup. Just your email."
          start={4}
          accent={["email"]}
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 88,
            letterSpacing: "-0.03em",
            color: colors.ink,
            justifyContent: "center",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 84 }}>
          <Card index={1} start={36} icon="mail" title="Sign in with email">
            <div style={field}>
              <Icon name="mail" size={28} color={colors.muted} />
              <span>
                {EMAIL.slice(0, typed)}
                <span style={{ opacity: caretOn ? 1 : 0, color: colors.accent }}>|</span>
              </span>
            </div>
          </Card>

          <Connector start={112} />

          <Card index={2} start={122} icon="wallet" title="A wallet, made for you">
            <div
              style={{
                ...field,
                opacity: Math.min(1, wallet),
                transform: `scale(${0.9 + 0.1 * wallet})`,
                transformOrigin: "0 50%",
              }}
            >
              <Icon name="wallet" size={28} color={colors.accent} />
              0x5682…2a6F
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 14,
                fontFamily: sans,
                fontSize: 25,
                color: colors.muted,
                opacity: noSeed,
              }}
            >
              <Icon name="lock" size={24} color={colors.success} />
              No seed phrase to write down
            </div>
          </Card>

          <Connector start={198} />

          <Card index={3} start={208} icon="tag" title="Say what you’re into">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {INTERESTS.map((t, i) => {
                const p = prog(frame, 236 + i * 9, 14, EASE_POP);
                return (
                  <span
                    key={t}
                    style={{
                      padding: "10px 22px",
                      borderRadius: 999,
                      backgroundColor: colors.accentSoft,
                      color: "#e0430f",
                      fontFamily: sans,
                      fontWeight: 600,
                      fontSize: 27,
                      opacity: Math.min(1, p),
                      transform: `scale(${0.8 + 0.2 * p})`,
                    }}
                  >
                    {t}
                  </span>
                );
              })}
            </div>
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Connector: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 16);
  return (
    <div style={{ opacity: p, transform: `translateX(${(1 - p) * -14}px)` }}>
      <Icon name="arrow" size={44} color={colors.accent} strokeWidth={2.4} />
    </div>
  );
};
