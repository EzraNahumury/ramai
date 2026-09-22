# Ramai — User Flows

Dokumen ini memuat **semua alur** produk Ramai: happy path, alur on-chain, dan edge case. Semua diagram konsisten dengan [PRODUCT_SPEC.md](./PRODUCT_SPEC.md), [SMART_CONTRACT_SPEC.md](./SMART_CONTRACT_SPEC.md), dan [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md).

Dua peran utama:
- **Peserta (Participant)** — mencari, RSVP, hadir, mengumpulkan reputasi.
- **Organizer** — membuat event, mengisi, check-in, menyelesaikan no-show.

Legenda status RSVP: `JOINED` → `CHECKED_IN` → `SETTLED` (atau `CANCELLED`).

---

## 0. Peta Alur (High-Level)

```mermaid
flowchart LR
    subgraph Peserta
        P1[Onboarding] --> P2[Discovery]
        P2 --> P3[Detail event]
        P3 --> P4[RSVP]
        P4 --> P5[Check-in]
        P5 --> P6[Refund + Reputasi]
    end
    subgraph Organizer
        O1[Bikin event via AI] --> O2[Publish]
        O2 --> O3[Guest list terisi]
        O3 --> O4[Check-in peserta]
        O4 --> O5[Settle no-show]
    end
    O2 -.event muncul di.-> P2
    P4 -.mengisi.-> O3
    O4 --> P5
```

---

## 1. Onboarding & Wallet (Peserta)

Tujuan: user non-crypto masuk tanpa tahu apa itu wallet.

```mermaid
sequenceDiagram
    actor U as User
    participant App as Ramai App
    participant EW as Embedded Wallet SDK
    participant DB as Backend/DB

    U->>App: Buka app, tap "Masuk"
    U->>App: Masukkan email
    App->>EW: Autentikasi email (OTP/magic link)
    EW-->>App: Wallet dibuat/di-recover (address)
    App->>DB: Upsert user (email, wallet_address)
    App->>U: Tampilkan pilih minat
    U->>App: Pilih minat (mis. futsal, musik, board game)
    App->>DB: Simpan interests + hitung embedding profil
    App->>U: Masuk ke Discovery
```

Catatan UX:
- Kata "wallet", "gas", "seed phrase" **tidak** muncul di alur ini.
- Wallet dibuat di background; user hanya lihat "akun kamu siap".

Edge case:
- **Email sudah terdaftar** → langsung recover wallet, skip pilih minat.
- **SDK wallet gagal** → tampilkan retry; jangan blokir user dengan error teknis.

---

## 2. Discovery & AI Matching (Peserta)

```mermaid
flowchart TD
    A[Buka Discovery] --> B[Backend ambil kandidat event aktif]
    B --> C[Embed profil minat user]
    C --> D[Ranking: similarity minat x jadwal x reputasi]
    D --> E[LLM buat alasan cocok per event]
    E --> F[Tampilkan list event ranking + alasan]
    F --> G{User tertarik?}
    G -->|Ya| H[Buka detail event]
    G -->|Tidak| I[Scroll / filter kategori]
    I --> F
```

Detail ranking (deterministik, lihat [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md)):
- **Similarity minat** — cosine antara embedding profil dan embedding event.
- **Kecocokan jadwal** — event mendatang & tidak bentrok jika data ada.
- **Reputasi** — event dari organizer tepercaya sedikit di-boost; peserta reputasi tinggi bisa dapat akses lebih awal (future).
- LLM **hanya** menjelaskan, tidak mengubah skor (mitigasi manipulasi & prompt injection).

Edge case:
- **User baru tanpa cukup minat** → fallback ke event populer/terdekat + prompt lengkapi minat.
- **Tidak ada event cocok** → empty state: "Belum ada yang pas — coba minat lain / buat event sendiri".

---

## 3. Organizer Bikin Event via AI

```mermaid
sequenceDiagram
    actor O as Organizer
    participant App as Ramai App
    participant AI as Layanan AI (LLM)
    participant DB as Backend/DB
    participant SC as RamaiEvents (BSC)

    O->>App: Ketik 1 kalimat niat event
    Note over O,App: "Futsal santai di Yogya buat pemula, Sabtu sore"
    App->>AI: Kirim niat
    AI-->>App: Draft {judul, deskripsi, kategori, audiens, copy undangan}
    App->>O: Tampilkan draft (bisa diedit)
    O->>App: Set kapasitas, waktu, lokasi, stake (opsional)
    O->>App: Tap "Publish"
    App->>SC: createEvent(stake, startTime, checkInDeadline, capacity)
    SC-->>App: EventCreated(eventId)
    App->>DB: Simpan event + onchain_id + embedding event
    App->>O: Event live → mulai muncul di Discovery peserta cocok
```

Keputusan desain:
- Metadata kaya (deskripsi, media, lokasi presisi) **off-chain**; on-chain hanya aturan komitmen + ID.
- Stake **opsional** — organizer bisa bikin event gratis (RSVP tanpa stake) atau berkomitmen (dengan stake).

