import React from "react";
import { Composition, Folder, Series } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./lib/theme";
import { Hook, HOOK_DURATION } from "./scenes/Hook";
import { Intro, INTRO_DURATION } from "./scenes/Intro";

// The full demo, scene by scene. Later scenes (screen recordings) get appended here.
const RamaiDemo: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={HOOK_DURATION}>
      <Hook />
    </Series.Sequence>
    <Series.Sequence durationInFrames={INTRO_DURATION}>
      <Intro />
    </Series.Sequence>
  </Series>
);

const size = { fps: FPS, width: WIDTH, height: HEIGHT };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RamaiDemo"
        component={RamaiDemo}
        durationInFrames={HOOK_DURATION + INTRO_DURATION}
        {...size}
      />
      <Folder name="Scenes">
        <Composition id="Hook" component={Hook} durationInFrames={HOOK_DURATION} {...size} />
        <Composition id="Intro" component={Intro} durationInFrames={INTRO_DURATION} {...size} />
      </Folder>
    </>
  );
};
