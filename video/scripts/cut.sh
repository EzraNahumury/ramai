#!/usr/bin/env bash
# Cuts the raw screen recordings in public/ into short, cropped, constant-30fps
# segments in public/cuts/, and writes src/cuts.json with each segment's length.
#
#   bash scripts/cut.sh
#
# Each row: name | source | start(s) | end(s) | speed | crop w:h:x:y (source px, 1920x1020)
# Crops remove the browser chrome/bookmarks and frame only the app column.
set -euo pipefail
cd "$(dirname "$0")/.."

PAGE="1200:675:385"     # app pages (create / event / discover), 16:9
ORG="1040:585:465"      # organizer page (narrower, keeps the footer out)
BSC="1422:800:70"      # BscScan transactions table

SEGMENTS=(
  # --- Scene 4: organizer creates an event with AI (clip B)
  "b1-draft|B-create-event.mp4|3.5|11.5|1.6|$PAGE:105"
  "b2-filled|B-create-event.mp4|11.5|15|1|$PAGE:105"
  "b3-rules|B-create-event.mp4|28|35.5|1.5|$PAGE:150"
  "b4-creating|B-create-event.mp4|35.5|52|4|$PAGE:345"
  "b5-event|B-create-event.mp4|65|68.5|1|$PAGE:105"
  # --- Scene 5: participant discovers it (clip C)
  "c1-picked|C-discover.mp4|0|5.5|1.1|$PAGE:105"
  "c2-event|C-discover.mp4|10.4|13|1|$PAGE:150"
  "c3-thinking|C-discover.mp4|13|19.3|3.5|$PAGE:150"
  "c4-answer|C-discover.mp4|19.3|23.2|1|$PAGE:150"
  # --- Scene 6: RSVP with a stake (clip D)
  "d1-button|D-rsvp.mp4|6.5|9.5|1|$PAGE:195"
  "d2-reserving|D-rsvp.mp4|9.5|15.5|3|$PAGE:195"
  "d3-guestlist|D-rsvp.mp4|15.5|19.5|1|$PAGE:195"
  # --- Scene 7: check-in, on-chain proof, refund (clips E1-E3)
  "e1-paste|E-checkin-refund-part1.mp4|7|13|1.5|$ORG:105"
  "e2-confirm|E-checkin-refund-part1.mp4|16|24.5|3|$ORG:105"
  "e3-done|E-checkin-refund-part1.mp4|24.5|27.5|1|$ORG:105"
  "e4-bscscan|E-checkin-refund-part2.mp4|10.5|16|1.2|$BSC:105"
  "e5-verified|E-checkin-refund-part3.mp4|6.5|9.3|1|$PAGE:195"
  "e6-returning|E-checkin-refund-part3.mp4|9.3|19.5|4|$PAGE:195"
  "e7-returned|E-checkin-refund-part3.mp4|19.5|23|1|$PAGE:195"
)

mkdir -p public/cuts
echo "{" > src/cuts.json
first=1
for row in "${SEGMENTS[@]}"; do
  IFS='|' read -r name src start end speed crop <<< "$row"
  out="public/cuts/$name.mp4"
  ffmpeg -v error -y -ss "$start" -to "$end" -i "public/$src" -an \
    -vf "crop=$crop,setpts=PTS/$speed,fps=30,scale=1600:900:flags=lanczos,format=yuv420p" \
    -c:v libx264 -crf 17 -preset medium -movflags +faststart "$out"
  frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$out")
  [ $first -eq 1 ] || echo "," >> src/cuts.json
  first=0
  printf '  "%s": %s' "$name" "$frames" >> src/cuts.json
  echo "$name  ${frames}f"
done
printf '\n}\n' >> src/cuts.json
