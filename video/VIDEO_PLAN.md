# Ramai Demo Video — Plan & Recording Guide

Target: about **3 minutes**, 1920×1080, 30 fps, English on-screen text, AI voiceover added later.

- Scenes 1, 2 and 9 are motion graphics built in Remotion (scenes 1–2 are done: `out/ramai-first-30s.mp4`).
- Scenes 3–8 are **your screen recordings** (clips A–F). They get placed in a browser frame with captions, zooms and step labels added in Remotion.

---

## 1. Structure

| # | Time | Scene | Source | Status |
|---|---|---|---|---|
| 1 | 0:00–0:15 | Hook: the problem (empty events, fake RSVPs, no-shows) | Motion graphics | Done |
| 2 | 0:15–0:30 | Ramai intro: logo and one-line pitch, three pillars | Motion graphics | Done |
| 3 | 0:30–0:50 | Email login, wallet created automatically, set interests | **Clip A** | To record |
| 4 | 0:50–1:25 | Organizer: one sentence → AI fills the form → Create event | **Clip B** | To record |
| 5 | 1:25–1:55 | Participant: "Picked for you", match reason, ask AI | **Clip C** | To record |
| 6 | 1:55–2:15 | RSVP with stake, now on the guest list | **Clip D** | To record |
| 7 | 2:15–2:45 | Check-in, BscScan proof, stake returned, ★ +1 | **Clip E** | To record |
| 8 | 2:45–2:55 | No-show: stake forfeited | **Clip F** (optional) | To record |
| 9 | 2:55–3:10 | Closing: the loop, contract addresses, team | Motion graphics | To build |

The times are the **final edited** lengths. Your raw clips will be longer; waiting time gets sped up in editing.

---

## 2. Recording settings

- **Resolution:** 1920×1080, 30 fps, MP4. Record the **browser window only**, maximised.
- **Browser:** zoom 100%, bookmarks bar hidden, no other tabs visible if possible, no extensions popping up.
- **One clip = one file.** Don't stop and restart inside a clip.
- **Move the mouse slowly and deliberately.** Pause about 1 second before each click and 2 seconds on each result, so there is room to add a caption.
- **Don't cut the transaction waiting time.** Leave "Confirming on-chain…" in the recording. It gets sped up later.
- **No audio needed.** The voiceover is added afterwards.
- **Save files to** `D:\ramai\video\public\recordings\` with these exact names:
  `A-login-interests.mp4`, `B-create-event.mp4`, `C-discover.mp4`, `D-rsvp.mp4`, `E-checkin-refund.mp4`, `F-noshow.mp4`

Things to keep **off** screen: `.env.local`, the Privy dashboard and app secret, private keys, personal tabs, notifications. Use a demo email address for the login, because the email is visible in Clip A.

Do **not** click the wallet address button in the top-right of the app while recording. It signs you out.

---

## 3. Setup before you record

Do all of this first. None of it is recorded.

1. **App running:** `cd D:\ramai\web` then `pnpm dev`. Check that `web/.env.local` has the Privy App ID, `PRIVY_APP_SECRET`, both contract addresses and the AI key.
2. **Two accounts, in two separate browser profiles** (or one normal window and one incognito window):
   - **Organizer** — one email.
   - **Participant** — a different email.
3. **Fund both wallets with tBNB** from the BNB testnet faucet. Both need gas; the participant also needs the stake (0.01 tBNB per RSVP, so at least 0.03 tBNB to be safe).
4. **Write down both full wallet addresses.** The app only shows the short form (`0x1234…abcd`). Get the full address from the Privy dashboard (Users), or from the *From* field of any transaction on BscScan. The organizer needs the participant's full address for check-in.
5. **Create Event B (the no-show event) now, as the organizer:**
   - Title: something like "Sunday Board Games".
   - Start time: 2 minutes from now. Check-in deadline: **5 minutes from now**. Stake: 0.01.
   - Then, as the participant, **RSVP to Event B** before those 5 minutes pass. Do not check them in.
   - By the time you reach Clip F the deadline has passed, which is what that clip needs.
6. **Open a BscScan testnet tab** on the RamaiEvents contract:
   `https://testnet.bscscan.com/address/0x0FBA1927De712757cDB75264d5700cF239cCa992`
7. **Log the participant out** of the app, so Clip A can start from the login screen.

Record the clips **in order A → F**. Each one depends on the one before it.

---

## 4. What to record, step by step

### Clip A — Login and interests · `A-login-interests.mp4`
**Account:** Participant. **Start:** landing page `/`, logged out. **Raw length:** about 45–60 s.

