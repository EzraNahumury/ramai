# Ramai — Alur Pengguna & Panduan Screen Record

Dokumen ini menjelaskan **alur user sesuai aplikasi yang benar-benar berjalan sekarang** (bukan blueprint), lalu mendaftar semua kasus yang perlu **di-highlight di screen record** demo.

> ⚠️ `docs/DEMO_SCRIPT.md` menyebut check-in via **scan QR**. Di aplikasi saat ini **belum ada QR**: organizer **menempel alamat wallet peserta** di halaman `/organizer`. Dokumen ini mengikuti perilaku aplikasi yang sebenarnya. Jangan sebut "QR" di video kecuali fiturnya sudah dibuat.

---

## 1. Peran & Halaman

| Peran | Siapa | Halaman utama |
|---|---|---|
| **Pengunjung** | Belum login | `/` (landing), `/events` (daftar publik) |
| **Peserta** | Login, RSVP ke event | `/profile`, `/events`, `/events/[id]` |
| **Organizer** | Pembuat event (wallet yang memanggil `createEvent`) | `/create`, `/organizer` |

Navigasi atas: **Discover · Create · Organizer · Interests**. Di kanan: lencana reputasi **★ N** dan tombol wallet (alamat singkat).

> 🔴 Jangan klik tombol alamat wallet di pojok kanan saat merekam — itu tombol **Sign out**.

---

## 2. Aturan Waktu Event (penting untuk merencanakan rekaman)

Tiga waktu menentukan apa yang boleh dilakukan di kontrak:

```
         start                 check-in deadline
  ──────────┼───────────────────────┼──────────────────────►  waktu
  RSVP / cancel / check-in  BOLEH     │   settle no-show BOLEH
  (sebelum deadline)                  │   (setelah deadline)
```

| Aksi | Siapa | Boleh kapan |
|---|---|---|
| RSVP (`joinEvent`) | Peserta | Sebelum deadline |
| Cancel RSVP (refund penuh) | Peserta | Sebelum deadline, belum di-check-in |
| Check-in | **Hanya organizer** | Sampai deadline |
| Klaim refund stake | Peserta | Setelah di-check-in (tanpa batas waktu) |
| Settle no-show | **Hanya organizer** | **Setelah** deadline |

Syarat saat membuat event: `start < deadline` dan deadline harus di masa depan.

**Konsekuensi untuk rekaman:** check-in dan settle no-show **tidak bisa** terjadi di event yang sama dalam satu waktu. Siapkan **dua event**:
- **Event A (happy path):** deadline ±15–20 menit ke depan. Dipakai untuk RSVP → check-in → refund → reputasi.
- **Event B (no-show):** deadline ±3–5 menit ke depan, dibuat **sebelum** rekaman. Peserta RSVP tapi tidak di-check-in. Saat rekaman dimulai deadline sudah lewat → demo settle no-show.

---

## 3. Persiapan Sebelum Rekaman (checklist)

- [ ] `web/.env.local` terisi: `NEXT_PUBLIC_PRIVY_APP_ID`, **`PRIVY_APP_SECRET`**, alamat kontrak, `OPENAI_API_KEY` (atau Ollama), dan (opsional) Supabase. Tanpa `PRIVY_APP_SECRET`, simpan event / profil / personalisasi akan gagal (503).
- [ ] Di dashboard Privy: login **Email** & **Wallet** aktif, embedded wallet aktif, `http://localhost:3000` ada di allowed origins.
- [ ] **Dua akun terpisah:** akun Organizer dan akun Peserta (browser/profil berbeda atau jendela incognito). Catat **alamat wallet lengkap** keduanya.
- [ ] Kedua wallet punya **tBNB** dari faucet BNB testnet (untuk gas, dan stake untuk peserta).
- [ ] Kontrak testnet benar di `.env.local`: RamaiEvents `0x0FBA…a992`, RamaiReputation `0x3072…A23D`.
- [ ] Tab BscScan testnet terbuka untuk menunjukkan transaksi.
- [ ] `pnpm dev` jalan di `http://localhost:3000`. Resolusi layar 1080p, zoom browser 100%, tutup notifikasi.
- [ ] Event A dan Event B sudah dibuat dan Event B deadline-nya hampir/sudah lewat saat rekaman.
- [ ] Peserta sudah mengisi **minat** (mis. `futsal, olahraga santai`) agar alasan "cocok untukmu" muncul.
- [ ] Catat **alamat wallet lengkap peserta** (UI hanya menampilkan versi singkat `0x1234…abcd`). Cara dapat: dari BscScan (kolom *From* pada transaksi RSVP), Privy dashboard → Users, atau modal wallet Privy. Organizer butuh alamat lengkap ini untuk check-in.

