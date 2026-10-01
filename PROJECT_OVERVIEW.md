# Ramai — Ringkasan Proyek

> Dokumen ini merangkum pemahaman atas proyek **Ramai**: tujuan, alur, arsitektur, isi kode, status implementasi, dan hal-hal penting lain. Disusun dari pembacaan langsung `README.md`, `docs/`, `contracts/`, dan `web/` (per 30 September 2026).
> Bagian **"Blueprint vs Implementasi"** membedakan apa yang tertulis di dokumen desain dengan apa yang benar-benar ada di kode.

---

## 1. Ramai itu apa?

**Ramai** adalah platform event untuk konsumen (consumer app) dengan tagline:

> *"Bikin event yang beneran keisi — dan yang RSVP-nya beneran dateng."*

Tiga ide inti:

1. **AI** membantu organizer membuat event dan mencocokkan event ke orang yang tepat, lengkap dengan alasan "kenapa cocok buat kamu".
2. **RSVP dengan stake on-chain** (deposit kecil yang bisa dikembalikan). Datang → stake balik. Tidak datang → stake hangus. Ini mengubah "mungkin datang" jadi komitmen nyata.
3. **Kehadiran terverifikasi jadi reputasi soulbound** (tidak bisa dipindahkan) yang dibawa user lintas organizer.

Blockchain sengaja dibuat **tak terlihat**: user login pakai email, wallet dibuat otomatis (embedded wallet), tanpa seed phrase untuk alur inti.

## 2. Konteks: untuk apa proyek ini dibuat?