1. Hold on the landing page for 2 seconds.
2. Click **Continue with email**. Type the email, enter the verification code.
3. Wait until the top-right button shows a wallet address. Hold 2 seconds.
4. Click **Interests** in the nav.
5. Type a display name. In *Interests* type: `futsal, casual sports, beginners`.
6. Hold 1 second so the chips are visible, then click **Save interests**.
7. Hold 2 seconds on "Saved ✓ — your discovery is now personalized."

**Must be visible:** the email login modal, the wallet address appearing with no seed phrase or extension, the interest chips, the "Saved ✓" message.

---

### Clip B — Organizer creates an event with AI · `B-create-event.mp4`
**Account:** Organizer (already logged in). **Start:** `/create`, empty form. **Raw length:** about 60–90 s.

1. Hold on the empty form for 2 seconds.
2. In the **Draft with AI** box, type slowly:
   `Casual 5-a-side futsal in Yogyakarta for beginners, Saturday evening`
3. Click **Draft with AI**. Wait for the form to fill. Hold 3 seconds on the filled form.
4. Scroll down slowly. Set **Start time** to about 20 minutes from now and **Check-in deadline** to about **40 minutes from now** (you need this window for clips C, D and E).
5. Set **RSVP stake** to `0.01` and **Capacity** to `12`.
6. Click **Create event**. Approve the transaction.
7. Keep recording through "Confirm the transaction…", "Waiting for confirmation on BNB Smart Chain…", "Saving event details…".
8. When the new event page opens, hold 3 seconds.

**Must be visible:** the one sentence being typed, the form filling itself in, the stake and capacity fields, the three status messages, the finished event page. This is **Event A**; note its number from the URL (`/events/<number>`).

---

### Clip C — Participant discovers the event · `C-discover.mp4`
**Account:** Participant. **Start:** `/events`. **Raw length:** about 45–60 s.

1. Open **Discover**. Wait for the cards to load. Hold 3 seconds on "Picked for you".
2. Move the mouse over the futsal event card. Hold 3 seconds on the **match** badge and the italic reason line.
3. Click the card to open the event page. Hold 2 seconds on the info card (location, starts, stake, guest list).
4. Scroll to **Ask about this event**. Click the suggestion **"How does the stake work?"**
5. Wait for the answer. Hold 3 seconds on it.

**Must be visible:** the title "Picked for you", the green **match** badge, the reason sentence, the AI answer.

If the page says "Discover events" instead of "Picked for you", the interests were not saved or you are not logged in. Fix that before recording.

---

### Clip D — RSVP with a stake · `D-rsvp.mp4`
**Account:** Participant. **Start:** Event A page, scrolled so the RSVP button and the guest-list dots are both visible. **Raw length:** about 30–45 s.

1. Hold 2 seconds on the button **RSVP · stake 0.01 tBNB**.
2. Click it. Approve the transaction.
3. Keep recording through "Reserving your spot…" and "Confirming on-chain…".
4. Hold 3 seconds on "You're in. See you there." and "You're on the guest list."

**Must be visible:** the stake amount on the button, the status messages, the guest-list dots going from 0 to 1.

---

### Clip E — Check-in, proof, refund, reputation · `E-checkin-refund.mp4`
**Accounts:** Organizer first, then Participant. Record both windows in **one file** by switching windows, or record two files named `E1-checkin.mp4` and `E2-refund.mp4`. **Raw length:** about 90–120 s in total.

**Part 1 — Organizer**
1. Open **Organizer**. Hold 2 seconds on the list of events.
2. On the Event A card, paste the **participant's full wallet address** into **Check in attendee**.
3. Click **Check in**. Approve the transaction. Wait for **Done ✓**. Hold 2 seconds.

**Part 2 — Proof on BscScan**
4. Switch to the BscScan tab. Refresh it. Hold 3 seconds on the newest transaction, with the method **Check In** visible.

**Part 3 — Participant**
5. Switch to the participant window. Before refreshing, hold 2 seconds on the nav bar so the **★ number** is visible.
6. Refresh the Event A page. Hold 3 seconds on **"Attendance verified · reputation earned"**. The ★ number should now be one higher.
7. Click **Get your stake back**. Approve the transaction.
8. Hold 3 seconds on "Stake back in your wallet." and "Stake returned. ★ reputation +1."

**Must be visible:** "Done ✓" for the organizer, the Check In transaction on BscScan, the ★ number before and after, "Attendance verified", the stake coming back.

Do this before Event A's check-in deadline passes. After the deadline, check-in is rejected.

---

### Clip F — No-show: the stake is forfeited (optional) · `F-noshow.mp4`
**Account:** Organizer. **Start:** `/organizer`. **Raw length:** about 30 s. **Needs:** Event B's deadline has already passed.

1. On the **Event B** card, paste the participant's full wallet address into **Settle no-shows (after deadline)**.
2. Click **Settle**. Approve the transaction. Wait for **Done ✓**. Hold 2 seconds.
3. Switch to BscScan, refresh, and hold 3 seconds on the **Settle No Shows** transaction.

