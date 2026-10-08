import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Folder,
  Series,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { layoutNarration, Narration, SceneId } from "./lib/Narration";
import { FPS, HEIGHT, WIDTH } from "./lib/theme";
import { Closing, CLOSING_DURATION } from "./scenes/Closing";
import { Hook, HOOK_DURATION } from "./scenes/Hook";
import { Intro, INTRO_DURATION } from "./scenes/Intro";
import { NoShow, NOSHOW_DURATION } from "./scenes/NoShow";
import { Onboarding, ONBOARDING_DURATION } from "./scenes/Onboarding";
import { CHECKIN, CREATE, DISCOVER, RSVP } from "./scenes/steps";
import { Walkthrough, walkthroughDuration } from "./scenes/Walkthrough";

type Scene = {
  id: string;
  vo: SceneId;
  /** Scene-local frame each narration sentence should start on (matches the picture). */
  cues: number[];
  frames: number;
  node: React.ReactNode;
};

// The full demo, scene by scene.
const SCENES: Scene[] = [
  { id: "Hook", vo: "hook", cues: [10, 55, 150, 246, 326], frames: HOOK_DURATION, node: <Hook /> },
  { id: "Intro", vo: "intro", cues: [30, 152, 244, 338], frames: INTRO_DURATION, node: <Intro /> },
  { id: "Onboarding", vo: "onboarding", cues: [36, 122, 214], frames: ONBOARDING_DURATION, node: <Onboarding /> },
  { id: "Create", vo: "create", cues: [20, 262, 415], frames: walkthroughDuration(CREATE), node: <Walkthrough {...CREATE} /> },
  { id: "Discover", vo: "discover", cues: [15, 165], frames: walkthroughDuration(DISCOVER), node: <Walkthrough {...DISCOVER} /> },
  { id: "Rsvp", vo: "rsvp", cues: [15, 100], frames: walkthroughDuration(RSVP), node: <Walkthrough {...RSVP} /> },
  { id: "CheckIn", vo: "checkin", cues: [15, 215, 440], frames: walkthroughDuration(CHECKIN), node: <Walkthrough {...CHECKIN} /> },
  { id: "NoShow", vo: "noshow", cues: [8, 104], frames: NOSHOW_DURATION, node: <NoShow /> },
  { id: "Closing", vo: "closing", cues: [8, 222, 250], frames: CLOSING_DURATION, node: <Closing /> },
];

const TOTAL = SCENES.reduce((n, s) => n + s.frames, 0);

const MUSIC = "music/instrumental-minimal.mp3";
const MUSIC_FULL = 0.62; // when nobody is speaking
const MUSIC_DUCKED = 0.2; // under the voice
const DUCK_RAMP = 10; // frames to duck / release

/** Background music, lowered whenever a narration sentence is playing. */
const Music: React.FC = () => {
  const { fps } = useVideoConfig();
  // Every sentence's [start, end] on the film's clock.
  const spoken: [number, number][] = [];
  let at = 0;
  for (const s of SCENES) {
    for (const l of layoutNarration(s.vo, s.cues, fps)) {
      spoken.push([at + l.from, at + l.from + l.frames]);
    }
    at += s.frames;
  }
  return (
    <Audio
      src={staticFile(MUSIC)}
      volume={(f) => {
        let duck = 0;
        for (const [a, b] of spoken) {
          const d = interpolate(f, [a - DUCK_RAMP, a, b, b + DUCK_RAMP + 8], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          if (d > duck) duck = d;
        }
        const level = MUSIC_FULL + (MUSIC_DUCKED - MUSIC_FULL) * duck;
        const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
        const fadeOut = interpolate(f, [TOTAL - 75, TOTAL - 10], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return level * fadeIn * fadeOut;
      }}
    />
  );
};

const SceneWithVoice: React.FC<{ scene: Scene }> = ({ scene }) => (
  <AbsoluteFill>
    {scene.node}
    <Narration id={scene.vo} cues={scene.cues} />
  </AbsoluteFill>
);

const RamaiDemo: React.FC = () => (
  <AbsoluteFill>
    <Series>
      {SCENES.map((s) => (
        <Series.Sequence key={s.id} durationInFrames={s.frames}>
          <SceneWithVoice scene={s} />
        </Series.Sequence>
      ))}
    </Series>
    <Music />
  </AbsoluteFill>
);

const size = { fps: FPS, width: WIDTH, height: HEIGHT };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="RamaiDemo" component={RamaiDemo} durationInFrames={TOTAL} {...size} />
      <Folder name="Scenes">
        {SCENES.map((s) => (
          <Composition
            key={s.id}
            id={s.id}
            component={() => <SceneWithVoice scene={s} />}
            durationInFrames={s.frames}
            {...size}
          />
        ))}
      </Folder>
    </>
  );
};