Edge case:
- **Output AI aneh/kosong** → organizer tetap bisa isi manual; AI adalah asisten, bukan gerbang wajib.
- **Tx createEvent gagal** → event disimpan sebagai draft off-chain, tombol "coba publish lagi".

---

## 4. RSVP — Gratis vs Stake (Peserta)

```mermaid
flowchart TD
    A[Detail event] --> B{Event pakai stake?}
    B -->|Tidak| C[Tap RSVP]
    C --> D[joinEvent tanpa nilai]
    D --> E[Status: JOINED, masuk guest list]

    B -->|Ya| F[Tampilkan jumlah stake + penjelasan refund]
    F --> G[Tap RSVP & Setujui stake]
    G --> H[joinEvent payable: stake di-escrow]
    H --> I{Tx sukses?}
    I -->|Ya| J[Status: JOINED + stake ter-escrow]
    I -->|Tidak / saldo kurang| K[Tampilkan cara top-up tBNB / retry]
    K --> F
```

Sequence untuk staked RSVP:

```mermaid
sequenceDiagram
    actor U as Peserta
    participant App as Ramai App
    participant EW as Embedded Wallet
    participant SC as RamaiEvents (BSC)
    participant DB as Backend/DB

    U->>App: Tap "RSVP" (event ber-stake)
    App->>U: Jelaskan: "Titip X tBNB, balik kalau kamu datang"
    U->>App: Konfirmasi
    App->>EW: Minta tanda tangan tx joinEvent (payable)
    EW->>SC: joinEvent{value: stake}(eventId)
    SC-->>App: Joined(eventId, user, stake)
    App->>DB: RSVP status=JOINED, staked=true, tx_hash
    App->>U: "Kamu terdaftar. Sampai jumpa di event!"
```

Catatan UX:
- Untuk embedded wallet, tanda tangan tx bisa dibuat **satu tap** tanpa popup gas ala MetaMask.
- Copy fokus manfaat ("balik kalau datang"), bukan istilah "escrow/stake".

Edge case:
- **Kapasitas penuh** → tombol RSVP jadi "Waitlist" (future) atau nonaktif.
- **Deadline RSVP lewat** → RSVP ditutup.

---

## 5. Batal RSVP (Cancel)

```mermaid
flowchart TD
    A[Peserta buka event ter-RSVP] --> B{Sebelum checkInDeadline?}
    B -->|Ya| C[Tap Batalkan]
    C --> D[cancelRSVP eventId]
    D --> E{Ada stake?}
    E -->|Ya| F[Stake dikembalikan ke peserta]
    E -->|Tidak| G[Cukup keluar guest list]
    F --> H[Status: CANCELLED]
    G --> H
    B -->|Tidak| I[Batal ditolak: sudah lewat batas]
    I --> J[Tawarkan tetap datang untuk check-in]
```

Aturan: pembatalan sebelum `checkInDeadline` mengembalikan stake penuh (mengurangi risiko orang takut nyangkut). Setelah deadline, hanya check-in yang mengembalikan stake.

---

## 6. Check-in & Konfirmasi On-chain