**Must be visible:** the settle field, "Done ✓", the transaction on BscScan.

---

## 5. Order and timing on recording day

| Step | What | Clock |
|---|---|---|
| 1 | Setup: fund wallets, create Event B, participant RSVPs to Event B, log participant out | T+0 |
| 2 | Clip A | T+5 min |
| 3 | Clip B (creates Event A, deadline 40 min ahead) | T+10 min |
| 4 | Clip C | T+15 min |
| 5 | Clip D | T+20 min |
| 6 | Clip E (must finish before Event A's deadline) | T+25 min |
| 7 | Clip F (Event B's deadline passed long ago) | T+35 min |

If a clip goes wrong, record it again. For Clip B or D that means a new event or a new RSVP, so keep enough tBNB in both wallets.

---

## 6. After recording

1. Put the files in `D:\ramai\video\public\recordings\` with the names above.
2. Tell me the Event A number and roughly where the key moment is in each clip, if you noticed it.
3. I trim each clip, speed up the waiting, add the browser frame, captions and zooms, then build the closing scene.
4. The voiceover script is written once the cut is locked, so the AI voice matches the final timing.

---

## 7. What not to claim in the video

- There is **no QR check-in**. The organizer pastes the participant's wallet address.
- It is **not gasless**. Wallets need tBNB.
- It runs on **BSC Testnet**, not mainnet.
- Reputation is an on-chain attendance **counter**, not a token.

---

## 8. Voice, subtitles and music

- **Voice:** ElevenLabs, voice "Brian", generated per scene by `node scripts/voiceover.mjs`. The script text lives in that file. Output: `public/voiceover/*.mp3` and `src/voiceover.json` (word timings, used for the subtitles). Needs `ELEVENLABS_API_KEY` in `video/.env`.
- **Subtitles:** built from the word timings and shown at the bottom of the frame (`src/lib/Narration.tsx`). Each sentence starts on the frame listed in `cues` in `src/Root.tsx`.
- **Music:** "Instrumental Minimal" by The_Mountain, from Pixabay (Pixabay Content License). It is not stored in the repo. To render, download it from
  https://pixabay.com/music/corporate-instrumental-minimal-522469/
  and save it as `video/public/music/instrumental-minimal.mp3`. The music is lowered automatically while the voice is speaking.
- **Footage:** raw recordings go in `video/public/` (not tracked). `bash scripts/cut.sh` trims and crops them into `public/cuts/`.

---

## 9. Setting up on another machine

Needs Node 20+, pnpm and ffmpeg on the PATH.

1. `cd video` then `pnpm install`.
2. Download the music (link in section 8) and save it as `public/music/instrumental-minimal.mp3`. Without it the preview and the render fail on the missing file.
3. `pnpm run dev` opens Remotion Studio. Pick **RamaiDemo** for the whole film, or one scene under **Scenes**.
4. `pnpm run render:final` renders the film and normalises the loudness to about -15 LUFS. Output: `out/ramai-demo.mp4`. A plain `npx remotion render` gives a much quieter mix.

The trimmed footage (`public/cuts/`) and the voice files (`public/voiceover/`) are in the repo, so steps 1 to 4 are enough to edit and render.

Only needed for specific changes:
- **Changing the narration:** edit the text in `scripts/voiceover.mjs`, put an `ELEVENLABS_API_KEY` in `video/.env`, run `node scripts/voiceover.mjs <scene>`. Then adjust that scene's `cues` in `src/Root.tsx` if the timing moved.
- **Re-cutting footage:** needs the raw recordings in `public/` (not in the repo, about 270 MB). Ask whoever recorded them.

Where things are:

| To change | Edit |
|---|---|
| Scene order, voice cue frames, music volume | `src/Root.tsx` |
| Text and timing of the animated scenes | `src/scenes/Hook.tsx`, `Intro.tsx`, `Onboarding.tsx`, `NoShow.tsx`, `Closing.tsx` |
| Headline, chip words, icons and zooms on the recorded steps | `src/scenes/steps.ts` |
| Browser window, its tilt and the floating chips | `src/scenes/Walkthrough.tsx` |
| Subtitle look | `src/lib/Narration.tsx` |
| Colours and fonts | `src/lib/theme.ts` |
| Icons | `src/lib/icons.tsx` |

House rule for on-screen text: the narration and subtitles do the explaining. A scene gets one headline of a few words, and everything else is an icon, an animation or a chip of two or three words. Do not add sentences or paragraphs to the picture.

Preview has no sound if Internet Download Manager is installed: it intercepts the audio files from `localhost`. Add `localhost` to IDM's exclusions or disable its browser extension.
