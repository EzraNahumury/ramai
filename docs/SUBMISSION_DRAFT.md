# Ramai — Submission Draft

Draft siap-tempel untuk form submission resmi (indonesiaweb3hack.xyz). Field mengikuti FAQ Q5. Isi placeholder `[…]` sebelum submit.

> Cek [HACKATHON_REQUIREMENTS](./HACKATHON_REQUIREMENTS.md) untuk compliance checklist. Deadline **30 Sep 2026, 23:59 WIB.**

---

## Nama Tim / Proyek
**Ramai**
Tim: `[Nama tim]`

## Track
**Consumer Apps** (social, gaming and loyalty with seamless UX).
`[Opsional: tandai juga lintas-track bila form mengizinkan, untuk peluang Grand Prize.]`

## One-liner
Ramai bikin event beneran keisi — dan beneran dateng: AI mencocokkan event dengan orang yang tepat, stake RSVP on-chain membunuh no-show, dan kehadiran jadi reputasi yang kamu miliki.

## Problem Statement
Bikin event itu mudah; mengisinya dengan orang yang tepat dan memastikan mereka datang itu sulit. Discovery buruk (link disebar ke WhatsApp/IG/Telegram, berharap orang tepat lihat), RSVP tidak berarti (orang klik "Hadir" gratis lalu no-show), dan tidak ada trust layer setelah event. No-show adalah pembunuh nomor satu event komunitas.

## Solution
Ramai menyerang masalah "peserta yang tepat" dari hulu ke hilir:
1. **AI bikin event** dari satu kalimat (judul, deskripsi, kategori, copy undangan).
2. **AI mencocokkan peserta** berbasis minat + menjelaskan "kenapa cocok buat kamu".
3. **RSVP komitmen on-chain**: stake kecil yang **balik kalau datang**, hangus kalau no-show — sesuatu yang database biasa tak bisa lakukan trustless.
4. **Kehadiran terverifikasi → reputasi soulbound** yang portabel lintas organizer dan bikin match berikutnya makin akurat.

Blockchain tak terlihat: login email, embedded wallet otomatis, tanpa gas/seed phrase di alur inti.

## Deskripsi Detail Proyek
Ramai adalah platform event consumer di atas BNB Smart Chain. Dua primitif Web3 yang benar-benar butuh blockchain: (a) **escrow stake RSVP** — dana ditahan & dilepas oleh kontrak, bukan janji platform; (b) **reputasi kehadiran soulbound** — portabel, bisa diverifikasi, dimiliki user, bukan skor internal yang terkurung di satu perusahaan. Semua data kaya & privat (profil, minat, embedding AI, media event) tetap off-chain demi biaya, kecepatan, dan privasi. AI menjalankan dua fungsi nyata: menyusun event dari niat satu kalimat, dan me-ranking + menjelaskan rekomendasi (ranking deterministik, LLM hanya menjelaskan — tahan manipulasi). Arsitektur, skema kontrak, skema DB, dan audit keamanan ada di repo (`docs/`).

## Why Web3 / Why BNB Chain
Hanya dua mekanisme yang butuh blockchain — escrow komitmen & reputasi portabel; sisanya sengaja off-chain. BNB Smart Chain / opBNB dipilih karena **fee rendah bikin micro-stake refundable masuk akal** sebagai produk consumer, tooling EVM matang (Hardhat/viem/wagmi) sehingga lapisan on-chain kecil & auditable, dan finalitas cepat agar check-in terkonfirmasi saat event berlangsung.

## Komponen AI
- **Event Creation Assistant** — niat 1 kalimat → event terstruktur + copy (structured output).
- **Explainable Matching** — embedding minat & event (pgvector), ranking deterministik (similarity × jadwal × reputasi), LLM hanya membuat alasan per rekomendasi. (AI tidak wajib di track Consumer Apps → ini nilai tambah.)

## Arsitektur Teknis (ringkas)
Frontend Next.js/React/Tailwind (mobile-first) · embedded wallet (login email) · backend Next.js API + indexer on-chain + relay check-in · Postgres/Supabase + pgvector · LLM + embeddings · kontrak Solidity (`RamaiEvents`, `RamaiReputation`) di BSC Testnet via Hardhat. Detail: `docs/TECHNICAL_ARCHITECTURE.md`.

## Key Features
- Bikin event dari 1 kalimat (AI)
- Discovery berbasis minat + alasan cocok
- Login email + embedded wallet (tanpa seed phrase)
- Stake RSVP on-chain refundable
- Check-in + konfirmasi kehadiran on-chain
- Reputasi kehadiran soulbound portabel
- Dashboard organizer (guest list, check-in, no-show)

## Impact
Menargetkan pembunuh nyata event komunitas Indonesia: no-show & discovery buruk. Komitmen ekonomis kecil + matching relevan menaikkan turnout dan kualitas; reputasi portabel membangun trust lintas komunitas — aset yang tak bisa ditiru app event terpusat.

## Roadmap Singkat
MVP (hackathon): create→RSVP staked→check-in→refund→reputasi end-to-end di testnet. Pasca: opBNB, relay gasless, reputasi organizer, waitlist smart-fill, referral. Detail: `docs/DEVELOPMENT_ROADMAP.md`.

## GitHub
`[https://github.com/<user-or-org>/ramai]` — repo publik, berisi kode + `docs/`.

## Contract Address
| Kontrak | Jaringan | Alamat |
|---|---|---|
| `RamaiEvents` | BSC Testnet (chainId 97) | `[0x… setelah deploy]` |
| `RamaiReputation` | BSC Testnet (chainId 97) | `[0x… setelah deploy]` |

## Demo Video
`[link publik ≤5 menit]` — naskah: `docs/DEMO_SCRIPT.md`.

## Pitch Deck
`[link deck — siapkan jaga-jaga; konfirmasi wajib/tidak ke panitia]`

## Tim
| Nama | Peran | Kontak/handle |
|---|---|---|
| `[…]` | `[…]` | `[…]` |

(Disarankan 2–5 orang; solo diperbolehkan.)

## Contract Description (untuk field terkait)
`RamaiEvents` — registry event + escrow stake RSVP + check-in ber-signature organizer; fungsi utama: `createEvent`, `joinEvent` (payable), `cancelRSVP`, `checkIn`, `claimRefund`, `settleNoShows`. `RamaiReputation` — counter reputasi kehadiran soulbound (non-transferable), hanya bisa ditulis oleh `RamaiEvents` saat check-in terverifikasi. Detail: `docs/SMART_CONTRACT_SPEC.md`.

---

## Catatan Pra-Submit
- Registrasi Luma **dulu**.
- Deploy kontrak → isi contract address.
- Repo GitHub publik + README (sudah siap).
- Rekam video ≤5 mnt, host di link publik.
- Konfirmasi ke panitia: pitch deck wajib?, format video, submission per tim, verify kontrak. Lihat tabel PERLU KONFIRMASI di `docs/HACKATHON_REQUIREMENTS.md`.
- Submit sebelum 30 Sep 2026 23:59 WIB; pakai edit code untuk revisi.
