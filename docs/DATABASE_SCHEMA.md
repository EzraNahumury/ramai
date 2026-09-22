# Ramai — Database Schema

Postgres (Supabase) + `pgvector`. Off-chain menyimpan semua data kaya & privat; on-chain hanya state komitmen minimal. `EVENT.onchain_id` menautkan baris DB ke kontrak.

## ERD

```mermaid
erDiagram
    USER ||--o{ INTEREST : has
    USER ||--o{ RSVP : makes
    USER ||--o{ ATTENDANCE : earns
    USER ||--o{ AI_RECOMMENDATION : receives
    ORGANIZER ||--o{ EVENT : creates
    EVENT ||--o{ RSVP : receives
    EVENT ||--o{ ATTENDANCE : produces
    EVENT ||--o{ AI_RECOMMENDATION : generates

    USER {
        uuid id PK
        string email UK
        string wallet_address UK
        string display_name
        timestamptz created_at
    }
    ORGANIZER {
        uuid id PK
        uuid user_id FK
        string bio
    }
    INTEREST {
        uuid id PK
        uuid user_id FK
        string tag
        vector embedding
    }
    EVENT {
        uuid id PK
        uuid organizer_id FK
        bigint onchain_id UK
        string title
        text description
        string category
        string location
        timestamptz start_time
        timestamptz checkin_deadline
        numeric stake_amount
        int capacity
        vector embedding
        string status
        timestamptz created_at
    }
    RSVP {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        string status
        bool staked
        numeric stake_amount
        string tx_hash
        timestamptz created_at
    }
    ATTENDANCE {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        string checkin_tx
        timestamptz verified_at
    }
    AI_RECOMMENDATION {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        float score
        text reason
        timestamptz created_at
    }
```

## Entitas & Kunci

| Tabel | PK | FK | Index penting |
|---|---|---|---|
| `USER` | `id` | — | `email` (unik), `wallet_address` (unik) |
| `ORGANIZER` | `id` | `user_id → USER` | `user_id` |
| `INTEREST` | `id` | `user_id → USER` | vektor `embedding` (ivfflat/hnsw), `user_id` |
| `EVENT` | `id` | `organizer_id → ORGANIZER` | `category`, `start_time`, `status`, `onchain_id` (unik), vektor `embedding` |
| `RSVP` | `id` | `user_id`, `event_id` | unik (`user_id`,`event_id`), `status` |
| `ATTENDANCE` | `id` | `user_id`, `event_id` | unik (`user_id`,`event_id`) |
| `AI_RECOMMENDATION` | `id` | `user_id`, `event_id` | (`user_id`,`score` desc) |

## Relasi

- `USER 1—N INTEREST`, `USER 1—N RSVP`, `USER 1—N ATTENDANCE`.
- `ORGANIZER 1—N EVENT` (organizer adalah user dengan peran).
- `EVENT 1—N RSVP`, `EVENT 1—N ATTENDANCE`.
- `RSVP` unik per (user,event); `ATTENDANCE` unik per (user,event).

## Sinkronisasi On-chain

- `RSVP.tx_hash` & `RSVP.status` diperbarui indexer dari event `Joined`/`RSVPCancelled`/`Settled`.
- `ATTENDANCE` dibuat indexer dari event `CheckedIn`.
- Reputasi tidak disimpan sebagai sumber kebenaran di DB — dibaca dari kontrak (`reputationOf`) atau di-cache dari `AttendanceRecorded` untuk tampilan cepat.

## Privasi

- **PII (email, nama)** hanya di DB, tidak pernah on-chain.
- **Embedding minat** off-chain; tidak diekspos ke publik/on-chain.
- **Lokasi presisi** off-chain; on-chain tidak menyimpan lokasi.
- Baris `AI_RECOMMENDATION` bersifat internal (bisa di-purge berkala).
- Terapkan row-level security (Supabase RLS) agar user hanya baca datanya sendiri; data organizer event hanya untuk organizer terkait.

## Catatan

- `stake_amount` di DB adalah cache tampilan; sumber kebenaran nilai stake ada di kontrak.
- `status` EVENT: `draft | active | ended | cancelled`.
- `status` RSVP: `joined | checked_in | settled | cancelled` (mirror state kontrak).
