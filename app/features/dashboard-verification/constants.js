export const DASHBOARD_STATS = [
  { label: "Pending Review", value: "128", badge: "+12%", color: "text-rose-600", bg: "bg-rose-50" },
  { label: "Verified Today", value: "42", badge: "Optimum", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Avg. Process Time", value: "4.2h", badge: "+0.5h", color: "text-teal-600", bg: "bg-teal-50" },
  { label: "Total Verification", value: "07", badge: "Weekly", color: "text-slate-600", bg: "bg-slate-50" },
];

export const VERIFICATION_USERS = [
  {
    id: 1,
    name: "Yuki Kaige",
    email: "yuki.kaige@example.com",
    idCard: "ID-901231",
    date: "Oct 24, 2024",
    time: "10:23",
    status: "Verified",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki"
  },
  {
    id: 2,
    name: "Arthur Morgan",
    email: "arthur.m@rdr2.com",
    idCard: "ID-882190",
    date: "Oct 23, 2024",
    time: "15:45",
    status: "In Review",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur"
  },
  {
    id: 3,
    name: "Sara Kim",
    email: "sara.kim@kpop.com",
    idCard: "ID-773212",
    date: "Oct 22, 2024",
    time: "09:12",
    status: "Rejected",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara"
  }
];

export const SIDEBAR_MENU = [
  { label: "Dashboard", href: "/dashboard", active: false },
  { label: "Users", href: "/", active: true },
  { label: "Keuangan", href: "/finance", active: false },
  { label: "Laporan", href: "/reports", active: false },
];
