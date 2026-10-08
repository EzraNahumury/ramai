import type { WalkthroughProps } from "./Walkthrough";

// The four recorded steps. Each beat names the footage it plays (see scripts/cut.sh),
// the icon + two or three words shown on its chip, and where the camera pushes in.
// The narration says the rest, so keep these short.

export const CREATE: WalkthroughProps = {
  role: "Organizer",
  title: ["One sentence in.", "Full event out."],
  url: "ramai.app/create",
  beats: [
    { cuts: ["b1-draft"], icon: "pencil", label: "One sentence", zoom: { s: 1.3, x: 50, y: 22 } },
    { cuts: ["b2-filled"], icon: "doc", label: "AI drafts it", zoom: { s: 1.22, x: 50, y: 38 } },
    { cuts: ["b3-rules"], icon: "coin", label: "Stake + capacity", zoom: { s: 1.3, x: 50, y: 86 } },
    { cuts: ["b4-creating"], icon: "chain", label: "On-chain", zoom: { s: 1.3, x: 50, y: 74 } },
    { cuts: ["b5-event"], icon: "calendar", label: "Event live", zoom: { s: 1.08, x: 50, y: 40 } },
  ],
};

export const DISCOVER: WalkthroughProps = {
  role: "Participant",
  title: ["Picked for you.", "With a reason."],
  url: "ramai.app/events",
  beats: [
    { cuts: ["c1-picked"], icon: "target", label: "Picked for you", zoom: { s: 1.3, x: 8, y: 58 } },
    { cuts: ["c2-event", "c3-thinking"], icon: "chat", label: "Ask anything", zoom: { s: 1.25, x: 45, y: 80 }, url: "ramai.app/events/1" },
    { cuts: ["c4-answer"], icon: "doc", label: "Real answers", zoom: { s: 1.2, x: 50, y: 84 }, url: "ramai.app/events/1" },
  ],
};

export const RSVP: WalkthroughProps = {
  role: "Participant",
  title: ["An RSVP", "that means it."],
  url: "ramai.app/events/1",
  beats: [
    { cuts: ["d1-button"], icon: "coin", label: "Stake to RSVP", zoom: { s: 1.3, x: 50, y: 86 } },
    { cuts: ["d2-reserving"], icon: "lock", label: "Held by contract", zoom: { s: 1.3, x: 50, y: 88 } },
    { cuts: ["d3-guestlist"], icon: "users", label: "On the list", zoom: { s: 1.3, x: 60, y: 80 } },
  ],
};

export const CHECKIN: WalkthroughProps = {
  role: "Organizer",
  title: ["Show up.", "Get it back."],
  url: "ramai.app/organizer",
  beats: [
    { cuts: ["e1-paste"], icon: "scan", label: "Check-in", zoom: { s: 1.2, x: 45, y: 58 } },
    { cuts: ["e2-confirm", "e3-done"], icon: "chain", label: "On-chain", zoom: { s: 1.3, x: 45, y: 70 } },
    { cuts: ["e4-bscscan"], icon: "search", label: "Anyone can verify", zoom: { s: 1.42, x: 12, y: 64 }, url: "testnet.bscscan.com", role: "Anyone" },
    { cuts: ["e5-verified"], icon: "verified", label: "Verified", zoom: { s: 1.32, x: 50, y: 90 }, url: "ramai.app/events/1", role: "Participant" },
    { cuts: ["e6-returning", "e7-returned"], icon: "refund", label: "Stake back", zoom: { s: 1.32, x: 45, y: 92 }, url: "ramai.app/events/1", role: "Participant", star: true },
  ],
};
