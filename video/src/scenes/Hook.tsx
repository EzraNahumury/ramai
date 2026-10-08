import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Dot, EASE_POP, Headline, presence, prog } from "../lib/anim";
import { Icon, IconBadge } from "../lib/icons";
import { colors, display, mono, sans } from "../lib/theme";

export const HOOK_DURATION = 450; // 15s

const GUESTS = 12;
// The eight who tap "Going" and never come.
const NO_SHOWS = [1, 2, 4, 6, 7, 8, 10, 11];

// Scene clock: the event is created at 0, its seats appear at 52, RSVPs come in
// from 152, event day is 228, and the "free" tag lands at 326.
const SEATS_AT = 52;
const RSVP_AT = 152;
const EVENT_DAY = 228;
const DROP_AT = 236;
const FREE_AT = 326;

/** Three short headlines, one per beat. The card on the right tells the story. */
const Lines: React.FC = () => {
  const frame = useCurrentFrame();
  const beats = [
    { a: "Easy to create.", b: "Hard to fill.", from: 0, to: 135, start: 8, startB: 52 },
    { a: "12 said yes.", b: "4 showed up.", from: 135, to: 315, start: 150, startB: 244 },
    { a: "Costs nothing.", b: "Means nothing.", from: 315, to: HOOK_DURATION, start: 326, startB: 366 },
  ];
  return (
    <>
      {beats.map((b) => {
        const vis = presence(frame, b.from, b.to, 12);
        return (
          <AbsoluteFill
            key={b.a}
            style={{
              justifyContent: "center",
              paddingLeft: 150,
              opacity: vis,
              transform: `translateY(${(1 - vis) * -20}px)`,
            }}
          >
            <Headline a={b.a} b={b.b} start={b.start} startB={b.startB} size={96} />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

/** One event, from "created" to event day: twelve RSVPs in, eight never arrive. */
const EventCard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = prog(frame, 0, 28);
  const created = prog(frame, 16, 14, EASE_POP);
  const eventDay = frame >= EVENT_DAY;

  const going = Math.round(
    interpolate(frame, [RSVP_AT, RSVP_AT + GUESTS * 5], [0, GUESTS], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const dropped = Math.round(
    interpolate(frame, [DROP_AT, DROP_AT + NO_SHOWS.length * 5], [0, NO_SHOWS.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const count = eventDay ? GUESTS - dropped : going;
  const counter = prog(frame, RSVP_AT - 8, 16);
  const free = prog(frame, FREE_AT, 18, EASE_POP);

  const status =
    frame < RSVP_AT - 6
      ? { text: "CREATED", bg: "#e4f6ee", color: colors.success }
      : eventDay
        ? { text: "EVENT DAY", bg: colors.ink, color: "#fff" }
        : { text: "RSVP", bg: colors.accentSoft, color: colors.accent };

  return (
    <AbsoluteFill style={{ perspective: 2200, alignItems: "flex-end", justifyContent: "center", paddingRight: 150 }}>
      <div
        style={{
          position: "relative",
          width: 700,
          boxSizing: "border-box",
          padding: "44px 48px 46px",
          borderRadius: 36,
          backgroundColor: colors.surface,
          border: `2px solid ${colors.line}`,
          boxShadow: "0 44px 110px rgba(20,22,28,0.13)",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 70}px) rotateX(3deg) rotateY(${-9 + Math.sin(frame / 60) * 1.5}deg)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative" }}>
            <IconBadge name="calendar" size={84} bg={colors.accentSoft} color={colors.accent} />
            <div
              style={{
                position: "absolute",
                right: -8,
                bottom: -6,
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: colors.success,
                border: `3px solid ${colors.surface}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${created})`,
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
          </div>
          <span
            style={{
              fontFamily: display,
              fontWeight: 600,
              fontSize: 44,
              letterSpacing: "-0.02em",
              color: colors.ink,
            }}
          >
            Friday Futsal
          </span>
          <span
            style={{
              marginLeft: "auto",
              padding: "9px 18px",
              borderRadius: 999,
              fontFamily: mono,
              fontSize: 21,
              letterSpacing: "0.08em",
              backgroundColor: status.bg,
              color: status.color,
            }}
          >
            {status.text}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 26,
            marginTop: 46,
            justifyItems: "center",
          }}
        >
          {Array.from({ length: GUESTS }).map((_, i) => {
            const seat = prog(frame, SEATS_AT + i * 3, 12, EASE_POP);
            const fillIn = prog(frame, RSVP_AT + i * 5, 12, EASE_POP);
            const dropIndex = NO_SHOWS.indexOf(i);
            const fillOut = dropIndex >= 0 ? prog(frame, DROP_AT + dropIndex * 5, 12) : 0;
            return (
              <div key={i} style={{ opacity: Math.min(1, seat), transform: `scale(${seat})` }}>
                <Dot size={72} fill={Math.max(0, fillIn - fillOut)} />
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 44,
            paddingTop: 30,
            borderTop: `2px solid ${colors.line}`,
            opacity: counter,
          }}
        >
          <Icon name="users" size={62} color={eventDay ? colors.accent : colors.muted} />
          <span style={{ fontFamily: display, fontWeight: 600, fontSize: 92, color: colors.ink, lineHeight: 1 }}>
            {count}
          </span>
          <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 40, color: "#aab1bd" }}>/ {GUESTS}</span>
        </div>

        {/* Why it happens: the RSVP was free. */}
        <div
          style={{
            position: "absolute",
            right: -44,
            top: -38,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 30px 14px 20px",
            borderRadius: 999,
            backgroundColor: colors.ink,
            color: "#fff",
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 36,
            boxShadow: "0 20px 50px rgba(20,22,28,0.3)",
            opacity: Math.min(1, free),
            transform: `rotate(${6 - (1 - Math.min(1, free)) * 14}deg) scale(${0.6 + 0.4 * free})`,
          }}
        >
          <Icon name="tag" size={38} color="#fff" />
          Free RSVP
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Hook: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Lines />
    <EventCard />
  </AbsoluteFill>
);
