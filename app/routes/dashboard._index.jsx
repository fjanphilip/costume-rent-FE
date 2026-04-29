import { useOutletContext, useLoaderData, useFetcher, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import { getApiClient } from "~/lib/api";
import { useState, useRef } from "react";
import * as Icons from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { BookingTable } from "~/features/user-dashboard/components/BookingTable";
import { Button } from "~/components/ui/button";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");

  if (!token) return json({ bookings: [], accessories: [] });

  try {
    const client = getApiClient(token);
    // Parallel fetch for bookings, accessories
    const [bookingsRes, accessoriesRes] = await Promise.all([
      client.get("/bookings"),
      client.get("/accessories"),
    ]);

    return json({
      bookings: bookingsRes.data.data || [],
      accessories: accessoriesRes.data.data || [],
    });
  } catch (error) {
    console.error("Dashboard Overview Loader Error:", error);
    return json({ bookings: [], accessories: [] });
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();
  const intent = formData.get("intent");

  const client = getApiClient(token);

  try {
    if (intent === "request_verification") {
      await client.put("/user/profile", { verification_status: "pending" });
      return json({ success: true });
    }

    if (intent === "add_accessory") {
      const bookingId = formData.get("booking_id");
      const accessoryId = formData.get("accessory_id");
      await client.post(`/bookings/${bookingId}/accessories`, { accessory_ids: [accessoryId] });
      return json({ success: true });
    }

    if (intent === "remove_accessory") {
      const bookingId = formData.get("booking_id");
      const accessoryId = formData.get("accessory_id");
      await client.delete(`/bookings/${bookingId}/accessories/${accessoryId}`);
      return json({ success: true });
    }

    if (intent === "confirm_received") {
      const bookingId = formData.get("booking_id");
      await client.post(`/bookings/${bookingId}/confirm-received`);
      return json({ success: true });
    }

    if (intent === "request_return") {
      const bookingId = formData.get("booking_id");
      // Note: formData should be sent as multipart/form-data for files
      await client.post(`/bookings/${bookingId}/request-return`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return json({ success: true });
    }

    if (intent === "get_payment_token") {
      const bookingId = formData.get("booking_id");
      const response = await client.get(`/bookings/${bookingId}/payment-token`);
      return json({ success: true, snap_token: response.data.snap_token });
    }

    if (intent === "pay_fine") {
      const bookingId = formData.get("booking_id");
      const response = await client.post(`/bookings/${bookingId}/pay-fine`);
      return json({ success: true, snap_token: response.data.snap_token });
    }
  } catch (error) {
    console.error("Dashboard Action Error:", error);
    const result = error.response?.data || {};
    return json({ error: result.message || "Gagal memproses permintaan." }, { status: error.response?.status || 500 });
  }

  return null;
};


export default function DashboardOverview() {
  const { user } = useOutletContext();
  const { bookings, accessories } = useLoaderData();
  const fetcher = useFetcher();
  const userName = user?.name || "Member";
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive status from user data
  const currentStatus = user.is_verified ? 'verified' : (user.verification_status || 'unverified');

  // Stats calculation
  const activeRentalsCount = bookings.filter(b =>
    ['Paid', 'Preparing', 'Rented', 'Pending_Payment'].includes(b.status)
  ).length;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