---

## 4. Alur Utama (happy path)

### Alur 1 — Pengunjung: kesan pertama (`/`)
1. Landing dengan hero jaringan animasi + judul **"Fill the room with the right people."**
2. Tiga kartu: *Describe it, AI drafts it* · *RSVP that means it* · *Showing up counts*.
3. Tombol **Continue with email** (jika belum login) atau **Discover events**, serta **Host an event**.

🎥 **Highlight:** judul hero, 3 kartu penjelasan, spanduk "Refundable RSVP stakes cut no-shows."

### Alur 2 — Login (Privy)
1. Klik **Continue with email** / **Sign in** → masukkan email → kode verifikasi.
2. **Embedded wallet dibuat otomatis**; tombol kanan atas berubah menjadi alamat singkat.

🎥 **Highlight:** user tidak diminta seed phrase, tidak menginstal wallet. Ucapkan: *"Cukup email, wallet otomatis."* (Jangan membahas gas/seed phrase di narasi.)

### Alur 3 — Peserta mengisi minat (`/profile`)
1. Buka **Interests**. Isi *Display name* (opsional) dan *Interests* dipisah koma, mis. `futsal, olahraga santai`.
2. Chip minat muncul real-time → **Save interests** → pesan *"Saved ✓ — your discovery is now personalized."*

🎥 **Highlight:** chip minat, pesan sukses personalisasi.

### Alur 4 — Organizer membuat event dengan AI (`/create`)
1. Di kotak **Draft with AI**, ketik satu kalimat, mis. *"Futsal santai di Yogyakarta buat pemula, Sabtu sore"* → **Draft with AI**.
2. Form terisi otomatis: **Title, Description, Category, Location** (+ tag audiens disimpan di balik layar).
3. Atur **Start time**, **Check-in deadline**, **RSVP stake** (tBNB; `0` = gratis), **Capacity** (`0` = tak terbatas).
4. Klik **Create event** → setujui **satu transaksi** → status berganti: *"Confirm the transaction…" → "Waiting for confirmation on BNB Smart Chain…" → "Saving event details…"* → otomatis pindah ke `/events/[id]`.

🎥 **Highlight:** (a) satu kalimat → form terisi (momen "AI"); (b) pengaturan stake & kapasitas; (c) urutan status transaksi; (d) halaman event yang baru lahir. Ucapkan: *"Aturan komitmen ini tercatat on-chain, bukan sekadar database."*

### Alur 5 — Peserta menemukan event (`/events`)
1. Jika punya minat dan login → judul **"Picked for you"**; jika tidak → **"Discover events"** + banner *"Add your interests…"*.
2. Kartu event menampilkan kategori, lencana hijau **match**, judul, lokasi, **alasan AI** (kutipan miring bergaris oranye), dan stake (`X tBNB stake` / `Free RSVP`).
3. Event dengan skor tertinggi muncul paling atas.

🎥 **Highlight:** urutan ranking, lencana **match**, **kalimat alasan** ("kenapa cocok buat kamu"). Ini beat wajib #2.

### Alur 6 — Detail event & tanya AI (`/events/[id]`)
1. Tampil: kategori, judul, deskripsi; kartu info **Location, Starts, RSVP closes, Stake, Host, Guest list** (titik-titik ruangan terisi).
2. Bagian **Ask about this event**: klik saran (*"How does the stake work?"*) atau ketik pertanyaan → jawaban AI singkat berdasar detail event.
3. Pertanyaan di luar data (mis. dress code) → AI menjawab "tidak disebutkan, tanyakan host".

🎥 **Highlight:** titik guest list, jawaban AI yang jujur ketika data tidak ada.

### Alur 7 — RSVP dengan stake
1. Tombol **RSVP · stake 0.01 tBNB** (atau **RSVP** bila gratis; **Sign in to RSVP** bila belum login).
2. Setujui transaksi (stake dikirim ke kontrak) → *"Reserving your spot…" → "Confirming on-chain…" → "You're in. See you there."*
3. Kartu berubah: **"You're on the guest list."** + tombol **Cancel RSVP · refund stake**. Titik guest list bertambah.