| Item | Detail |
|---|---|
| Acara | **Indonesia Web3 Hackathon 2026** (#WhereBuildersBuild, AI × Web3) |
| Penyelenggara | Binance Academy, BNB Chain, Coinvestasi, Dev Web3 Jogja |
| Track | **Consumer Apps** (social, gaming, loyalty dengan UX mulus) |
| **Deadline submission** | **30 September 2026, 23:59 WIB** (hari ini) |
| Pengumuman finalis | 14 Oktober 2026 |
| Demo Day | 31 Oktober 2026 |
| Hadiah track | 1st/2nd/3rd = $600 / $400 / $300; Grand Prize lintas track $1.000 |
| Syarat wajib | Smart contract di BNB Smart Chain / opBNB (testnet boleh), repo GitHub publik |
| Syarat disarankan | Video demo ≤ 5 menit |
| Penilaian | Inovasi, eksekusi teknis, potensi dampak, viabilitas bisnis, UX, kualitas presentasi |

Item yang **belum dikonfirmasi panitia** (ditandai `PERLU KONFIRMASI PANITIA` di docs, sengaja tidak dikarang): pitch deck wajib atau tidak, bobot kriteria, jumlah submission per tim, format/hosting video, apakah kontrak wajib verified di explorer.

## 3. Masalah yang diselesaikan

- **Organizer susah mengisi event.** Bikin event gampang, tapi menjangkau orang yang tepat sulit (sebar manual di WA/IG/Telegram).
- **Peserta tenggelam di noise.** Discovery event = feed algoritmik atau grup chat; menemukan yang cocok itu untung-untungan.
- **RSVP tidak bermakna.** Tap "Hadir" gratis → banyak no-show → organizer over-invite → kualitas turun. No-show adalah penyebab utama event komunitas kecil mati.
- **Tidak ada jejak setelah event.** Tidak ada bukti kehadiran atau reputasi yang portabel.
- Produk event Web3 yang ada menuntut wallet/gas/istilah teknis yang ditolak user awam.

## 4. Kenapa Web3 dan BNB Chain?

Hanya **dua** hal yang benar-benar butuh blockchain:

| Fitur | Alasan on-chain |
|---|---|
| Escrow stake RSVP | Dana ditahan & dilepas oleh kode, bukan janji platform. Saldo di database hanyalah IOU. |
| Reputasi kehadiran soulbound | Portabel lintas organizer, bisa diverifikasi independen, dimiliki user, tidak hilang jika platform tutup. |

Semua lainnya (profil, minat, pencarian, AI, deskripsi/media event) **off-chain**.

Kenapa BNB Chain: fee rendah membuat micro-stake masuk akal, tooling EVM matang (Hardhat, viem/wagmi), finalitas cepat. Demo memakai **BSC Testnet (chainId 97)**; opBNB opsional pasca-hackathon.

---

## 5. Alur pengguna (end-to-end)

```
Login email (Privy) → embedded wallet otomatis
   → set minat (/profile)
   → Discover: event di-ranking sesuai minat + alasan cocok (/events)
   → Detail event (/events/[id]) + chat AI tanya-jawab event
   → RSVP:  gratis (stake 0)  atau  stake tBNB (di-escrow kontrak)
   → Hari H: organizer check-in peserta (on-chain)
   → Peserta klaim refund stake  +  reputasi +1 (RamaiReputation)
   → (Kalau tidak hadir) setelah deadline, organizer settle no-show → stake hangus ke forfeitTo
```

### Alur organizer
1. Buka `/create`, ketik satu kalimat ide event → klik **Draft with AI** → form terisi (judul, deskripsi, kategori, lokasi, tag audiens).
2. Atur jadwal, stake (tBNB), kapasitas.
3. Submit → **satu transaksi** `createEvent` di kontrak → aplikasi membaca `eventId` dari log `EventCreated` → menyimpan metadata ke backend (`POST /api/events`) → redirect ke halaman event.
4. Di `/organizer`: daftar event miliknya; check-in attendee (isi alamat wallet) dan settle no-show (daftar alamat, setelah deadline).

### Alur peserta di halaman event
- Belum join → tombol **RSVP** (kirim `joinEvent` + `value = stake`).
- Sudah join → "You're on the guest list" + tombol **Cancel RSVP** (refund penuh sebelum deadline).
- Sudah di-check-in → "Attendance verified" + tombol **Get your stake back** (`claimRefund`).

---

## 6. Arsitektur

```
Browser (Next.js, mobile-first)
  ├─ Privy (login email + embedded wallet) ─┐
  ├─ wagmi/viem ── baca/tulis kontrak ──────┼──► BSC Testnet: RamaiEvents + RamaiReputation
  └─ fetch /api/* ──► Next.js API routes ───┘
                        ├─ store.ts  → Supabase (jika env di-set) ATAU file lokal .data/db.json
                        └─ ai.ts     → LLM OpenAI-compatible (OpenAI / Ollama)
```

**Prinsip:** off-chain untuk kerja berat, privat, dan cepat; on-chain hanya untuk yang butuh trust (escrow, kehadiran, reputasi). Event metadata di backend dikaitkan ke kontrak lewat `onchain_id`.

### Tech stack (sesuai `package.json`)
| Lapisan | Pilihan |
|---|---|
| Frontend | Next.js **16.3.5**, React 19.2, Tailwind 4 (font: Fraunces, Plus Jakarta Sans, JetBrains Mono) |
| Auth/Wallet | `@privy-io/react-auth` + `@privy-io/wagmi` (login `email` dan `wallet`, embedded wallet dibuat untuk user tanpa wallet) |
| Chain client | viem 2, wagmi 3, `@tanstack/react-query` |
| Backend | Next.js API routes (satu codebase) |
| Database | Supabase (Postgres) **atau** fallback file JSON lokal |
| AI | SDK `openai` (kompatibel Ollama lewat `AI_BASE_URL`), default model `gpt-4o-mini` |
| Kontrak | Solidity 0.8.24, Hardhat, OpenZeppelin 5 (`Ownable`, `ReentrancyGuard`) |

> Catatan penting: `web/AGENTS.md` memperingatkan bahwa ini **Next.js versi baru dengan breaking changes**. Baca panduan di `node_modules/next/dist/docs/` sebelum menulis kode Next.js.

---

## 7. Smart contract (`contracts/`)

### `RamaiEvents` — registry event + escrow stake + check-in
Struct `Event`: `organizer, stakeAmount, startTime, checkInDeadline, capacity (0 = tak terbatas), joinedCount, active, forfeitTo`.
Struct `RSVP`: `joined, checkedIn, settled, staked`.

| Fungsi | Siapa | Fungsi |
|---|---|---|
| `createEvent(stake, start, deadline, capacity, forfeitTo)` | siapa saja (jadi organizer) | Validasi `start < deadline` dan `deadline` di masa depan. `forfeitTo = 0` → organizer. |
| `joinEvent(id)` payable | peserta | `msg.value` harus = stake persis; cek aktif, belum lewat deadline, belum join, kapasitas. |
| `cancelRSVP(id)` | peserta | Refund penuh sebelum deadline (tidak bisa jika sudah check-in). |
| `checkIn(id, attendee)` / `checkInBatch` | **hanya organizer** | Tandai hadir sebelum/pada deadline; memanggil `RamaiReputation.recordAttendance` jika di-set. |
| `claimRefund(id)` | peserta yang sudah check-in | Stake dikembalikan. |
| `settleNoShows(id, attendees[])` | **hanya organizer**, setelah deadline | Stake no-show (joined, belum check-in, belum settled) dikirim ke `forfeitTo`. |
| `deactivateEvent(id)` | organizer | Hentikan RSVP baru (stake yang ada tidak terpengaruh). |
| `setReputation(addr)` | owner | Sambungkan kontrak reputasi. |

Pengamanan yang ada: `ReentrancyGuard` pada fungsi yang memindahkan dana, pola *checks-effects-interactions*, custom errors, transfer via `call` dengan cek hasil.

### `RamaiReputation` — reputasi soulbound
Bukan token ERC-721; berupa **counter per alamat** (`attendanceCount`) yang hanya bisa ditambah oleh kontrak `RamaiEvents` (`onlyEvents`). Tidak ada fungsi transfer sehingga otomatis non-transferable. Dibaca lewat `reputationOf(address)`.

### Deploy
`contracts/scripts/deploy.js` deploy Reputation → Events, lalu menyambungkan keduanya (`setEvents`, `setReputation`).

| Kontrak | Jaringan | Alamat |
|---|---|---|
| `RamaiEvents` | BSC Testnet (97) | `0x0FBA1927De712757cDB75264d5700cF239cCa992` |
| `RamaiReputation` | BSC Testnet (97) | `0x3072a5b043Ea67c4c597b1E2E82dD63a50aDA23D` |

Deployed 2026-09-27 (`contracts/deployments/bscTestnet.json`). Test: `contracts/test/ramai.test.js` (README menyebut 25 tes; file berisi sekitar 30 blok `it(` — jalankan `pnpm test` untuk angka pasti).

---

## 8. Web app (`web/`)

### Halaman (`src/app`)
| Route | Fungsi |
|---|---|
| `/` | Landing: hero jaringan animasi (canvas), penjelasan 3 langkah, CTA login / discover / host. |
| `/events` | Discover. Memanggil `/api/match`; jika user punya minat → "Picked for you" dengan badge *match* dan alasan AI. |
| `/events/[id]` | Detail event: metadata (backend) + state on-chain (kontrak), tombol RSVP/cancel/claim, chat AI. |
| `/create` | Form buat event + **Draft with AI** + transaksi `createEvent`. |
| `/organizer` | Dashboard: check-in attendee & settle no-show per event. |
| `/profile` | Set nama tampilan dan minat (dipisah koma). |

`providers.tsx`: gate mount client-only (Privy tidak bisa init saat prerender), layar setup jika `NEXT_PUBLIC_PRIVY_APP_ID` kosong, lalu `PrivyProvider → QueryClient → WagmiProvider` + Nav + Footer. Chain tunggal: BSC Testnet.

### API routes (`src/app/api`)
| Endpoint | Fungsi |
|---|---|
| `POST /api/ai/draft` | 1 kalimat → JSON `{title, description, category, location, audience_tags, invite_copy}`. |
| `POST /api/ai/ask` | Tanya-jawab satu event; jawaban hanya berdasar detail event (grounded), bahasa mengikuti pertanyaan. |
| `GET/POST /api/events` | List (filter `?organizer=`) dan upsert metadata event. |
| `GET /api/events/[id]` | Ambil satu event berdasarkan `onchain_id`. |
| `GET /api/match?wallet=` | Ranking event untuk minat user + alasan. |
| `GET/POST /api/profile` | Baca / simpan profil (`wallet`, `display_name`, `interests[]`). |

### Cara kerja AI (`src/lib/ai.ts`, `api/match`)
- **Draft event:** prompt sistem, `response_format: json_object`, temperature 0.7. Balasan mengikuti bahasa input (ID/EN). Input diperlakukan sebagai *data*, bukan instruksi (mitigasi prompt injection dasar).
- **Matching = dua tahap:**
  1. **Skor deterministik** (bukan LLM): tiap minat yang cocok persis dengan tag event +3; jika hanya muncul sebagai substring di kategori/judul/deskripsi +2.
  2. **LLM hanya menjelaskan**: untuk top 6 event dengan skor > 0, LLM menulis satu kalimat alasan per event. Jika AI gagal/tidak dikonfigurasi, ranking tetap jalan tanpa alasan.
  Tanpa minat → daftar biasa urut terbaru.
- **AI provider-agnostic:** `OPENAI_API_KEY` untuk OpenAI, atau `AI_BASE_URL=http://localhost:11434/v1` + `AI_MODEL=llama3.1` untuk Ollama.

### Penyimpanan metadata (`src/lib/store.ts`)
Dua backend, otomatis dipilih: **Supabase** jika `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` ada, jika tidak → file lokal `.data/db.json` (tanpa akun eksternal, enak untuk demo lokal). Tabel: `events` (kunci `onchain_id`, ada `tags text[]`) dan `profiles` (kunci `wallet`, `interests text[]`). Skema di `web/supabase/schema.sql`.

### Konfigurasi (`web/.env.local`)
`NEXT_PUBLIC_PRIVY_APP_ID`, `NEXT_PUBLIC_BSC_TESTNET_RPC_URL`, `NEXT_PUBLIC_RAMAI_EVENTS_ADDRESS`, `NEXT_PUBLIC_RAMAI_REPUTATION_ADDRESS`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`. Contoh ada di `.env.local.example`. `.env*` di-ignore git (kecuali `.example`).

---

## 9. Struktur repo

```
ramai/
├── README.md               Ringkasan produk, setup, roadmap, batasan (Bahasa Indonesia)
├── PROJECT_OVERVIEW.md     (dokumen ini)
├── docs/                   Blueprint & dokumen submission (11 file)
│   ├── HACKATHON_REQUIREMENTS.md   Audit aturan resmi + checklist
│   ├── SUBMISSION_DRAFT.md         Draft siap-tempel form submission
│   ├── PRODUCT_SPEC.md / USER_FLOWS.md / TECHNICAL_ARCHITECTURE.md
│   ├── SMART_CONTRACT_SPEC.md / AI_ARCHITECTURE.md / DATABASE_SCHEMA.md
│   └── SECURITY.md / DEVELOPMENT_ROADMAP.md / DEMO_SCRIPT.md
├── contracts/              Hardhat: src/*.sol, test/ramai.test.js, scripts/deploy.js, deployments/
└── web/                    Next.js: src/app (halaman + API), src/components, src/lib, src/abi, supabase/schema.sql
```

Riwayat commit terbaru fokus pada polesan UI: tema terang editorial, hero jaringan animasi canvas, footer global, form Create yang dikelompokkan, poles halaman discover/event/organizer/interests.

---

## 10. Blueprint vs Implementasi (jujur soal status)

Dokumen di `docs/` lebih ambisius daripada kode saat ini. Berikut selisih yang penting:

| Topik | Blueprint / docs | Yang ada di kode |
|---|---|---|
| Matching | Embeddings + pgvector, ranking vektor | **Belum.** Skor tag/substring deterministik; LLM hanya menulis alasan. Kolom `embedding` di schema masih dikomentari. |
| Indexer on-chain → DB | Backend meng-index event kontrak ke Postgres | **Belum.** UI membaca state RSVP/stake langsung dari kontrak; DB hanya metadata. |
| Relay check-in / signature | Check-in via relay, verifikasi tanda tangan | **Belum.** Organizer memanggil `checkIn` langsung dan mengetik alamat wallet peserta. |
| Check-in QR / kode | QR untuk peserta | **Belum ada UI QR.** |
| Guest list di dashboard | Guest list + hitung no-show | Dashboard hanya form check-in & settle manual (belum daftar peserta otomatis). |
| Reputasi | Soulbound ala ERC-5192 | Counter non-transferable sederhana (bukan token). Cukup untuk MVP, bukan standar ERC-5192. |
| Gasless | "Tak pernah lihat gas" | Embedded wallet tetap butuh tBNB untuk gas/stake; relay gasless masuk daftar pasca-hackathon. |
| Gerbang anti-spam AI | Opsional | Belum ada. |
| Jumlah tes | README: 25 | File tes berisi sekitar 30 blok `it(`. |
| Screenshot, link demo, tim | Placeholder di README | Masih `Menyusul` / `TBD` / placeholder. |

## 11. Catatan risiko & keamanan yang perlu diketahui

Dari pembacaan kode (di luar `docs/SECURITY.md`):

- **API tidak memverifikasi identitas.** `POST /api/events` dan `POST /api/profile` menerima `organizer`/`wallet` dari body tanpa bukti kepemilikan (tanpa verifikasi token Privy atau tanda tangan). Siapa pun bisa menulis metadata atas nama alamat lain. Kontrak sendiri aman (hak akses di on-chain), tapi metadata off-chain bisa dipalsukan/ditimpa.
- **Metadata event bisa tidak sinkron dengan kontrak.** `createEvent` di chain lalu `POST /api/events` terpisah; kalau langkah kedua gagal, event ada on-chain tanpa metadata (halaman akan menampilkan `Event #id`). Tidak ada retry/indexer.
- **`/api/ai/*` tanpa rate limit / auth** — potensi penyalahgunaan biaya API LLM.
- **Trust check-in bertumpu pada organizer.** Organizer bisa menolak check-in peserta jujur lalu men-settle stake-nya sebagai no-show (`forfeitTo` bisa organizer sendiri). Ini dicatat di README sebagai batasan yang diketahui; rencana: check-in dua sisi / kode ber-geofence.
- **Stake bisa terkunci bila organizer tidak aktif:** setelah deadline, hanya organizer yang bisa `settleNoShows`; peserta yang tidak di-check-in maupun di-settle tidak punya jalur refund sendiri.
- **Ketahanan Sybil** hanya bertumpu pada email + stake, bukan proof identitas.
- **Rahasia:** `web/.env.local` ada di disk (di-ignore git). Jangan di-commit; kunci `SUPABASE_SERVICE_ROLE_KEY` dan `OPENAI_API_KEY` bersifat server-only.
- Kontrak belum diaudit profesional; deploy hanya di testnet.

## 12. Cara menjalankan (ringkas)

```bash
# Kontrak
cd contracts && pnpm install && cp .env.example .env   # isi DEPLOYER_PRIVATE_KEY (wallet test)
pnpm test
pnpm deploy:testnet

# Web
cd web && pnpm install && cp .env.local.example .env.local   # isi variabel
pnpm dev          # atau: pnpm build untuk typecheck + build
```

Prasyarat: Node 20+, pnpm, tBNB dari faucet BNB testnet, app ID Privy, (opsional) Supabase, API key OpenAI atau Ollama lokal.

## 13. Demo ≤ 5 menit (aha moment)

1. Organizer mengetik satu kalimat → AI membangun event secara live.
2. Peserta membuka app → event tersebut muncul teratas dengan "kenapa cocok buat kamu".
3. Peserta RSVP dengan stake refundable (satu tap).
4. Di "pintu", organizer check-in → kehadiran terkonfirmasi on-chain.
5. Stake kembali otomatis; reputasi naik. Naskah lengkap: `docs/DEMO_SCRIPT.md`.

## 14. Checklist sisa sebelum submit (deadline hari ini, 23:59 WIB)

- [ ] Repo GitHub **publik** (wajib).
- [ ] Video demo ≤ 5 menit dengan link publik.
- [ ] Isi form submission dari `docs/SUBMISSION_DRAFT.md` (nama tim, track Consumer Apps, alamat kontrak, deskripsi, repo, video, anggota tim).
- [ ] Lengkapi bagian **Tim**, **Link demo**, **Screenshot** di `README.md` (masih placeholder).
- [ ] Verifikasi kedua kontrak di BscScan testnet (belum jelas wajib atau tidak — aman dilakukan).
- [ ] Konfirmasi item `PERLU KONFIRMASI PANITIA` via Telegram; siapkan pitch deck untuk berjaga-jaga.
- [ ] Pastikan tidak ada secret ter-commit; `.env.local` tidak masuk repo.
- [ ] Jalankan `pnpm test` (kontrak) dan `pnpm build` (web) sekali lagi sebelum kirim.

## 15. Batasan yang sengaja diambil (bukan kelupaan)

Tanpa token kustom, DAO, NFT marketplace, multi-chain, atau feed sosial on-chain. Fokus pada satu loop yang rapat: **AI match → RSVP stake → check-in → refund → reputasi → match lebih baik**.

## 16. Lisensi

MIT.
