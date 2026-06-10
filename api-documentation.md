# API Documentation - Costume Rent App

Daftar tabel seluruh endpoint API yang tersedia di project ini, dikelompokkan berdasarkan fungsinya.

## 1. Autentikasi & Profil (Public & Protected)

| Method | Endpoint            | Deskripsi                             | Akses  |
| :----- | :------------------ | :------------------------------------ | :----- |
| `POST` | `/api/register`     | Pendaftaran user baru                 | Public |
| `POST` | `/api/login`        | Login user untuk mendapatkan token    | Public |
| `GET`  | `/api/user`         | Mengambil data profil user yang login | User   |
| `PUT`  | `/api/user/profile` | Memperbarui data profil user          | User   |
| `POST` | `/api/logout`       | Logout dan menghapus token aktif      | User   |

## 2. Katalog Kostum & Aksesoris (Public & User)

| Method | Endpoint                          | Deskripsi                                     | Akses  |
| :----- | :-------------------------------- | :-------------------------------------------- | :----- |
| `GET`  | `/api/costumes`                   | List semua kostum dengan filter               | Public |
| `GET`  | `/api/costumes/{slug}`            | Detail lengkap satu kostum                    | Public |
| `GET`  | `/api/costume-filters`            | Mengambil opsi filter (kategori, size, harga) | Public |
| `GET`  | `/api/costumes/{id}/booked-dates` | Cek tanggal yang sudah tidak ready            | Public |
| `GET`  | `/api/accessories`                | List aksesoris tambahan                       | User   |

## 3. Dompet & Transaksi (Wallet)

| Method | Endpoint                    | Deskripsi                                       | Akses    |
| :----- | :-------------------------- | :---------------------------------------------- | :------- |
| `GET`  | `/api/deposit/balance`      | Cek sisa saldo deposit user                     | User     |
| `GET`  | `/api/deposit/transactions` | Riwayat transaksi (Topup/Debit/Credit)          | User     |
| `POST` | `/api/deposit/transactions` | Buat transaksi baru (Topup Midtrans / Withdraw) | User     |
| `POST` | `/api/midtrans/callback`    | Webhook otomatis dari Midtrans                  | Midtrans |

## 4. Penyewaan (Booking)

| Method   | Endpoint                                  | Deskripsi                            | Akses         |
| :------- | :---------------------------------------- | :----------------------------------- | :------------ |
| `POST`   | `/api/bookings/checkout`                  | Buat pesanan baru (Reserves costume) | Verified User |
| `GET`    | `/api/bookings`                           | List riwayat penyewaan user          | User          |
| `GET`    | `/api/bookings/{id}`                      | Detail satu penyewaan                | User          |
| `POST`   | `/api/bookings/{id}/accessories`          | Tambah aksesoris ke dalam booking    | User          |
| `DELETE` | `/api/bookings/{id}/accessories/{acc_id}` | Hapus aksesoris dari booking         | User          |

## 5. Administrasi (Admin Only)

| Method | Endpoint                                      | Deskripsi                               | Akses |
| :----- | :-------------------------------------------- | :-------------------------------------- | :---- |
| `GET`  | `/api/admin/users`                            | List semua user terdaftar               | Admin |
| `PUT`  | `/api/admin/users/{id}/verify`                | Verifikasi identitas user               | Admin |
| `GET`  | `/api/admin/bookings`                         | List semua booking dari seluruh user    | Admin |
| `POST` | `/api/admin/bookings/{id}/confirm-return`     | Konfirmasi pengembalian & hitung denda  | Admin |
| `GET`  | `/api/admin/deposit-transactions`             | List semua transaksi keuangan           | Admin |
| `PUT`  | `/api/admin/deposit-transactions/{id}/status` | Update status (Approve/Reject) Withdraw | Admin |
| `POST` | `/api/costumes`                               | Menambah kostum baru ke katalog         | Admin |
| `POST` | `/api/costumes/{id}/images`                   | Upload foto kostum baru                 | Admin |

---

> [!TIP]
> Semua endpoint yang bertanda **User**, **Verified User**, atau **Admin** memerlukan Header `Authorization: Bearer {token}` yang didapat setelah login.
