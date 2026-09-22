# Ramai — Security Audit

Analisis risiko lintas smart contract, AI, dan aplikasi. Severity: Critical / High / Medium / Low.

## Smart Contract

| # | Risiko | Severity | Mitigasi |
|---|---|---|---|
| 1 | **Reentrancy** pada refund/settle (`cancelRSVP`, `claimRefund`, `settleNoShows`) | High | Checks-Effects-Interactions; `nonReentrant`; refund model **pull**; set flag `settled` sebelum transfer |
| 2 | **Fake attendance / self check-in** | High | `checkIn` butuh signature organizer; relay verifikasi sebelum tulis on-chain; kontrak batasi pemanggil = organizer/relay |
| 3 | **Signature replay** pada check-in | High | Signature mengikat `(eventId, attendee, nonce/deadline)`; nonce dicek unik & tak bisa dipakai ulang |
| 4 | **Sybil** (akun palsu farming reputasi) | High | Binding email + wallet; stake RSVP menaikkan biaya; reputasi hanya dari check-in terverifikasi; (future) proof identitas ringan |
| 5 | **Double RSVP / double refund** | Medium | Flag `joined/checkedIn/settled` di struct RSVP |
| 6 | **Organizer griefing** (tak pernah check-in agar stake hangus) | High | `checkInDeadline`; kebijakan forfeit transparan; **mitigasi utama = check-in dua sisi + reputasi organizer (future)**; untuk demo, forfeit default ke organizer diberi disclaimer |
| 7 | **Gas limit pada `settleNoShows` batch** | Medium | Proses per-array dengan batas panjang; bisa dipanggil bertahap |
| 8 | **Dana terkunci saat bug** | Medium | Pausable hanya menghentikan `joinEvent`; `claimRefund`/`cancelRSVP` tetap jalan saat paused |
| 9 | **Front-running** | Low | Alur RSVP/check-in tak sensitif terhadap urutan bernilai; kapasitas dicek atomik di kontrak |
| 10 | **Metadata jahat (link/script di deskripsi)** | Medium | Deskripsi off-chain; sanitasi & escape di render; tidak dieksekusi |

## AI

| # | Risiko | Severity | Mitigasi |
|---|---|---|---|
| 11 | **Prompt injection** via teks event/niat organizer | Medium | Teks user diperlakukan sebagai data; structured output; LLM tanpa akses tool dari teks user |
| 12 | **Manipulasi rekomendasi** (keyword stuffing) | Medium | Ranking **deterministik**; LLM hanya menjelaskan, tak mengubah skor; embedding menangkap makna |
| 13 | **Kebocoran data via output AI** | Medium | LLM hanya diberi data minimal yang perlu (tag, bukan PII penuh) |
| 14 | **Halusinasi alasan** | Low | Alasan dibatasi pada data yang diberikan; template + guardrail |

## Aplikasi / Infra

| # | Risiko | Severity | Mitigasi |
|---|---|---|---|
| 15 | **API abuse / spam event** | Medium | Rate limiting; batas event per akun; quality gate AI (opsional) |
| 16 | **Kebocoran rahasia** (private key deploy, API key) | High | Rahasia hanya di server/env; tidak pernah di client; jangan commit `.env` |
| 17 | **Akses data lintas user** | High | Supabase RLS: user hanya baca datanya; data event hanya untuk organizer terkait |
| 18 | **Relay disalahgunakan** (check-in palsu) | High | Relay hanya menandatangani setelah verifikasi signature organizer; relay tak bisa check-in tanpa sig organizer |
| 19 | **Kehilangan akses wallet (embedded)** | Medium | Recovery via email SDK; edukasi backup; nilai stake kecil membatasi kerugian |
| 20 | **Privasi lokasi/PII** | High | PII & lokasi presisi off-chain; on-chain hanya ID/flag |

## Ringkasan Prioritas

Fokus utama untuk hackathon (yang benar-benar dites):
1. Reentrancy + double-spend (kontrak) — **wajib** ada test.
2. Signature check-in aman dari replay + hanya organizer/relay.
3. RLS & pemisahan data user.
4. Rahasia tidak bocor ke client.

Diakui sebagai **batasan** (bukan diselesaikan penuh di MVP): griefing organizer dan Sybil kuat — jalur perbaikan = check-in dua sisi, reputasi organizer, proof identitas ringan. Lihat [README — Batasan](../README.md#batasan-yang-diketahui).
