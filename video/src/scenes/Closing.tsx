import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop, EASE_POP, Words, prog } from "../lib/anim";
import { Icon, IconBadge, IconName } from "../lib/icons";
import { colors, display, mono, sans } from "../lib/theme";

export const CLOSING_DURATION = 450; // 15s

const LOOP: { icon: IconName; label: string }[] = [
  { icon: "target", label: "AI match" },
  { icon: "coin", label: "Stake to RSVP" },
  { icon: "scan", label: "Check in" },
  { icon: "refund", label: "Stake back" },
  { icon: "star", label: "Reputation" },
];
const STEP = 26; // frames between loop nodes lighting up

/** 0–7s: the loop that compounds. 7–15s: lockup, what it is, where to find it. */
export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const loopOut = prog(frame, 200, 22);
  const lockIn = prog(frame, 214, 30);

  return (
    <AbsoluteFill>
      <Backdrop />

      {/* The loop */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - loopOut,
          transform: `translateY(${loopOut * -40}px)`,
        }}
      >
        <Words
          text="Every honest check-in makes the next match better."
          start={4}
          stagger={3}
          accent={["better"]}
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 72,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: colors.ink,
            justifyContent: "center",
            maxWidth: 1400,
            textAlign: "center",
          }}
        />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 110 }}>
          {LOOP.map((n, i) => {
            const at = 44 + i * STEP;
            const p = prog(frame, at, 16, EASE_POP);
            // After the first pass, a highlight keeps travelling round the loop.
            const lap = frame > 44 + LOOP.length * STEP;
            const cursor = Math.floor((frame - 44) / STEP) % LOOP.length;
            const hot = lap ? cursor === i : frame >= at && frame < at + STEP;
            return (
              <React.Fragment key={n.label}>
                {i > 0 && (
                  <Icon
                    name="arrow"
                    size={40}
                    color={colors.accent}
                    strokeWidth={2.2}
                    style={{ marginTop: 44, opacity: Math.min(1, p) }}
                  />
                )}
                <div
                  style={{
                    width: 236,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 22,
                    opacity: Math.min(1, p),
                    transform: `translateY(${(1 - Math.min(1, p)) * 30}px)`,
                  }}
                >
                  <IconBadge
                    name={n.icon}
                    size={128}
                    bg={hot ? colors.accent : colors.surface}
                    color={hot ? "#fff" : colors.accent}
                    border={hot ? undefined : colors.line}
                    style={{
                      boxShadow: hot
                        ? "0 22px 50px rgba(255,90,36,0.28)"
                        : "0 14px 40px rgba(20,22,28,0.06)",
                      transform: `scale(${hot ? 1.06 : 1})`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: sans,
                      fontWeight: 600,
                      fontSize: 30,
                      color: hot ? colors.ink : colors.muted,
                    }}
                  >
                    {n.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Lockup */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
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
            gap: 22,
            marginTop: 70,
            opacity: prog(frame, 286, 22),
            transform: `translateY(${(1 - prog(frame, 286, 22)) * 20}px)`,
          }}
        >
          <Fact icon="chain" label="RamaiEvents · BSC Testnet" value="0x0FBA1927…cCa992" />
          <Fact icon="star" label="RamaiReputation · BSC Testnet" value="0x3072a5b0…DA23D" />
          <Fact icon="doc" label="Source" value="github.com/EzraNahumury/ramai" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Fact: React.FC<{ icon: IconName; label: string; value: string }> = ({ icon, label, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 26px 16px 16px",
      borderRadius: 20,
      backgroundColor: colors.surface,
      border: `2px solid ${colors.line}`,
    }}
  >
    <IconBadge name={icon} size={54} bg={colors.accentSoft} color={colors.accent} />
    <div>
      <div style={{ fontFamily: sans, fontSize: 21, color: colors.muted }}>{label}</div>
      <div style={{ fontFamily: mono, fontSize: 25, color: colors.ink, marginTop: 2 }}>{value}</div>
    </div>
  </div>
);