🎥 **Highlight:** tombol berisi nominal stake, perubahan status ke guest list, titik bertambah. Tunjukkan transaksinya di BscScan singkat (event `Joined`).

### Alur 8 — Hari H: organizer check-in (`/organizer`)
1. Login sebagai organizer → daftar event miliknya (judul + stake).
2. Di kartu event, kolom **Check in attendee**: tempel **alamat wallet lengkap peserta** → **Check in** → setujui → status **"Done ✓"**.
3. Di sisi kontrak: event `CheckedIn` + reputasi peserta otomatis `+1`.

🎥 **Highlight:** input alamat → "Done ✓"; lalu buka BscScan → `CheckedIn` (dan `AttendanceRecorded` di kontrak reputasi). Ucapkan: *"Kehadiran diverifikasi on-chain. Bukan klaim — bukti."*

### Alur 9 — Peserta klaim stake & reputasi (momen "aha")
1. Peserta kembali ke `/events/[id]` (refresh bila perlu): **"Attendance verified · reputation earned"** + tombol **Get your stake back**.
2. Klik → setujui → *"Returning your stake…" → "Stake back in your wallet."* → teks **"Stake returned. ★ reputation +1."**
3. Lencana **★ N** di navbar bertambah.

🎥 **Highlight (paling penting):** (a) pesan "Attendance verified", (b) stake kembali (tunjukkan saldo tBNB atau tx `RefundClaimed`), (c) angka ★ di navbar naik dari N ke N+1.

### Alur 10 — Peserta batal RSVP (opsional, singkat)
1. Di event yang sudah di-RSVP, **Cancel RSVP · refund stake** → *"Cancelling…" → "RSVP cancelled, stake returned."*
2. Tombol kembali menjadi **RSVP**, titik guest list berkurang.

🎥 **Highlight:** refund langsung dan penuh — menunjukkan peserta tidak "dijebak".

### Alur 11 — Settle no-show (Event B, setelah deadline)
1. Organizer buka `/organizer` → kolom **Settle no-shows (after deadline)**: tempel satu/lebih alamat peserta yang tidak hadir (pisahkan koma/spasi) → **Settle** → setujui → "Done ✓".
2. Stake peserta yang tidak datang dikirim ke alamat `forfeitTo` (default: organizer). Peserta tidak lagi bisa klaim; reputasi **tidak** bertambah.

🎥 **Highlight:** ini bukti bahwa komitmen punya konsekuensi. Tunjukkan event `Settled` di BscScan.

---

## 5. Kasus Khusus & Error yang Layak Direkam

Pesan error di UI muncul **merah di bawah tombol/form**. Sebagian berupa pesan mentah dari wallet/kontrak.

| # | Kasus | Cara memicu | Hasil yang terlihat | Perlu di-highlight? |
|---|---|---|---|---|
| 1 | **Belum login lalu RSVP/Create** | Klik tombol saat logout | Tombol berbunyi *"Sign in to RSVP / create"* dan membuka login Privy | Ya, singkat |
| 2 | **Event penuh** | RSVP di event kapasitas kecil yang sudah penuh | Transaksi gagal `CapacityFull` | Ya — titik guest list penuh `N/N` |
| 3 | **Sudah RSVP** | RSVP dua kali | UI sudah menampilkan "on the guest list", tombol RSVP hilang | Tidak wajib |
| 4 | **Stake salah** | (hanya via panggilan langsung) | `WrongStakeValue` | Tidak perlu |
| 5 | **RSVP/Cancel setelah deadline** | Coba setelah Event B lewat deadline | Transaksi ditolak `RegistrationClosed` | Opsional |
| 6 | **Check-in oleh non-organizer** | Coba dari akun peserta | Ditolak `NotOrganizer` | Ya — bukti hanya organizer yang bisa |
| 7 | **Check-in setelah deadline** | Check-in di Event B | `CheckInClosed` | Opsional |
| 8 | **Check-in dua kali** | Ulangi untuk alamat yang sama | `AlreadyCheckedIn` | Opsional |
| 9 | **Alamat tidak valid** | Isi teks asal di kolom check-in | *"Enter a valid attendee address."* (tanpa transaksi) | Opsional |
| 10 | **Settle sebelum deadline** | Settle di Event A saat masih berjalan | Ditolak `DeadlineNotPassed` | Ya — menunjukkan aturan waktu |
| 11 | **Klaim refund tanpa check-in** | Tombol tidak muncul sebelum check-in | UI tidak menawarkan klaim | Tidak wajib |
| 12 | **Cancel setelah check-in** | Tidak ditawarkan di UI | — | Tidak perlu |
| 13 | **Event gratis (stake = 0)** | Buat event dengan stake `0` | Tombol hanya **RSVP**; setelah check-in tidak ada tombol klaim stake tetapi reputasi tetap +1 | Ya — menunjukkan kedua mode |
| 14 | **Tanpa minat** | Peserta belum mengisi profil | Judul "Discover events" + banner ajakan *set interests* | Ya — kontras dengan "Picked for you" |
| 15 | **AI belum dikonfigurasi** | `OPENAI_API_KEY` kosong | Draft/Ask gagal: "AI not configured" | Hindari saat rekaman — pastikan AI aktif |
| 16 | **Terlalu banyak permintaan AI** | >10 draft atau >20 pertanyaan per menit | Pesan *"Too many requests — slow down."* | Tidak perlu; jangan sampai terpicu saat rekaman |
| 17 | **Gagal simpan metadata** | Event sudah on-chain tetapi `POST /api/events` ditolak | Pesan *"Event is on-chain (#N) but saving details failed…"*; halaman menampilkan `Event #N` | Hindari saat rekaman |
| 18 | **Wallet tanpa tBNB** | Wallet baru belum diisi faucet | Transaksi gagal saldo kurang | Hindari — isi saldo dulu |
| 19 | **Backend kosong** | Belum ada event | Kartu *"No events yet — Be the first, host one."* | Opsional |

