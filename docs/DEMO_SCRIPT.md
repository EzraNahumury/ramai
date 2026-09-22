# Ramai — Demo Script (≤5 menit)

Tujuan: juri paham produk dalam detik pertama, lalu lihat bukti AI + Web3 bekerja end-to-end. Bahasa sederhana, non-teknis dulu, bukti teknis kemudian.

> `PERLU KONFIRMASI PANITIA`: durasi/format video demo resmi. Naskah ini dirancang ≤5 menit.

---

## Struktur Waktu

| Waktu | Bagian | Isi |
|---|---|---|
| 0:00–0:20 | Masalah | Hook: event gampang dibuat, susah keisi; RSVP bohong; no-show |
| 0:20–0:50 | Perkenalan produk | Apa itu Ramai, satu kalimat |
| 0:50–2:00 | Alur organizer | Bikin event via AI + publish on-chain |
| 2:00–3:20 | Alur peserta | Discovery + alasan cocok + RSVP stake |
| 3:20–4:10 | Bukti AI + Web3 | Check-in on-chain → refund → reputasi (momen aha) |
| 4:10–4:40 | Kenapa ini penting | Loop yang compounding, diferensiasi |
| 4:40–5:00 | Penutup | Ringkas + ajakan |

---

## Naskah

### 0:00–0:20 — Masalah
> "Bikin event itu gampang. Yang susah: nemu orang yang tepat, dan bikin mereka beneran datang. Orang klik 'Hadir' gratis, lalu hilang. No-show membunuh event komunitas."

### 0:20–0:50 — Perkenalan
> "Kenalin, Ramai. AI mencocokkan event dengan orang yang tepat, RSVP pakai komitmen kecil yang balik kalau kamu datang, dan setiap kehadiran jadi reputasi yang kamu miliki. Semua di atas BNB Chain — tapi tanpa ribet crypto."

### 0:50–2:00 — Alur Organizer
Aksi di layar:
1. Organizer ketik satu kalimat: _"Futsal santai di Yogyakarta buat pemula, Sabtu sore."_
2. AI langsung menyusun judul, deskripsi, kategori, dan copy undangan.
> "Saya cuma ngetik satu kalimat. AI yang menyusun eventnya."
3. Organizer set stake kecil (refundable) + kapasitas, tap **Publish**.
> "Pas publish, aturan komitmen ini tercatat on-chain — bukan sekadar tombol di database."

### 2:00–3:20 — Alur Peserta
Aksi di layar (akun peserta):
1. Buka Discovery — event futsal tadi muncul di **ranking teratas**.
2. Tunjuk baris alasan: _"Kamu suka olahraga santai dan biasanya kosong Sabtu."_
> "Ini bukan feed acak. AI menjelaskan kenapa event ini cocok buat saya."
3. Tap **RSVP** — konfirmasi stake kecil, satu tap, tanpa popup gas.
> "Saya titip komitmen kecil. Kalau saya datang, balik penuh."

### 3:20–4:10 — Bukti AI + Web3 (Momen Aha)
Aksi di layar:
1. Pindah ke mode organizer, **scan QR** peserta / masukkan kode → check-in.
2. Tampilkan tx on-chain: **CheckedIn** terkonfirmasi.
> "Kehadiran diverifikasi on-chain. Bukan klaim — bukti."
3. Kembali ke peserta: stake **balik otomatis**, dan **reputasi +1**.
> "Stake saya kembali, dan kehadiran ini jadi reputasi yang saya bawa ke event mana pun di Ramai."

### 4:10–4:40 — Kenapa Penting
> "Tiap check-in jujur bikin match berikutnya makin akurat dan guest list organizer makin tepercaya. Itu aset yang tak bisa ditiru app event biasa — karena rekam jejaknya portabel, bisa diverifikasi, dan dimiliki user."

### 4:40–5:00 — Penutup
> "Ramai: AI nemuin orang yang tepat, blockchain bikin mereka beneran datang. Event yang beneran keisi — dan beneran dateng. Terima kasih."

---

## Checklist Demo (biar mulus)

- [ ] Data seed siap: 1 event futsal + beberapa user dengan minat relevan.
- [ ] Wallet testnet terisi tBNB (peserta & organizer).
- [ ] Kontrak ter-deploy, alamat benar di `.env`.
- [ ] QR/kode check-in teruji sebelum rekaman.
- [ ] Tampilkan tx on-chain (explorer) singkat sebagai bukti.
- [ ] Jangan pakai istilah "gas/seed phrase" saat ngomong ke juri.
- [ ] Backup: kalau relay down, tunjukkan check-in via wallet organizer langsung.

## Beat yang Wajib Terlihat Juri
1. **AI creation** — 1 kalimat → event.
2. **Explainable match** — alasan cocok.
3. **On-chain commitment** — stake RSVP.
4. **Verified attendance → refund → reputasi** — momen aha.
