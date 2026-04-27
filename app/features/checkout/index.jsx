import { useState, useMemo, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { useLoaderData, useActionData, Form, Link, useNavigate } from "@remix-run/react";
import { Navbar } from "../home-catalog/components/Navbar";
import { Footer } from "~/components/layout/Footer";
import { Button } from "~/components/ui/button";
import { DatePickerWithRange } from "~/components/ui/date-range-picker";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";

export default function CheckoutFeature() {
  const { user, costume, bookedDates: initialBookedDates, initialStartDate, initialEndDate } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const hasOpenedSnap = useRef(false);

  const [date, setDate] = useState({
    from: initialStartDate ? new Date(initialStartDate) : undefined,
    to: initialEndDate ? new Date(initialEndDate) : undefined,
  });
  const [notes, setNotes] = useState("");

  // Convert booked dates strings to Date objects
  const bookedDates = useMemo(() => {
    return (initialBookedDates || []).map(d => new Date(d));
  }, [initialBookedDates]);

  // Handle Midtrans Snap
  useEffect(() => {
    if (actionData?.snap_token && !hasOpenedSnap.current) {
      if (window.snap) {
        hasOpenedSnap.current = true;
        try {
          window.snap.pay(actionData.snap_token, {
            onSuccess: (result) => {
              console.log("Payment success:", result);
              navigate("/dashboard");
            },
            onPending: (result) => {
              console.log("Payment pending:", result);
              navigate("/dashboard");
            },
            onError: (result) => {
              console.error("Payment error:", result);
              hasOpenedSnap.current = false;
              alert("Terjadi kesalahan pada pembayaran.");
            },
            onClose: () => {
              console.log("Payment modal closed");
              hasOpenedSnap.current = false;
            }
          });
        } catch (err) {
          console.error("Snap Pay Error:", err);
          hasOpenedSnap.current = false;
        }
      } else {
        alert("Sistem pembayaran (Snap.js) sedang dimuat. Mohon tunggu sebentar.");
      }
    }
    
    // Reset ref if actionData is cleared
    if (!actionData?.snap_token) {
      hasOpenedSnap.current = false;
    }
  }, [actionData, navigate]);

  // Simple duration calculation
  const calculateDays = () => {
    if (!date?.from || !date?.to) return 0;
    const diffTime = Math.abs(date.to - date.from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const days = calculateDays();
  const totalPrice = costume.rental_price * days;
  const deposit = costume.required_deposit;
  const grandTotal = totalPrice + deposit;

  const isVerified = user.is_verified == 1 || user.is_verified === true || user.is_verified === "1";

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC] text-left">
      <Navbar user={user} />

      <main className="flex-1 py-12 relative overflow-hidden flex items-center justify-center">
        {/* Background Decorative Blur */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          
          {/* Header with Back Link */}
          <div className="flex items-center gap-4 mb-6">
            <Link to={`/catalog/${costume.slug}`} className="h-10 w-10 rounded-full bg-white flex items-center justify-center border hover:shadow-md transition-all">
              <Icons.ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800">Finalisasi Sewa</h1>
          </div>

          {/* Verification Warning Banner */}
          {!isVerified && (
            <div className="mb-8 p-6 rounded-[2rem] bg-rose-50 border-2 border-rose-100 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4">
              <div className="h-16 w-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
                <Icons.UserX className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-1 text-center md:text-left">
                <h4 className="text-lg font-black italic text-rose-900 uppercase tracking-tight">Akun Belum Terverifikasi</h4>
                <p className="text-sm font-medium text-rose-900/60 leading-relaxed italic">
                  Maaf, Anda harus melakukan verifikasi identitas (KTP/ID) terlebih dahulu sebelum dapat melakukan penyewaan kostum.
                </p>
              </div>
              <Link to="/dashboard" className="w-full md:w-auto">
                <Button className="w-full h-12 px-8 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-black uppercase text-[10px] tracking-widest transition-all">
                  Verifikasi Sekarang
                </Button>
              </Link>
            </div>
          )}

          {/* Action Error Message */}
          {actionData?.error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-600 text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-xl shadow-rose-200 animate-in zoom-in-95">
               <Icons.AlertCircle className="h-5 w-5" />
               {actionData.error}
            </div>
          )}

          {/* SINGLE CONSOLIDATED CARD */}
          <div className={`bg-white rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden ${!isVerified ? 'opacity-75 blur-[2px] pointer-events-none grayscale-[0.5]' : ''}`}>
            
            {/* 1. Header Section (Product Info) */}
            <div className="p-8 sm:p-12 border-b border-slate-50 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <Badge className="bg-primary/5 text-primary border-none px-4 py-2 text-[10px] font-black uppercase tracking-widest leading-none">
                     {costume.series}
                  </Badge>
               </div>

               <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                  <div className="w-40 h-48 rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl flex-shrink-0">
                     <img 
                        src={costume.images?.[0] ? `http://127.0.0.1:8000/storage/${costume.images[0].image_path}` : "https://via.placeholder.com/400"} 
                        className="w-full h-full object-cover" 
                        alt="" 
                     />
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-4xl font-black italic text-slate-900 leading-none">{costume.name}</h2>
                     <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">Size: {costume.size}</span>
                        <span className="px-4 py-1.5 rounded-full bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">{costume.category || "Cosplay"}</span>
                     </div>
                     <p className="text-sm font-medium text-slate-400 italic leading-relaxed max-w-md">
                        {costume.description || "Kostum premium dengan kualitas bahan terbaik untuk event cosplay Anda."}
                     </p>
                  </div>
               </div>
            </div>

            {/* 2. Content Grid (Dates & Address) */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
               {/* Left Column: Input Fields */}
               <div className="p-8 sm:p-12 space-y-10 border-r border-slate-50">
                  {/* Schedule Selection */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                           <Icons.Calendar className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black italic uppercase tracking-tight">Pilih Jadwal</h3>
                     </div>
                     <DatePickerWithRange 
                        date={date} 
                        setDate={setDate} 
                        className="w-full"
                        label="Durasi Rental"
                        bookedDates={bookedDates}
                     />
                  </div>

                  {/* Notes Field */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                           <Icons.MessageSquare className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black italic uppercase tracking-tight">Catatan Tambahan</h3>
                     </div>
                     <textarea 
                        placeholder="Contoh: Tolong pastikan ukurannya pas ya bangsss."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full min-h-[100px] p-4 rounded-3xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all resize-none"
                     />
                  </div>

                  {/* Shipping Info */}
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                              <Icons.MapPin className="h-5 w-5" />
                           </div>
                           <h3 className="text-lg font-black italic uppercase tracking-tight">Lokasi Pengiriman</h3>
                        </div>
                        <button className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline transition-all">Ubah</button>
                     </div>
                     <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                        <p className="text-sm font-black text-slate-800 mb-1">{user.name}</p>
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed italic line-clamp-2">
                           Griya Shanta Blok G-122, Lowokwaru, Kota Malang, Jawa Timur, 65145.
                        </p>
                     </div>
                  </div>
               </div>

               {/* Right Column: Order Summary */}
               <div className="p-8 sm:p-12 bg-slate-50/50 space-y-8 flex flex-col justify-between">
                  <div className="space-y-6">
                     <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-900 border-b border-slate-100 pb-4 flex items-center justify-between">
                        Ringkasan Biaya
                        <Icons.Calculator className="h-5 w-5 text-slate-300" />
                     </h3>
                     
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Sewa ({days} Hari)</span>
                           <span className="text-lg font-black italic text-slate-800">Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Jaminan (Deposit)</span>
                           <span className="text-lg font-black italic text-slate-800">Rp {deposit.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Pembayaran</span>
                           <Badge className="bg-blue-600 text-white border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Icons.ShieldCheck className="h-3 w-3" />
                              MIDTRANS SECURED
                           </Badge>
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-200 mt-8 space-y-8">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Total Pembayaran</span>
                           <div className="flex gap-1">
                              <Icons.ShieldCheck className="h-4 w-4 text-emerald-500" />
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Secure Transaction</span>
                           </div>
                        </div>
                        <p className="text-4xl font-black italic text-slate-900 leading-none">
                           Rp {grandTotal.toLocaleString('id-ID')}
                        </p>
                     </div>

                     <Form method="post">
                        <input type="hidden" name="costume_id" value={costume.id} />
                        <input type="hidden" name="start_date" value={date?.from ? format(date.from, "yyyy-MM-dd") : ""} />
                        <input type="hidden" name="end_date" value={date?.to ? format(date.to, "yyyy-MM-dd") : ""} />
                        <input type="hidden" name="duration_days" value={days} />
                        <input type="hidden" name="notes" value={notes} />

                        <Button 
                           type="submit" 
                           disabled={!date?.from || !date?.to || !isVerified}
                           className={`w-full h-18 rounded-[1.8rem] transition-all text-white font-black text-xl shadow-2xl group ${
                              !isVerified 
                              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                              : 'bg-slate-900 hover:bg-primary shadow-slate-900/20'
                           }`}
                        >
                           {isVerified ? (
                              <>
                                 Bayar Sekarang
                                 <Icons.ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                              </>
                           ) : (
                              <>
                                 <Icons.Lock className="mr-2 h-6 w-6" />
                                 Verifikasi Diperlukan
                              </>
                           )}
                        </Button>
                     </Form>
                  </div>
               </div>
            </div>

            {/* 3. Footer Trust Section */}
            <div className="bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/50">
               <div className="flex items-center gap-3">
                  <Icons.Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Proses Instan</span>
               </div>
               <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
               <div className="flex items-center gap-3">
                  <Icons.RefreshCcw className="h-4 w-4 text-emerald-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Refund Deposit 100%</span>
               </div>
               <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
               <div className="flex items-center gap-3">
                  <Icons.ShieldCheck className="h-4 w-4 text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Midtrans Secured</span>
               </div>
            </div>
          </div>

          <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-10">
            Pembayaran akan diproses secara aman melalui <span className="text-slate-900">Midtrans Snap</span>. Semua data Anda terenkripsi.
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
