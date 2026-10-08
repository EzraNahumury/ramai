import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Same tokens as the web app (web/src/app/globals.css) so the video reads as Ramai.
export const colors = {
  bg: "#fbfcfe",
  surface: "#ffffff",
  surface2: "#f4f6fa",
  ink: "#14161c",
  muted: "#5b6270",
  line: "#e6e9ef",
  accent: "#ff5a24",
  accentSoft: "#fff0ea",
  success: "#0e9f6e",
  gold: "#c98a1e",
};

export const display = loadFraunces("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
}).fontFamily;

export const sans = loadJakarta("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
}).fontFamily;

export const mono = loadMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
}).fontFamily;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
