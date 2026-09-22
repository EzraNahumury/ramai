# Ramai — Product Spec

## Ringkasan 30 Detik

Ramai adalah platform event consumer yang menyelesaikan dua masalah sekaligus: **organizer susah mengisi event** dan **peserta susah menemukan event yang cocok**. AI mencocokkan event dengan peserta yang tepat dan menjelaskan alasannya; RSVP dengan **stake refundable on-chain** membunuh no-show; kehadiran menjadi **reputasi soulbound** yang portabel dan bikin match berikutnya makin akurat. Di atas BNB Smart Chain, tapi blockchain-nya tak terlihat oleh user biasa.

## Masalah

Lihat [README](../README.md#masalah). Inti: discovery buruk, RSVP tak serius, tidak ada trust layer setelah event.

## Target User

**Primary — Peserta (18–35, urban Indonesia):** aktif di komunitas kecil-menengah (olahraga santai, board game, musik, tech meetup, hobi). Mau ketemu orang baru tapi lelah dengan grup chat berisik dan event yang ternyata sepi/tidak cocok.

**Primary — Micro-organizer:** orang yang rutin bikin event kecil (futsal mingguan, meetup komunitas, gathering) dan kesulitan mengisi kursi dengan orang yang tepat + capek di-ghosting no-show.

**Secondary:** komunitas/brand yang ingin sinyal kehadiran tepercaya; peserta yang ingin membangun "rekam jejak sosial" yang bisa dibawa.

## Nilai Inti (Value Props)

| Untuk | Nilai |
|---|---|
| Peserta | Nemu event yang beneran cocok + tahu kenapa cocok; reputasi kehadiran yang dimiliki sendiri |
| Organizer | Event terisi orang relevan; no-show turun karena ada komitmen nyata; guest list tepercaya |
| Ekosistem | Data kehadiran jujur yang bikin matching makin baik seiring waktu |

## Fitur (dengan prioritas MVP)

Notasi: 🟥 MUST · 🟧 SHOULD · 🟨 NICE · ⬛ JANGAN DIBANGUN (untuk hackathon)

| Fitur | Prioritas | Catatan |
|---|---|---|
| Login email + embedded wallet | 🟥 | Tanpa seed phrase untuk alur inti |
| Set minat + embedding profil | 🟥 | Dasar matching |
| AI bikin event dari 1 kalimat | 🟥 | Demo beat #1 |
| Discovery ranking AI + alasan cocok | 🟥 | Demo beat #2 |
| RSVP stake on-chain (opsional) | 🟥 | Justifikasi Web3 #1 |
| Check-in + konfirmasi on-chain | 🟥 | Demo beat #3 |
| Refund otomatis + reputasi soulbound | 🟥 | Momen aha |
| Dashboard organizer (guest list, check-in) | 🟥 | Kontrol organizer |
| Settle no-show | 🟧 | Melengkapi loop stake |
| Batal RSVP + refund | 🟧 | Keadilan peserta |
| Anti-spam/quality gate AI | 🟨 | Kalau sempat |
| Waitlist + smart fill | 🟨 | Future |
| Reputasi organizer | 🟨 | Future |
| Referral / social graph | ⬛ | Scope creep |
| Token / DAO / NFT marketplace | ⬛ | Tidak perlu, menambah risiko |
| Chat / social feed in-app | ⬛ | Bukan diferensiasi |
| Multi-chain | ⬛ | Tidak perlu untuk demo |

## MVP Scope (Ruthless)

**MUST BUILD (untuk demo end-to-end):**
1. Auth email + embedded wallet.
2. Profil minat.
3. AI event creation (1 kalimat → event).
4. Discovery + matching + alasan.
5. RSVP staked on-chain.
6. Check-in on-chain (sig organizer via relay).
7. Refund + reputasi soulbound.
8. Dashboard organizer minimal.

**SHOULD:** settle no-show, cancel RSVP.

**NICE:** anti-spam AI, waitlist.

**DO NOT BUILD:** token, DAO, NFT marketplace, chat, feed, multi-chain, reputasi decay kompleks, infra rekomendasi berat.

## Diferensiasi (yang bisa kita "miliki")

1. **Komitmen + reputasi yang benar-benar on-chain dan portabel** — bukan skor internal. Organizer manapun di Ramai bisa memverifikasi rekam jejak hadir kamu.
2. **Matching yang explainable** — bukan feed hitam-kotak; tiap rekomendasi ada alasannya, membangun trust consumer.

Kompetitor (Luma, Partiful, Meetup, Eventbrite) kuat di pembuatan & tiket, lemah di **matching peserta yang tepat** dan **komitmen anti no-show yang trustless**. Itu whitespace kita. Lihat tabel perbandingan di bawah.

## Perbandingan Kompetitor (ringkas)

| Kapabilitas | Ramai | Luma | Partiful | Meetup | Eventbrite |
|---|---|---|---|---|---|
| Bikin event cepat | ✅ (AI) | ✅ | ✅ | ✅ | ✅ |
| AI matching peserta | ✅ | ❌ | ❌ | ~ (grup) | ❌ |
| Alasan rekomendasi | ✅ | ❌ | ❌ | ❌ | ❌ |
| Komitmen anti no-show (trustless) | ✅ stake on-chain | ❌ | ❌ | ❌ | ~ (tiket bayar) |
| Bukti kehadiran verifiable | ✅ on-chain | ❌ | ❌ | ❌ | ❌ |
| Reputasi portabel | ✅ soulbound | ❌ | ❌ | ~ (internal) | ❌ |
| UX non-crypto | ✅ embedded wallet | ✅ | ✅ | ✅ | ✅ |

## Business Model (tidak dipaksakan)

Realistis pasca-hackathon: **organizer premium** (analitik + boost matching), **event promotion** (surface berbayar ke segmen relevan), **fee kecil pada event ber-tiket**. Tidak ada tokenomics buatan. Stake RSVP **bukan** revenue — itu dikembalikan ke peserta.

## Metrik Sukses (post-MVP, bukan klaim demo)

- Aktivasi: % user yang set minat lalu RSVP pertama.
- Komitmen: rasio check-in / RSVP (target: staked > gratis).
- Retensi: % peserta yang RSVP event kedua dalam 30 hari.
- Sisi supply: event dibuat per organizer per bulan.

> Tidak ada metrik/traction/user palsu. Angka di atas adalah target yang akan diukur, bukan hasil.
