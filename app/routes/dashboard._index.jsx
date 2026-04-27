import { useOutletContext, useLoaderData, useFetcher, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import { useState, useRef } from "react";
import * as Icons from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { TransactionTable } from "~/features/user-dashboard/components/TransactionTable";
import { BookingTable } from "~/features/user-dashboard/components/BookingTable";
import { Button } from "~/components/ui/button";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");

  if (!token) return json({ transactions: [], bookings: [], accessories: [] });

  try {
    const headers = {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    };

    // Parallel fetch for transactions, bookings, accessories, and balance
    const [txRes, bookingsRes, accessoriesRes, balanceRes] = await Promise.all([
      fetch("http://127.0.0.1:8000/api/deposit/transactions", { headers }),
      fetch("http://127.0.0.1:8000/api/bookings", { headers }),
      fetch("http://127.0.0.1:8000/api/accessories", { headers }),
      fetch("http://127.0.0.1:8000/api/deposit/balance", { headers })
    ]);

    const txData = txRes.ok ? await txRes.json() : { data: [] };
    const bookingsData = bookingsRes.ok ? await bookingsRes.json() : { data: [] };
    const accessoriesData = accessoriesRes.ok ? await accessoriesRes.json() : { data: [] };
    const balanceData = balanceRes.ok ? await balanceRes.json() : { deposit_balance: 0 };

    return json({ 
      transactions: txData.data || [], 
      bookings: bookingsData.data || [],
      accessories: accessoriesData.data || [],
      balance: balanceData.deposit_balance || 0
    });
  } catch (error) {
    console.error("Dashboard Overview Loader Error:", error);
    return json({ transactions: [], bookings: [], accessories: [], balance: 0 });
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "request_verification") {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/profile", {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          verification_status: "pending"
        })
      });

      if (response.ok) {
        return json({ success: true });
      }
    } catch (error) {
      console.error("Verification Request Error:", error);
    }
    return json({ success: true });
  }

  if (intent === "add_accessory") {
    const bookingId = formData.get("booking_id");
    const accessoryId = formData.get("accessory_id");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/accessories`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ accessory_id: accessoryId })
      });
      if (response.ok) return json({ success: true });
      const resData = await response.json();
      return json({ error: resData.message }, { status: 400 });
    } catch (error) {
      return json({ error: "Network error" }, { status: 500 });
    }
  }

  if (intent === "remove_accessory") {
    const bookingId = formData.get("booking_id");
    const accessoryId = formData.get("accessory_id");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/accessories/${accessoryId}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) return json({ success: true });
    } catch (error) { }
    return json({ success: true });
  }

  if (intent === "confirm_received") {
    const bookingId = formData.get("booking_id");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/confirm-received`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) return json({ success: true });
    } catch (error) { }
    return json({ success: true });
  }

  if (intent === "request_return") {
    const bookingId = formData.get("booking_id");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/request-return`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: formData // Forwarding the multipart/form-data
      });
      if (response.ok) return json({ success: true });
      const resData = await response.json();
      return json({ error: resData.message }, { status: 400 });
    } catch (error) {
      return json({ error: "Network error" }, { status: 500 });
    }
  }

  return null;
};

export default function DashboardOverview() {
  const { user } = useOutletContext();
  const { transactions, bookings, accessories, balance } = useLoaderData();
  const fetcher = useFetcher();
  const userName = user?.name || "Member";
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive status from user data
  const currentStatus = user.is_verified ? 'verified' : (user.verification_status || 'unverified');

  // Stats calculation
  const activeRentalsCount = bookings.filter(b => 
    ['Paid', 'Preparing', 'Rented', 'Pending_Payment'].includes(b.status)
  ).length;
  const depositBalance = Number(balance) || 0;

  const handleVerificationSubmit = () => {
    const adminPhone = "6283832352467";
    const message = `Permintaan verifikasi identitas untuk: ${userName}`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    fetcher.submit({ intent: "request_verification" }, { method: "post" });
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 animate-in fade-in duration-700">
      {/* Rental Expiry Notification */}
      {bookings.some(b => {
        if (b.status !== 'Rented') return false;
        const end = new Date(b.end_date);
        const now = new Date();
        const diffHours = (end - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 24;
      }) && (
        <div className="bg-rose-500 text-white p-4 rounded-2xl flex items-center gap-4 animate-bounce shadow-lg shadow-rose-500/20">
          <Icons.AlertTriangle className="h-6 w-6 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest">Peringatan Masa Sewa</p>
            <p className="text-[10px] font-bold opacity-80 italic">Ada kostum yang masa sewanya akan habis dalam kurang dari 24 jam. Harap ajukan pengembalian tepat waktu.</p>
          </div>
          <Link to="/dashboard/bookings">
            <Button size="sm" variant="ghost" className="text-white border border-white/20 hover:bg-white/10 font-black uppercase text-[9px] tracking-widest rounded-xl">Cek Booking</Button>
          </Link>
        </div>
      )}

      <header className="flex flex-col gap-1 text-left">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight italic leading-tight">Halo, {userName}! 👋</h1>
        <p className="text-muted-foreground text-xs sm:text-sm font-medium italic">Selamat datang kembali. Cek status penyewaan kostum kamu di sini.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-primary text-white overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Wallet Balance</span>
              <Icons.Wallet className="h-5 w-5 fill-white/20" />
            </div>
            <p className="text-3xl sm:text-4xl font-black italic">Rp {depositBalance.toLocaleString('id-ID')}</p>
            <p className="text-[10px] mt-2 font-bold opacity-60 italic">Saldo siap digunakan</p>
          </CardContent>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Rentals</span>
              <Icons.Clock className="h-5 w-5 text-primary" />
            </div>
            <p className="text-4xl font-black text-foreground italic">{activeRentalsCount.toString().padStart(2, '0')}</p>
            <p className="text-[10px] mt-2 font-bold text-emerald-500 flex items-center gap-1 italic">
              <Icons.CheckCircle2 className="h-3 w-3" /> Transaksi berjalan
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Points Reward</span>
              <Icons.Zap className="h-5 w-5 text-rose-500 fill-rose-500/10" />
            </div>
            <p className="text-4xl font-black text-foreground italic">0</p>
            <p className="text-[10px] mt-2 font-bold text-muted-foreground italic">Coming Soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-10">
        <TransactionTable transactions={transactions.slice(0, 5)} title="Recent Wallet Activity" />
        <BookingTable bookings={bookings.slice(0, 5)} title="Recent Bookings" accessories={accessories} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {currentStatus === 'verified' ? (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl shadow-slate-900/20 border border-slate-700">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Icons.ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="text-xl font-black italic uppercase tracking-tight">Verified Member</h4>
              </div>
              <p className="text-white/60 text-xs max-w-[220px] font-medium italic leading-relaxed">
                Selamat! Anda telah terverifikasi. Nikmati keuntungan diskon penyewaan dan prioritas layanan.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Benefit Active</span>
              </div>
            </div>
            <Icons.CheckCircle2 className="absolute -right-8 -bottom-8 h-48 w-48 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
          </div>
        ) : currentStatus === 'pending' ? (
          <div className="bg-amber-500 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl shadow-amber-500/20 border border-amber-400">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Icons.Clock className="h-5 w-5" />
                </div>
                <h4 className="text-xl font-black italic uppercase tracking-tight">Menunggu Verifikasi</h4>
              </div>
              <p className="text-white/90 text-xs max-w-[220px] font-medium italic leading-relaxed">
                Permintaan verifikasi Anda telah dikirim dan sedang ditinjau. Mohon tunggu informasi selanjutnya.
              </p>
              <div className="bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit border border-white/20">Sedang Diproses</div>
            </div>
            <Icons.ShieldAlert className="absolute -right-8 -bottom-8 h-48 w-48 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
          </div>
        ) : (
          <div
            onClick={handleVerificationSubmit}
            className="bg-emerald-500 rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-transform"
          >
            <div className="relative z-10 flex flex-col gap-4">
              <h4 className="text-xl font-black italic uppercase tracking-tight">Verifikasi Identitas</h4>
              <p className="text-white/80 text-xs max-w-[200px] font-medium italic leading-relaxed">Hubungi admin via WhatsApp untuk verifikasi akun dan dapatkan badge member.</p>
              <div className="bg-white text-emerald-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-emerald-900/10 hover:bg-emerald-50 transition-colors">Verifikasi Sekarang</div>
            </div>
            <Icons.ShieldCheck className="absolute -right-8 -bottom-8 h-40 w-40 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
          </div>
        )}

        <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-transform font-black">
          <div className="relative z-10 flex flex-col gap-4 text-left">
            <h4 className="text-xl font-bold italic uppercase tracking-tight">Butuh Bantuan?</h4>
            <p className="text-white/80 text-xs max-w-[200px] font-medium italic leading-relaxed">Hubungi customer service kami jika ada kendala dalam penyewaan.</p>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase w-fit">Chat Support</button>
          </div>
          <Icons.MessageSquare className="absolute -right-8 -bottom-8 h-40 w-40 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
}
