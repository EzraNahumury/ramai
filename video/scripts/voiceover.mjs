// Generates the narration with ElevenLabs, one file per scene, plus word timings
// for the subtitles.
//
//   node scripts/voiceover.mjs            # generate every scene
//   node scripts/voiceover.mjs hook rsvp  # regenerate only these scenes
//
// Reads ELEVENLABS_API_KEY from video/.env. Writes public/voiceover/<scene>.mp3
// and src/voiceover.json. Each run spends ElevenLabs credits (about 1 per character).
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const KEY = env.ELEVENLABS_API_KEY;
if (!KEY) throw new Error("ELEVENLABS_API_KEY is empty in video/.env");

const VOICE_ID = "nPczCjzI2devNBz1zQrb"; // Brian — deep, resonant, comforting
const MODEL = "eleven_multilingual_v2";

// One entry per scene, in film order. Keep each line shorter than its scene.
export const SCRIPT = {
  hook: "Creating an event is easy. Filling the room is not. Twelve people say yes. Four show up. Because a free RSVP costs nothing, so it means nothing.",
  intro: "This is Ramai. AI matches each event to the right people. A small refundable stake makes every RSVP real. And showing up becomes reputation you own.",
  onboarding: "Getting started takes an email. Ramai creates your wallet for you, with no seed phrase. Then you tell it what you're into.",
  create: "An organizer describes the event in one sentence, and AI drafts the title and description. They set a stake and a capacity, then publish. The commitment rules now live on BNB Smart Chain.",
  discover: "A participant sees it picked for them, with the reason it fits. They can ask the event anything, and get answers from its real details.",
  rsvp: "To RSVP, they put down a small stake. The contract holds it, not Ramai.",
  checkin: "On the day, the organizer checks them in. That check-in is confirmed on-chain, where anyone can verify it. Attendance is verified, the stake comes straight back, and their reputation goes up by one.",
  noshow: "And if they skip it? After the deadline, the organizer settles, and the stake is forfeited.",
  closing: "Every honest check-in makes the next match better. Ramai. Events that fill up, with people who show up.",
};

const outDir = join(root, "public", "voiceover");
mkdirSync(outDir, { recursive: true });
const manifestPath = join(root, "src", "voiceover.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};

const only = process.argv.slice(2);
const ids = only.length ? only : Object.keys(SCRIPT);

for (const id of ids) {
  const text = SCRIPT[id];
  if (!text) throw new Error(`Unknown scene "${id}"`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, speed: 1.0 },
      }),
    },
  );
  if (!res.ok) throw new Error(`${id}: ElevenLabs ${res.status} ${await res.text()}`);
  const data = await res.json();
  writeFileSync(join(outDir, `${id}.mp3`), Buffer.from(data.audio_base64, "base64"));

  // Characters → words with start/end seconds.
  const a = data.alignment;
  const words = [];
  let cur = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { text: "", start: a.character_start_times_seconds[i], end: 0 };
    cur.text += ch;
    cur.end = a.character_end_times_seconds[i];
  });
  if (cur) words.push(cur);

  const duration = a.character_end_times_seconds[a.character_end_times_seconds.length - 1];
  manifest[id] = { duration: +duration.toFixed(3), words: words.map((w) => ({ ...w, start: +w.start.toFixed(3), end: +w.end.toFixed(3) })) };
  console.log(`${id.padEnd(11)} ${duration.toFixed(2)}s  ${text.length} chars`);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