Model trust: organizer menandatangani konfirmasi kehadiran; relay/backend memverifikasi lalu menulis on-chain. (Peningkatan dua-sisi ada di [Batasan](../README.md#batasan-yang-diketahui).)

```mermaid
sequenceDiagram
    actor P as Peserta
    actor O as Organizer
    participant App as Ramai App
    participant Relay as Backend/Relay
    participant SC as RamaiEvents (BSC)
    participant Rep as RamaiReputation (BSC)

    P->>App: Tampilkan QR check-in (berisi eventId + address)
    O->>App: Scan QR peserta
    App->>O: Konfirmasi "Check-in [nama]?"
    O->>App: Ya
    App->>Relay: Minta check-in (organizer signature)
    Relay->>SC: checkIn(eventId, attendee, sig)
    SC->>SC: Verifikasi sig organizer + status JOINED
    SC-->>Relay: CheckedIn(eventId, attendee)
    SC->>Rep: recordAttendance(attendee, eventId)
    Rep-->>SC: reputasi +1
    Relay->>App: Sukses
    App->>P: "Kehadiran terverifikasi ✅"
    App->>O: Guest list update: hadir
```

Alur alternatif check-in (kode 6 digit, tanpa QR):

```mermaid
flowchart TD
    A[Organizer buka mode check-in] --> B[App tampilkan kode event 6 digit]
    B --> C[Peserta masukkan kode di app]
    C --> D[Backend verifikasi kode + lokasi/waktu]
    D --> E{Valid?}
    E -->|Ya| F[checkIn on-chain]
    E -->|Tidak| G[Tolak: kode salah/kadaluarsa]
    F --> H[Kehadiran terverifikasi + reputasi +1]
```

Edge case:
- **Peserta belum RSVP tapi datang** → organizer bisa "RSVP + check-in" sekaligus (event gratis) atau minta RSVP dulu (event ber-stake).
- **Double check-in** → ditolak oleh flag `checkedIn` di kontrak.
- **Relay down** → fallback: organizer tanda tangan langsung dari wallet organizer.

---

## 7. Refund Stake & Reputasi (Peserta)

```mermaid
flowchart TD
    A[Kehadiran terkonfirmasi on-chain] --> B{Ada stake?}
    B -->|Ya| C[Stake bisa diklaim / auto-refund]
    C --> D[claimRefund eventId]
    D --> E[Stake kembali ke peserta, status SETTLED]
    B -->|Tidak| F[Langsung ke reputasi]
    E --> G[Reputasi kehadiran +1 soulbound]
    F --> G
    G --> H[Match berikutnya membaik]
    H --> I[Kembali ke Discovery]
```

Catatan:
- Refund bisa **pull-based** (`claimRefund` oleh peserta, aman dari reentrancy) atau di-batch oleh organizer saat settle; blueprint memakai pull untuk keamanan.
- Reputasi ditulis oleh `RamaiEvents` ke `RamaiReputation` saat check-in, jadi naik walau stake belum diklaim.

---

## 8. Settle No-Show (Organizer)

```mermaid
flowchart TD
    A[checkInDeadline lewat] --> B[Organizer buka event]
    B --> C[Tap Selesaikan no-show]
    C --> D[settleNoShows eventId]
    D --> E[Kontrak cek RSVP: JOINED tapi tidak CHECKED_IN]
    E --> F[Stake no-show diteruskan ke organizer / pool]
    F --> G[Status no-show: SETTLED]
    G --> H[Laporan: hadir vs no-show]
```

Sequence:

```mermaid
sequenceDiagram
    actor O as Organizer
    participant App as Ramai App
    participant SC as RamaiEvents (BSC)

    O->>App: "Selesaikan no-show" (setelah deadline)
    App->>SC: settleNoShows(eventId)
    SC->>SC: Untuk tiap RSVP JOINED & !checkedIn → forfeit stake
    SC-->>App: Settled(eventId, totalForfeited)
    App->>O: Ringkasan: X hadir, Y no-show, Z tBNB diteruskan
```

Kebijakan forfeit (dapat dikonfigurasi per event):
- **Ke organizer** — kompensasi kursi kosong. (default demo)
- **Ke pool / dibakar** — anti-abuse organizer. (future)

Edge case:
- **Organizer sengaja tak pernah check-in** (griefing) → peserta tetap punya jalur `claimRefund` bila terbukti hadir? Tidak — karena bukti hadir butuh sig organizer. Mitigasi: check-in dua sisi (future) + reputasi organizer. Lihat [SECURITY.md](./SECURITY.md).

---

## 9. Loop Reputasi (Sistem)

```mermaid
flowchart LR
    A[Organizer bikin event] --> B[Peserta di-match & RSVP]
    B --> C[Peserta hadir + check-in]
    C --> D[Reputasi peserta naik]
    C --> E[Data turnout masuk ke ranking]
    D --> F[Match berikutnya lebih baik]
    E --> F
    F --> B
    C --> G[Reputasi organizer naik - future]
    G --> A
```

Ini core loop yang compounding: makin banyak check-in jujur → matching makin akurat → event makin keisi orang yang tepat.

---

## 10. Ringkasan State RSVP

```mermaid
stateDiagram-v2
    [*] --> JOINED: joinEvent()
    JOINED --> CANCELLED: cancelRSVP() sebelum deadline
    JOINED --> CHECKED_IN: checkIn() (sig organizer)
    CHECKED_IN --> SETTLED: claimRefund() / auto
    JOINED --> SETTLED: settleNoShows() (stake forfeit)
    CANCELLED --> [*]
    SETTLED --> [*]
```

| State | Arti | Stake |
|---|---|---|
| `JOINED` | Terdaftar, belum hadir | Ter-escrow |
| `CHECKED_IN` | Hadir, terverifikasi on-chain | Ter-escrow, siap refund |
| `SETTLED` | Selesai (refund atau forfeit) | Sudah dilepas |
| `CANCELLED` | Batal sebelum deadline | Dikembalikan |

---

## 11. Peta Empty / Error / Loading State (UX)

| Kondisi | State | Perilaku |
|---|---|---|
| Belum ada minat | Empty | Prompt pilih minat, tampilkan event populer |
| Tidak ada match | Empty | "Belum ada yang pas" + CTA buat event |
| Tx pending | Loading | Skeleton + "menyimpan RSVP kamu…" (tanpa istilah gas) |
| Tx gagal | Error | Pesan ramah + retry; detail teknis di log |
| Saldo tBNB kurang | Error | Panduan top-up faucet (testnet) |
| Relay down | Degraded | Fallback tanda tangan organizer langsung |
| Kapasitas penuh | Info | Tombol jadi nonaktif / waitlist (future) |
| RSVP ditutup | Info | "Pendaftaran sudah ditutup" |
