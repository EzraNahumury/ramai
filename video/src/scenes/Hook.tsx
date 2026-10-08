import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Dot, EASE_POP, Words, presence, prog } from "../lib/anim";
import { colors, display, mono, sans } from "../lib/theme";

export const HOOK_DURATION = 450; // 15s

const headline: React.CSSProperties = {
  fontFamily: display,
  fontWeight: 600,
  fontSize: 124,
  lineHeight: 1.06,
  letterSpacing: "-0.03em",
  color: colors.ink,
};

/** 0:00–0:04.5 — the easy part vs the hard part. */
const BeatEasy: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = presence(frame, 0, 135, 14);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 200px",
        opacity: vis,
        transform: `translateY(${(1 - vis) * -24}px)`,
      }}
    >
      <Words text="Creating an event is easy." start={8} style={headline} />
      <Words
        text="Filling the room is not."
        start={52}
        accent={["not"]}
        style={{ ...headline, marginTop: 14 }}
      />
    </AbsoluteFill>
  );
};

const GUESTS = 12;
// The eight who tap "Going" and never come.
const NO_SHOWS = [1, 2, 4, 6, 7, 8, 10, 11];

/** 0:04.5–0:10.5 — 12 said yes, 4 showed up. */
const BeatNoShow: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = presence(frame, 135, 315, 14);
  const cardIn = prog(frame, 138, 26);
  const eventDay = prog(frame, 228, 14);

  const going = Math.round(interpolate(frame, [152, 152 + GUESTS * 5], [0, GUESTS], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const dropped = Math.round(interpolate(frame, [236, 236 + NO_SHOWS.length * 5], [0, NO_SHOWS.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const count = eventDay > 0.5 ? GUESTS - dropped : going;

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 170px",
        opacity: vis,
      }}
    >
      <div style={{ width: 760 }}>
        <Words text="12 said yes." start={150} style={{ ...headline, fontSize: 112 }} />
        <Words
          text="4 showed up."
          start={244}
          accent={["4"]}
          style={{ ...headline, fontSize: 112, marginTop: 10 }}
        />
      </div>

      <div
        style={{
          width: 700,
          padding: "44px 48px 48px",
          borderRadius: 32,
          backgroundColor: colors.surface,
          border: `2px solid ${colors.line}`,
          boxShadow: "0 30px 80px rgba(20,22,28,0.08)",
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 60}px) rotate(${(1 - cardIn) * 2}deg)`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: mono,
            fontSize: 22,
            letterSpacing: "0.08em",
            color: colors.muted,
          }}
        >
          <span>FRIDAY FUTSAL</span>
          <span
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              backgroundColor: eventDay > 0.5 ? colors.ink : colors.accentSoft,
              color: eventDay > 0.5 ? "#fff" : colors.accent,
            }}
          >
            {eventDay > 0.5 ? "EVENT DAY" : "RSVP LIST"}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 26,
            marginTop: 44,
            justifyItems: "center",
          }}
        >
          {Array.from({ length: GUESTS }).map((_, i) => {
            const fillIn = prog(frame, 152 + i * 5, 12, EASE_POP);
            const dropIndex = NO_SHOWS.indexOf(i);
            const fillOut = dropIndex >= 0 ? prog(frame, 236 + dropIndex * 5, 12) : 0;
            return <Dot key={i} size={72} fill={Math.max(0, fillIn - fillOut)} />;
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginTop: 44,
            paddingTop: 30,
            borderTop: `2px solid ${colors.line}`,
          }}
        >
          <span style={{ fontFamily: display, fontWeight: 600, fontSize: 84, color: colors.ink, lineHeight: 1 }}>
            {count}
          </span>
          <span style={{ fontFamily: sans, fontSize: 32, color: colors.muted }}>
            {eventDay > 0.5 ? "actually in the room" : "tapped “Going”"}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** 0:10.5–0:15 — why: a free RSVP carries no commitment. */
const BeatWhy: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = presence(frame, 315, HOOK_DURATION, 14);
  const underline = prog(frame, 392, 22);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        opacity: vis,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 26,
          letterSpacing: "0.1em",
          color: colors.muted,
          opacity: prog(frame, 318, 16),
          marginBottom: 34,
        }}
      >
        THE REAL PROBLEM
      </div>
      <Words
        text="A free RSVP costs nothing."
        start={324}
        style={{ ...headline, justifyContent: "center" }}
      />
      <div style={{ position: "relative", marginTop: 14 }}>
        <Words
          text="So it means nothing."
          start={364}
          accent={["nothing"]}
          style={{ ...headline, justifyContent: "center" }}
        />
        <div
          style={{
            position: "absolute",
            right: 4,
            bottom: -6,
            height: 10,
            width: 468 * underline,
            borderRadius: 999,
            backgroundColor: colors.accent,
            opacity: 0.9,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Hook: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <BeatEasy />
    <BeatNoShow />
    <BeatWhy />
  </AbsoluteFill>
);
