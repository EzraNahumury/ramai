import React from "react";

// One icon family for the whole film: 24px grid, 2px round strokes, no fills.
// Drawn for Ramai rather than pulled from a stock set, so they share one weight.
export type IconName =
  | "mail"
  | "wallet"
  | "tag"
  | "pencil"
  | "doc"
  | "coin"
  | "chain"
  | "calendar"
  | "target"
  | "chat"
  | "lock"
  | "users"
  | "scan"
  | "search"
  | "verified"
  | "refund"
  | "star"
  | "absent"
  | "user"
  | "host"
  | "arrow";

const PATHS: Record<IconName, React.ReactNode> = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3.5 7.5 12 13l8.5-5.5" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17a2 2 0 0 1 2 2v1" />
      <rect x="3" y="8" width="18" height="11" rx="2.5" />
      <path d="M16.5 13.5h.01" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.2V5.5a2 2 0 0 1 2-2h6.7a2 2 0 0 1 1.4.6l6.3 6.3a2 2 0 0 1 0 2.8l-6.7 6.7a2 2 0 0 1-2.8 0l-6.3-6.3a2 2 0 0 1-.6-1.4Z" />
      <path d="M8 8h.01" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 0l.5.5a2.1 2.1 0 0 1 0 3L8.5 19 4 20Z" />
      <path d="M13.5 7l3.5 3.5" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M14.5 9.5h-3.7a1.6 1.6 0 0 0 0 3.2h2.4a1.6 1.6 0 0 1 0 3.2H9.5" />
    </>
  ),
  chain: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8.5 15l2.3 2.2 4.7-4.7" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12h.01" />
    </>
  ),
  chat: (
    <>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M8 10h8M8 13.5h5" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19.5a6 6 0 0 1 12 0" />
      <path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.3a6 6 0 0 1 3.5 5.2" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M8.5 12.2l2.4 2.3 4.6-4.8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  verified: (
    <>
      <path d="M12 3l2.3 1.7 2.9-.1.9 2.7 2.3 1.7-.9 2.7.9 2.7-2.3 1.7-.9 2.7-2.9-.1L12 21l-2.3-1.7-2.9.1-.9-2.7-2.3-1.7.9-2.7-.9-2.7 2.3-1.7.9-2.7 2.9.1L12 3Z" />
      <path d="M8.7 12.2l2.3 2.2 4.4-4.6" />
    </>
  ),
  refund: (
    <>
      <path d="M9 14L4.5 9.5 9 5" />
      <path d="M4.5 9.5H14a5.5 5.5 0 0 1 0 11h-3" />
    </>
  ),
  star: (
    <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8L12 3.5Z" />
  ),
  absent: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  host: (
    <>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M6 20a6 6 0 0 1 12 0" />
      <path d="M8 4.5l1.6 1.3L12 3.5l2.4 2.3L16 4.5" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

export const Icon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}> = ({ name, size = 24, color = "currentColor", strokeWidth = 2, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
  >
    {PATHS[name]}
  </svg>
);

/** Icon inside a round badge — the film's standard way to show a step or actor. */
export const IconBadge: React.FC<{
  name: IconName;
  size?: number;
  bg: string;
  color: string;
  border?: string;
  style?: React.CSSProperties;
}> = ({ name, size = 64, bg, color, border, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: bg,
      border: border ? `2px solid ${border}` : undefined,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      ...style,
    }}
  >
    <Icon name={name} size={size * 0.5} color={color} />
  </div>
);
