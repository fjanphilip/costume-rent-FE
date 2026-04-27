import { useOutletContext, useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import { useState, useRef } from "react";
import * as Icons from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { TransactionTable } from "~/features/user-dashboard/components/TransactionTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/deposit/transactions", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return json({ transactions: data.data || [] });
    }
  } catch (error) {
    console.error("Transactions Loader Error:", error);
  }

  return json({ transactions: [] });
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

    // Fallback success for simulation if API not ready
    return json({ success: true });
  }

  return null;
};

export default function DashboardOverview() {
  const { user } = useOutletContext();
  const { transactions } = useLoaderData();
  const fetcher = useFetcher();
  const userName = user?.name || "Member";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Derive status from user data
  const currentStatus = user.is_verified ? 'verified' : (user.verification_status || 'unverified');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerificationSubmit = () => {
    // 1. WhatsApp Redirection
    const adminPhone = "6283832352467"; // Nomor admin
    const message = `Permintaan verifikasi identitas untuk: ${userName}`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

    // Buka WhatsApp di tab baru
    window.open(whatsappUrl, '_blank');

    // 2. Update Backend State ke 'Pending'
    fetcher.submit(
      { intent: "request_verification" },
      { method: "post" }
    );

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1 text-left">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight italic leading-tight">Halo, {userName}! 👋</h1>
        <p className="text-muted-foreground text-xs sm:text-sm font-medium italic">Selamat datang kembali. Cek status penyewaan kostum kamu di sini.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-primary text-white overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Points</span>
              <Icons.Zap className="h-5 w-5 fill-white/20" />
            </div>
            <p className="text-4xl font-black italic">2,450</p>
            <p className="text-[10px] mt-2 font-bold opacity-60 italic">Setara dengan Rp 24.500</p>
          </CardContent>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Rentals</span>
              <Icons.Clock className="h-5 w-5 text-primary" />
            </div>
            <p className="text-4xl font-black text-foreground italic">01</p>
            <p className="text-[10px] mt-2 font-bold text-emerald-500 flex items-center gap-1 italic">
              <Icons.CheckCircle2 className="h-3 w-3" /> Ready for pickup
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wishlist</span>
              <Icons.Heart className="h-5 w-5 text-rose-500 fill-rose-500/10" />
            </div>
            <p className="text-4xl font-black text-foreground italic">12</p>
            <p className="text-[10px] mt-2 font-bold text-muted-foreground italic">Kostum impian kamu</p>
          </CardContent>
        </Card>
      </div>

      <TransactionTable transactions={transactions.slice(0, 5)} title="Recent Activity" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {currentStatus === 'verified' ? (
          /* VERIFIED STATE CARD */
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
          /* PENDING STATE CARD */
          <div className="bg-amber-500 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl shadow-amber-500/20 border border-amber-400">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Icons.Clock className="h-5 w-5" />
                </div>
                <h4 className="text-xl font-black italic uppercase tracking-tight">Menunggu Persetujuan Admin</h4>
              </div>
              <p className="text-white/90 text-xs max-w-[220px] font-medium italic leading-relaxed">
                Permintaan verifikasi Anda telah dikirim dan sedang ditinjau. Mohon tunggu informasi selanjutnya.
              </p>
              <div className="bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit border border-white/20">Sedang Diproses</div>
            </div>
            <Icons.ShieldAlert className="absolute -right-8 -bottom-8 h-48 w-48 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
          </div>
        ) : (
          /* UNVERIFIED STATE CARD (Direct WhatsApp Redirect) */
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

        <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-transform">
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
