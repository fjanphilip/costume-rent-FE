# 🎭 Costume Rent App

A modern, full-stack costume rental management system built with **Laravel 11** and **Remix (React)**. This application provides a seamless experience for users to browse, book, and manage costume rentals, integrated with **Midtrans** for secure payments.

---

## 🚀 Key Features

### 👤 User Side
- **Interactive Catalog**: Browse costumes with advanced filtering by category, size, and price.
- **Availability Check**: Real-time checking of costume availability for specific dates.
- **Booking System**: Streamlined checkout process for costume and accessory rentals.
- **Digital Wallet (Deposit)**: Integrated wallet for top-ups (via Midtrans) and automated fine deductions.
- **Identity Verification**: Secure user verification process via WhatsApp integration/Admin approval.
- **Transaction History**: Detailed logs of bookings, top-ups, and refunds.

### 🛠️ Admin Side
- **Dashboard Overview**: Quick stats on active bookings and revenue.
- **Costume Management**: Easily add/edit costumes, sizes, and pricing.
- **Booking Management**: Confirm returns and automated fine calculation for late returns.
- **Transaction Audit**: Monitor all wallet activities and approve withdrawals.

---

## 🛠️ Technology Stack

### Backend (API)
- **Framework**: Laravel 11
- **Authentication**: Laravel Sanctum (Bearer Token)
- **Payment Gateway**: Midtrans API Integration
- **Database**: PostgreSQL / MySQL
- **Tooling**: Pest/PHPUnit for Testing

### Frontend (Web)
- **Framework**: Remix (React)
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI & Shadcn
- **API Client**: Axios with centralized request handling

---

## 📦 Installation & Setup

### 1. Backend Setup
```bash
cd costume_app
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 1. Backend Setup
```bash
cd costume_FE
npm install
npm run dev
```

