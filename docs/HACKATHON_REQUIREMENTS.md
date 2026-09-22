# Ramai — Hackathon Requirements Audit

**Sumber utama:** situs resmi https://indonesiaweb3hack.xyz/en (Home, FAQ, Schedule, Prizes) + halaman Luma. Diaudit 2026-09-22.

**Penyelenggara:** kolaborasi Binance Academy, BNB Chain, Coinvestasi, mentor Dev Web3 Jogja. Tema: #WhereBuildersBuild — AI × Web3.

> ⚠️ **URGENSI:** Submission window sudah **BUKA** (1 Sept 2026). Deadline **30 September 2026, 23:59 WIB**. Per tanggal audit (22 Sept 2026) → **± 8 hari tersisa**. Ini mengubah kalkulus scope: kejar MVP demo end-to-end, bukan produk penuh. Lihat [MVP_SCOPE](./PRODUCT_SPEC.md#mvp-scope-ruthless) & [ROADMAP](./DEVELOPMENT_ROADMAP.md).

---

## Fakta Terkonfirmasi (dari situs resmi)

### Tracks (3)
1. **AI Agents** — autonomous agents & AI × DeFi onchain.
2. **Finance & Commerce** — DeFi, payments, RWA untuk Indonesia.
3. **Consumer Apps** — **social, gaming and loyalty with seamless UX**. ← track kita.

> Proyek boleh masuk lebih dari satu track.

### Definisi Consumer Apps vs Ramai
"Social, gaming and loyalty with seamless UX." Ramai = **social** (event + koneksi orang) + **loyalty** (reputasi kehadiran soulbound) + **seamless UX** (login email + embedded wallet, blockchain tak terlihat). **Fit kuat.** AI matching = bonus diferensiasi (AI tidak wajib di track ini).

### Syarat Teknis
- **Smart contract WAJIB.** "Your project must have a smart contract deployed on BNB Smart Chain or opBNB (mainnet or testnet)." → **Testnet resmi diizinkan.** ✅
- **AI tidak wajib** untuk Consumer Apps (AI hanya inti track AI Agents). AI Ramai = nilai tambah.
- **GitHub repo publik WAJIB.**
- **Video demo** ≤ 5 menit (disarankan).

### Aturan Orisinalitas
- "The project must be built during the hackathon period." Periode: Jul–Okt 2026.
- Boleh pakai open-source library/template/tooling, **core product harus orisinal & baru.**

### Tim & Eligibility
- Terbuka untuk semua (mahasiswa, profesional, hobiis), gratis.
- Solo boleh; **2–5 orang disarankan.**
- Registrasi via **Luma dulu**, baru submit di situs.

### Field Submission (dari FAQ Q5)
Nama tim/proyek, track terpilih, **contract address**, problem statement, solution, deskripsi detail, **link repo GitHub**, **video demo** (≤5 mnt), info anggota tim, sumber daya pendukung. Submission bisa diedit selama window buka (via edit code).

### Kriteria Penilaian (dari FAQ Q7)
Innovation/originality · technical execution · impact potential · business viability · UX · presentation quality.

### Timeline
| Tanggal | Acara |
|---|---|
| 1 Jul 2026 | Registrasi buka (Luma) |
| 5 Jul – 30 Agu 2026 | Workshop & mentoring |
| 1 Sep 2026 | Submission buka |
| **30 Sep 2026, 23:59 WIB** | **Deadline submission** |
| 14 Okt 2026 | Pengumuman finalis per track |
| 31 Okt 2026 | Demo Day — finalis presentasi, pemenang diumumkan |

### Hadiah (total $5.000)
| Hadiah | Nilai |
|---|---|
| Grand Prize (Best Overall, lintas track) | $1.000 |
| Tiap track 1st / 2nd / 3rd | $600 / $400 / $300 |
| Community Choice (lintas track) | $100 |
| **Total** | **$5.000** |

11 hadiah total. Consumer Apps podium = $600/$400/$300; masih bisa rebut Grand Prize $1.000 lintas track.

---

## PERLU KONFIRMASI PANITIA (belum jelas di sumber publik)

| Item | Status | Cara konfirmasi |
|---|---|---|
| **Pitch deck** wajib atau opsional | Satu sumber sebut "pitch deck required"; FAQ hanya sebut "supporting resources" | Tanya Telegram; **siapkan deck** untuk aman |
| Bobot tiap kriteria penilaian | Kriteria disebut, bobot tidak | Telegram |
| Boleh berapa submission per tim | Tidak disebut | Telegram |
| Kepemilikan IP / lisensi wajib | Tidak disebut | Telegram; kita pakai MIT |
| Aturan anti-cheating / diskualifikasi detail | Tidak eksplisit | Telegram |
| Format/hosting video demo (YouTube/Loom/dll) | Tidak disebut | Telegram; siapkan link publik |
| Registrasi ada batas akhir? | "No closing date specified" | Register via Luma sekarang |
| Contract WAJIB verified di explorer? | Tidak disebut | Verify kontrak untuk aman |

> Tidak dikarang. Item di atas harus dicek ke panitia via Telegram / Dev Web3 Jogja.

---

## HACKATHON REQUIREMENT MATRIX

| Requirement | Aturan Resmi | Status Ramai | Risiko | Aksi |
|---|---|---|---|---|
| Registrasi Luma | Wajib sebelum submit | Belum | 🔴 Blocker submit | Register via Luma **sekarang** |
| Track dipilih | 1+ track | Consumer Apps (fit) | 🟢 | Pilih Consumer Apps; pertimbangkan tandai lintas untuk Grand Prize |
| Smart contract deployed | Wajib, BSC/opBNB, mainnet/testnet | Direncanakan (RamaiEvents + RamaiReputation) | 🟡 Belum deploy | Deploy ke BSC Testnet + simpan address |
| Contract address di form | Wajib | Belum ada | 🔴 | Isi setelah deploy |
| GitHub repo publik | Wajib | Belum dibuat | 🟡 | Buat repo publik + README (sudah siap) |
| Core product orisinal & baru | Wajib (dibangun periode hackathon) | Ya (blueprint baru) | 🟢 | Simpan histori commit sebagai bukti |
| Video demo ≤5 mnt | Disarankan | Naskah siap ([DEMO_SCRIPT](./DEMO_SCRIPT.md)) | 🟡 | Rekam & host publik |
| Problem/solution/deskripsi | Wajib | Siap ([PRODUCT_SPEC](./PRODUCT_SPEC.md)) | 🟢 | Salin ke form |
| Info tim (2–5 disarankan) | Solo boleh | Placeholder | 🟡 | Isi anggota tim |
| Pitch deck | Belum pasti | Belum | 🟡 | Siapkan deck (jaga-jaga) |
| Deadline 30 Sep 23:59 WIB | Keras | 8 hari | 🔴 Waktu | Fokus MVP, kejar deploy dulu |
| Pakai AI | Tidak wajib (Consumer) | Ada (matching+creation) | 🟢 Nilai plus | Tonjolkan sebagai diferensiasi |

Legenda: 🟢 aman · 🟡 perlu kerja · 🔴 kritis/blocker.

---

## DISQUALIFICATION / COMPLIANCE CHECKLIST

Wajib dipenuhi agar tidak gagal administratif/teknis:

- [ ] **Registrasi via Luma** selesai sebelum submit.
- [ ] **Smart contract ter-deploy** di BNB Smart Chain atau opBNB (testnet cukup).
- [ ] **Contract address** dimasukkan ke form submission.
- [ ] **Repo GitHub publik** berisi kode + README, bisa diakses juri.
- [ ] **Core product orisinal**, dibangun dalam periode hackathon (commit history sebagai bukti).
- [ ] **Video demo ≤5 menit**, di-host di link publik yang bisa dibuka juri.
- [ ] Semua **field bertanda bintang** di form terisi (nama, track, problem, solution, deskripsi, GitHub, video, tim, contract address).
- [ ] **Masuk track Consumer Apps** (dan pertimbangkan flag lintas-track untuk Grand Prize).
- [ ] **Submit sebelum 30 Sep 2026, 23:59 WIB** (jangan mepet; edit code untuk revisi).
- [ ] (Jaga-jaga) **Pitch deck** siap.
- [ ] (Jaga-jaga) **Kontrak verified** di BscScan testnet.
- [ ] Konfirmasi ke panitia semua item **PERLU KONFIRMASI** di atas.

---

## Pemetaan ke Kriteria Juri

| Kriteria juri | Kekuatan Ramai | Bukti untuk ditunjukkan |
|---|---|---|
| Innovation / originality | Komitmen + reputasi kehadiran on-chain portabel; matching explainable | Diferensiasi vs Luma/Meetup/Partiful |
| Technical execution | Kontrak teruji + integrasi AI + embedded wallet | Foundry tests hijau, tx on-chain live |
| Impact potential | No-show adalah pembunuh event komunitas nyata di Indonesia | Naskah demo, problem statement |
| Business viability | Organizer premium / promotion (tanpa tokenomics paksa) | [PRODUCT_SPEC — Business Model](./PRODUCT_SPEC.md#business-model-tidak-dipaksakan) |
| UX | Seamless: login email, tanpa gas/seed phrase | Demo alur peserta |
| Presentation | Naskah ≤5 mnt dengan momen aha jelas | [DEMO_SCRIPT](./DEMO_SCRIPT.md) |

---

## Sumber
- [Situs resmi — Home/FAQ/Schedule/Prizes](https://indonesiaweb3hack.xyz/en)
- [Indonesia Web3 Hackathon · Luma](https://luma.com/pcc699dv)
- [BNB Chain Hackathons](https://www.bnbchain.org/en/hackathons)