---

## 6. Urutan Rekaman yang Disarankan (≤ 5 menit)

| Waktu | Layar | Isi | Beat wajib |
|---|---|---|---|
| 0:00–0:20 | Landing `/` | Masalah: event sepi, RSVP bohong, no-show | — |
| 0:20–0:45 | Landing `/` | Satu kalimat perkenalan + 3 kartu | — |
| 0:45–1:15 | Login + `/profile` | Login email, wallet otomatis, isi minat | Seamless UX |
| 1:15–2:10 | `/create` | Draft AI → atur stake/kapasitas → Create → halaman event | **1. AI creation** · **3. On-chain commitment** |
| 2:10–2:50 | `/events` (akun peserta) | "Picked for you", ranking + alasan, buka detail, tanya AI | **2. Explainable match** |
| 2:50–3:20 | `/events/[id]` | RSVP dengan stake → status guest list | **3. On-chain commitment** |
| 3:20–4:10 | `/organizer` → peserta | Check-in → BscScan `CheckedIn` → klaim stake → ★ naik | **4. Aha: attendance → refund → reputasi** |
| 4:10–4:35 | `/organizer` (Event B) | Settle no-show: stake hangus | Konsekuensi komitmen |
| 4:35–5:00 | Landing | Penutup: loop yang compounding | — |

Tips merekam:
- Siapkan **dua jendela** (organizer & peserta) berdampingan; potong antar-jendela saat editing.
- Setiap transaksi butuh beberapa detik; **jangan di-skip** saat status "Confirming on-chain…" muncul — lalu **percepat** saat editing.
- Tampilkan BscScan **hanya 2–3 detik** per bukti: `Joined`, `CheckedIn`, `RefundClaimed`/`Settled`.
- Matikan notifikasi OS, sembunyikan bookmark, jangan tampilkan `.env.local`, secret Privy, atau private key.
- Hindari kata "gas" dan "seed phrase" di narasi untuk juri non-teknis.

---

## 7. Keterbatasan yang Perlu Diketahui Saat Demo (jangan diklaim lebih)

- **Tidak ada QR / guest list otomatis untuk organizer.** Organizer harus menempel alamat wallet peserta secara manual; alamat itu perlu disiapkan lebih dulu.
- **Tanpa "gasless".** Wallet tetap butuh tBNB untuk gas dan stake (testnet).
- **Reputasi = angka kehadiran** (counter on-chain non-transferable), bukan token ERC-5192.
- **Check-in bergantung pada organizer.** Organizer yang tidak aktif/jahat bisa menahan stake peserta setelah deadline (batasan yang diketahui; lihat README).
- **Matching sederhana:** skor kecocokan tag/kata + AI hanya menulis alasannya (belum embeddings).
- Setelah transaksi, halaman peserta kadang perlu **refresh** untuk melihat status terbaru.
- Jaringan: **BSC Testnet** (chainId 97), bukan mainnet.
