import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voiceover from "../voiceover.json";
import { prog } from "./anim";
import { colors, sans } from "./theme";

export type SceneId = keyof typeof voiceover;
type Word = { text: string; start: number; end: number };

/** A sentence of narration: its words, and where it sits inside the scene's audio file. */
type Line = { words: Word[]; start: number; end: number };

const sentencesOf = (id: SceneId): Line[] => {
  const lines: Line[] = [];
  let cur: Word[] = [];
  for (const w of voiceover[id].words as Word[]) {
    cur.push(w);
    if (/[.?!]$/.test(w.text)) {
      lines.push({ words: cur, start: cur[0].start, end: w.end });
      cur = [];
    }
  }
  if (cur.length) lines.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
  return lines;
};

const GAP = 5; // minimum frames of air between two sentences

/**
 * Places each sentence at its cue frame (or right after the previous one, if that
 * would overlap), so the voice lands on the picture it describes.
 */
export const layoutNarration = (id: SceneId, cues: number[], fps: number) => {
  let free = 0;
  return sentencesOf(id).map((line, i) => {
    const from = Math.max(cues[i] ?? free, free);
    const frames = Math.ceil((line.end - line.start) * fps);
    free = from + frames + GAP;
    return { ...line, from, frames };
  });
};

const MAX_CHARS = 46;

/** Breaks a sentence into subtitle-sized phrases, preferring to break after a comma. */
const phrasesOf = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  let len = 0;
  words.forEach((w, i) => {
    cur.push(w);
    len += w.text.length + 1;
    const rest = words.slice(i + 1).reduce((n, x) => n + x.text.length + 1, 0);
    const atComma = /,$/.test(w.text) && len > 18 && rest > 12;
    const next = words[i + 1];
    if (atComma || (next && len + next.text.length > MAX_CHARS)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
  });
  if (cur.length) out.push(cur);
  return out;
};

export const VOICE_VOLUME = 1;

/** One scene's voice + subtitles. Rendered inside that scene's <Series.Sequence>. */
export const Narration: React.FC<{ id: SceneId; cues: number[] }> = ({ id, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = layoutNarration(id, cues, fps);

  // Which phrase is being spoken right now?
  let caption: { text: string; at: number }[] | null = null;
  let shownAt = 0;
  for (const line of lines) {
    const frameOf = (t: number) => line.from + Math.round((t - line.start) * fps);
    for (const phrase of phrasesOf(line.words)) {
      const a = frameOf(phrase[0].start);
      const b = frameOf(phrase[phrase.length - 1].end) + 8;
      if (frame >= a && frame < b) {
        caption = phrase.map((w) => ({ text: w.text, at: frameOf(w.start) }));
        shownAt = a;
      }
    }
  }
  const p = prog(frame, shownAt, 8);

  return (
    <>
      {lines.map((line, i) => (
        <Sequence key={i} from={line.from} durationInFrames={line.frames + 3} layout="none">
          <Audio
            src={staticFile(`voiceover/${id}.mp3`)}
            trimBefore={Math.max(0, Math.floor((line.start - 0.04) * fps))}
            volume={VOICE_VOLUME}
          />
        </Sequence>
      ))}

      {caption && (
        <AbsoluteFill
          style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 42 }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.28em",
              padding: "11px 26px",
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.94)",
              border: `2px solid ${colors.line}`,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 30,
              lineHeight: 1.2,
              opacity: 0.4 + 0.6 * p,
              transform: `translateY(${(1 - p) * 8}px)`,
              boxShadow: "0 10px 30px rgba(20,22,28,0.1)",
            }}
          >
            {/* Spoken words turn dark; the word being said takes the accent. */}
            {caption.map((w, i) => {
              const next = caption?.[i + 1];
              const saying = frame >= w.at && (!next || frame < next.at);
              return (
                <span
                  key={i}
                  style={{ color: saying ? colors.accent : frame >= w.at ? colors.ink : "#a3aab6" }}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
    </>
  );
};
