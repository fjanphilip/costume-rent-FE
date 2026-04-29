export const ADMIN_MENU = [
  {
    label: "Dashboard",
    icon: "LayoutDashboard",
    href: "/admin"
  },
  {
    label: "Daftar User",
    icon: "Users",
    href: "/admin/users"
  },
  {
    label: "Katalog Kostum",
    icon: "Shirt",
    href: "/admin/costumes"
  },
  {
    label: "Daftar Booking",
    icon: "ShoppingBag",
    href: "/admin/bookings"
  },
  {
    label: "Withdrawals",
    icon: "ArrowDownToLine",
    href: "/admin/withdrawals"
  }
];

export const ADMIN_STATS = [
  {
    label: "Total Pendapatan",
    value: "Rp 12.450.000",
    change: "+12.5%",
    trend: "up",
    icon: "DollarSign",
    color: "bg-emerald-500"
  },
  {
    label: "Penyewaan Aktif",
    value: "42",
    change: "+5",
    trend: "up",
    icon: "Clock",
    color: "bg-blue-500"
  },
  {
    label: "Total Kostum",
    value: "128",
    change: "-2",
    trend: "down",
    icon: "Shirt",
    color: "bg-purple-500"
  },
  {
    label: "Menunggu Verifikasi",
    value: "14",
    change: "High Priority",
    trend: "neutral",
    icon: "ShieldAlert",
    color: "bg-rose-500"
  }
];
