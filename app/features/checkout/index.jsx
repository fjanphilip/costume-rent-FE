import { useState, useMemo, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { useLoaderData, useActionData, Form, Link, useNavigate, useNavigation } from "@remix-run/react";
import { getApiClient } from "~/lib/api";
import { Navbar } from "../home-catalog/components/Navbar";
import { Footer } from "~/components/layout/Footer";
import { Button } from "~/components/ui/button";
import { DatePickerWithRange } from "~/components/ui/date-range-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";

export default function CheckoutFeature() {
   const { user, costume, addresses, token: loaderToken, bookedDates: initialBookedDates, initialStartDate, initialEndDate } = useLoaderData();
   const actionData = useActionData();
   const navigate = useNavigate();
   const navigation = useNavigation();
   const hasOpenedSnap = useRef(false);

   // Reset flag saat user menekan tombol submit (navigation state berubah ke submitting)
   useEffect(() => {
      if (navigation.state === "submitting") {
         hasOpenedSnap.current = false;
      }
   }, [navigation.state]);

   const [date, setDate] = useState({
      from: initialStartDate ? new Date(initialStartDate) : undefined,
      to: initialEndDate ? new Date(initialEndDate) : undefined,
   });
   const [shippingRates, setShippingRates] = useState([]);
   const [selectedShipping, setSelectedShipping] = useState(null);
   const [isShippingLoading, setIsShippingLoading] = useState(false);
   const [shippingError, setShippingError] = useState(null);
   const [selectedAddressId, setSelectedAddressId] = useState(() => {
      const primary = (addresses || []).find(a => a.is_primary);
      return primary ? primary.id : (addresses?.[0]?.id || "");
   });
   const [token] = useState(useLoaderData().token || "");

   const handleOpenChange = (isOpen) => {
      // Empty handler, can be used for other popover close side-effects in the future
   };
   const [notes, setNotes] = useState("");
   const [selectedAccessories, setSelectedAccessories] = useState([]);

   const toggleAccessory = (accId) => {
      setSelectedAccessories(prev =>
         prev.includes(accId)
            ? prev.filter(id => id !== accId)
            : [...prev, accId]
      );
   };

   // Convert booked dates strings to Date objects
   const bookedDates = useMemo(() => {
      return (initialBookedDates || []).map(d => new Date(d));
   }, [initialBookedDates]);

   const [showManualPay, setShowManualPay] = useState(false);

   // Handle Midtrans Snap
   useEffect(() => {
      if (actionData?.snap_token && !hasOpenedSnap.current) {
         console.log("Midtrans Token Received:", actionData.snap_token);

         if (window.snap) {
            hasOpenedSnap.current = true;
            setShowManualPay(false);

            const triggerSnap = () => {
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
                     setShowManualPay(true);
                     alert("Terjadi kesalahan pada pembayaran. Anda dapat mencoba lagi nanti di Dashboard.");
                     navigate("/dashboard");
                  },
                  onClose: () => {
                     console.log("Payment modal closed");
                     hasOpenedSnap.current = false;
                     setShowManualPay(true);
                     alert("Pembayaran belum selesai. Pesanan Anda disimpan di Dashboard selama 15 menit.");
                     navigate("/dashboard");
                  }
               });
            };

            // Jalankan dengan sedikit delay untuk memastikan DOM stabil
            const timer = setTimeout(triggerSnap, 500);
            return () => clearTimeout(timer);
         } else {
            setShowManualPay(true);
            console.error("Midtrans Snap.js not loaded");
         }
      }
   }, [actionData, navigate, actionData?.timestamp]); // Gunakan timestamp sebagai trigger tambahan

   // Simple duration calculation
   const calculateDays = () => {
      if (!date?.from || !date?.to) return 3;
      const diffTime = Math.abs(date.to - date.from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? Math.max(diffDays, 3) : 3;
   };

   const days = calculateDays();

   // Manual Fetch Shipping Rates
   const handleCheckShipping = async () => {
      if (!selectedAddressId || !costume.id) return;

      setIsShippingLoading(true);
      setShippingError(null);
      setShippingRates([]);

      try {
         const client = getApiClient(loaderToken);
         const response = await client.post("/shipping/get-rates", {
            address_id: selectedAddressId,
            costume_id: costume.id
         });

         if (response.data.status === "success") {
            const rates = response.data.data;
            setShippingRates(rates);
         } else {
            setShippingError(response.data.message || "Gagal mengambil data ongkir.");
         }
      } catch (error) {
         console.error("Shipping Fetch Error:", error);
         setShippingError(error.response?.data?.message || "Terjadi kesalahan koneksi saat mengambil ongkir.");
      } finally {
         setIsShippingLoading(false);
      }
   };

   // Reset shipping when address changes
   useEffect(() => {
      setShippingRates([]);
      setSelectedShipping(null);
      setShippingError(null);
   }, [selectedAddressId]);

   const totalPrice = costume.rental_price * days;
   const deposit = costume.required_deposit;

   const accessoriesTotal = useMemo(() => {
      if (!costume.accessories) return 0;
      return costume.accessories
         .filter(acc => selectedAccessories.includes(acc.id))
         .reduce((sum, acc) => sum + acc.rental_price, 0);
   }, [costume.accessories, selectedAccessories]);

   const shippingPrice = selectedShipping ? selectedShipping.price : 0;
   const grandTotal = totalPrice + deposit + accessoriesTotal + shippingPrice;

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
                              src={costume.images?.[0] ? `${costume.images[0].image_path}` : "https://via.placeholder.com/400"}
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
                              onOpenChange={handleOpenChange}
                              className="w-full"
                              label="Durasi Rental"
                              bookedDates={bookedDates}
                           />
                           <p className="text-[10px] text-primary/80 font-bold italic mt-2">* Minimal durasi penyewaan adalah 3 hari.</p>
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

                        {/* Accessories Selection */}
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                                    <Icons.PlusSquare className="h-5 w-5" />
                                 </div>
                                 <h3 className="text-lg font-black italic uppercase tracking-tight">Tambah Aksesoris</h3>
                              </div>
                              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200">{costume.accessories?.length || 0} Opsi</Badge>
                           </div>

                           <div className="grid grid-cols-1 gap-3">
                              {costume.accessories && costume.accessories.length > 0 ? (
                                 costume.accessories.map((acc) => (
                                    <div
                                       key={acc.id}
                                       onClick={() => toggleAccessory(acc.id)}
                                       className={`group p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedAccessories.includes(acc.id)
                                          ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10'
                                          : 'bg-white border-slate-100 hover:border-slate-200'
                                          }`}
                                    >
                                       <div className="flex items-center gap-4">
                                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center overflow-hidden transition-all ${selectedAccessories.includes(acc.id) ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                                             }`}>
                                             {acc.image_path ? (
                                                <img src={acc.image_path} alt={acc.name} className="h-full w-full object-cover" />
                                             ) : (
                                                <Icons.Gem className="h-5 w-5" />
                                             )}
                                          </div>
                                          <div className="text-left">
                                             <p className={`text-sm font-black italic uppercase tracking-tight ${selectedAccessories.includes(acc.id) ? 'text-primary' : 'text-slate-700'}`}>{acc.name}</p>
                                             <p className="text-[10px] font-bold text-slate-400 italic capitalize">{acc.category || 'Aksesoris'}</p>
                                          </div>
                                       </div>
                                       <div className="text-right flex flex-col items-end gap-1">
                                          <p className={`text-sm font-black italic ${selectedAccessories.includes(acc.id) ? 'text-primary' : 'text-slate-900'}`}>+ Rp {acc.rental_price.toLocaleString('id-ID')}</p>
                                          {selectedAccessories.includes(acc.id) && (
                                             <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-500 animate-in zoom-in-95">
                                                <Icons.CheckCircle2 className="h-2 w-2" />
                                                Ditambahkan
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 ))
                              ) : (
                                 <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center">
                                    <Icons.Inbox className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-xs font-bold text-slate-400 italic">Tidak ada aksesoris tambahan untuk kostum ini.</p>
                                 </div>
                              )}
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
                              {accessoriesTotal > 0 && (
                                 <div className="flex justify-between items-center text-primary animate-in slide-in-from-right-4">
                                    <span className="text-[11px] font-black uppercase tracking-widest italic">Aksesoris Tambahan</span>
                                    <span className="text-lg font-black italic">+ Rp {accessoriesTotal.toLocaleString('id-ID')}</span>
                                 </div>
                              )}
                              {selectedShipping && (
                                 <div className="flex justify-between items-center text-slate-600">
                                    <span className="text-[11px] font-black uppercase tracking-widest italic">Ongkos Kirim</span>
                                    <span className="text-lg font-black italic">+ Rp {selectedShipping.price.toLocaleString('id-ID')}</span>
                                 </div>
                              )}
                              <div className="flex justify-between items-center">
                                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Pembayaran</span>
                                 <Badge className="bg-blue-600 text-white border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <Icons.ShieldCheck className="h-3 w-3" />
                                    MIDTRANS SECURED
                                 </Badge>
                              </div>
                           </div>

                           <div className="space-y-8 pt-6 border-t border-slate-100">
                              {/* 1. Address Selection Dropdown */}
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <Icons.MapPin className="h-4 w-4 text-slate-400" />
                                       <h3 className="text-[11px] font-black italic uppercase tracking-widest text-slate-900">Lokasi Pengiriman</h3>
                                    </div>
                                    <Link to="/dashboard/settings" className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline transition-all">Kelola Alamat</Link>
                                 </div>

                                 <div className="space-y-3">
                                    {addresses && addresses.length > 0 ? (
                                       <div className="relative group">
                                          <select
                                             value={selectedAddressId}
                                             onChange={(e) => setSelectedAddressId(e.target.value)}
                                             className="w-full h-14 pl-5 pr-10 rounded-2xl bg-white border-2 border-slate-100 shadow-sm text-xs font-bold text-slate-800 outline-none focus:border-primary/20 transition-all appearance-none cursor-pointer group-hover:border-slate-200"
                                             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1em' }}
                                          >
                                             {addresses.map(addr => (
                                                <option key={addr.id} value={addr.id}>
                                                   {addr.label} - {addr.receiver_name}
                                                </option>
                                             ))}
                                          </select>
                                       </div>
                                    ) : null}

                                    <div className="p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                                       <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                                       <div className="relative z-10">
                                          {addresses && addresses.find(a => a.id == selectedAddressId) ? (
                                             (() => {
                                                const addr = addresses.find(a => a.id == selectedAddressId);
                                                return (
                                                   <>
                                                      <p className="text-xs font-black text-slate-800 mb-1 flex items-center gap-2">
                                                         {addr.receiver_name}
                                                         {addr.is_primary ? <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[7px] px-2 py-0">PRIMARY</Badge> : ""}
                                                      </p>
                                                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic line-clamp-2">
                                                         {addr.detail_address}, {addr.village_name}, {addr.district_name}, {addr.city_name}
                                                      </p>
                                                   </>
                                                );
                                             })()
                                          ) : (
                                             <p className="text-[10px] font-bold text-rose-500 italic">Silakan pilih atau atur alamat pengiriman.</p>
                                          )}
                                       </div></div></div>

                                 {/* 2. Shipping Options Selection */}
                                 <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <Icons.Truck className="h-4 w-4 text-slate-400" />
                                          <h3 className="text-[11px] font-black italic uppercase tracking-widest text-slate-900">Opsi Pengiriman</h3>
                                       </div>
                                       {isShippingLoading && (
                                          <div className="flex items-center gap-2 animate-pulse">
                                             <span className="text-[9px] font-black uppercase tracking-tighter text-primary">Mencari Biaya...</span>
                                             <Icons.Loader2 className="h-3 w-3 animate-spin text-primary" />
                                          </div>
                                       )}
                                    </div>

                                    <div className="space-y-4">
                                       {(!shippingRates || shippingRates.length === 0) && !isShippingLoading && (
                                          <Button
                                             type="button"
                                             onClick={handleCheckShipping}
                                             disabled={!selectedAddressId}
                                             className="w-full h-14 rounded-2xl bg-white border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 text-slate-600 hover:text-primary font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 group"
                                          >
                                             <Icons.Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                             Cek Biaya Pengiriman Sekarang
                                          </Button>
                                       )}

                                       <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">

                                          {isShippingLoading && (
                                             <div className="space-y-2">
                                                {[1, 2, 3].map(i => (
                                                   <div key={`skeleton-${i}`} className="h-16 w-full bg-white border border-slate-100 rounded-2xl animate-pulse flex items-center px-4 gap-4">
                                                      <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                                                      <div className="flex-1 space-y-2">
                                                         <div className="h-3 w-24 bg-slate-100 rounded" />
                                                         <div className="h-2 w-16 bg-slate-50 rounded" />
                                                      </div>
                                                   </div>
                                                ))}
                                             </div>
                                          )}

                                          {!isShippingLoading && shippingRates && shippingRates.length > 0 && (
                                             <div className="space-y-2">
                                                {shippingRates.map((rate, idx) => (
                                                   <div
                                                      key={`rate-${rate.courier_code}-${rate.courier_service_code}-${idx}`}
                                                      onClick={() => setSelectedShipping(rate)}
                                                      className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedShipping?.courier_service_code === rate.courier_service_code && selectedShipping?.courier_code === rate.courier_code
                                                         ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5'
                                                         : 'bg-white border-slate-50 hover:border-slate-200'
                                                         }`}
                                                   >
                                                      <div className="flex items-center gap-3">
                                                         <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                                                            <img
                                                               src={rate.courier_logo}
                                                               alt={rate.courier_name}
                                                               className="h-full w-full object-contain p-1"
                                                               onError={(e) => {
                                                                  e.target.onerror = null;
                                                                  e.target.src = `https://ui-avatars.com/api/?name=${rate.courier_code}&background=random&color=fff&font-size=0.33`;
                                                               }}
                                                            />
                                                         </div>
                                                         <div>
                                                            <p className="text-[11px] font-black text-slate-800 uppercase leading-none mb-1">
                                                               {rate.courier_name} <span className="text-primary">{rate.courier_service_name}</span>
                                                            </p>
                                                            <div className="flex items-center gap-1.5">
                                                               <Icons.Clock className="h-2.5 w-2.5 text-slate-300" />
                                                               <p className="text-[9px] font-bold text-slate-400 italic">Estimasi {rate.duration}</p>
                                                            </div>
                                                         </div>
                                                      </div>
                                                      <div className="text-right">
                                                         <p className={`text-sm font-black italic ${selectedShipping?.courier_service_code === rate.courier_service_code ? 'text-primary' : 'text-slate-900'}`}>
                                                            Rp {rate.price.toLocaleString('id-ID')}
                                                         </p>
                                                      </div>
                                                   </div>
                                                ))}
                                             </div>
                                          )}

                                          {!isShippingLoading && (!shippingRates || shippingRates.length === 0) && (
                                             <div className="p-8 rounded-[2rem] bg-rose-50/50 border border-dashed border-rose-200 text-center space-y-2">
                                                <Icons.Truck className="h-6 w-6 text-rose-300 mx-auto" />
                                                <div className="text-[10px] font-bold text-rose-600 italic leading-relaxed">
                                                   {shippingError || (addresses && addresses.length > 0 ? "Tidak ada layanan pengiriman tersedia untuk alamat ini." : "Pilih alamat terlebih dahulu.")}
                                                </div>
                                             </div>
                                          )}
                                       </div></div></div>
                              </div>

                              {/* Price Breakdown Breakdown */}
                              <div className="pt-8 border-t border-slate-100 space-y-3">
                                 <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>Sewa Kostum ({days} Hari)</span>
                                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                                 </div>
                                 <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>Deposit Keamanan (Refundable)</span>
                                    <span>Rp {deposit.toLocaleString('id-ID')}</span>
                                 </div>
                                 {accessoriesTotal > 0 && (
                                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                       <span>Aksesoris</span>
                                       <span>Rp {accessoriesTotal.toLocaleString('id-ID')}</span>
                                    </div>
                                 )}
                                 <div className="flex justify-between items-center text-[11px] font-bold text-primary uppercase tracking-widest">
                                    <span>Biaya Pengiriman</span>
                                    {selectedShipping ? (
                                       <span>Rp {selectedShipping.price.toLocaleString('id-ID')}</span>
                                    ) : (
                                       <span className="italic text-[9px] text-slate-400 lowercase font-medium">Pilih kurir...</span>
                                    )}
                                 </div>
                              </div>

                              <div className="pt-6 border-t border-slate-200 mt-6 space-y-8">
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
                                    <input
                                       type="hidden"
                                       name="shipping_address"
                                       value={(() => {
                                          const p = addresses?.find(a => a.id == selectedAddressId);
                                          if (!p) return "";
                                          return `${p.receiver_name} | ${p.phone_number} | ${p.detail_address}, ${p.village_name}, ${p.district_name}, ${p.city_name}, ${p.province_name} ${p.postal_code}`;
                                       })()}
                                    />
                                    {selectedShipping && (
                                       <>
                                          <input type="hidden" name="courier_name" value={selectedShipping.courier_name} />
                                          <input type="hidden" name="courier_service" value={selectedShipping.courier_service_name} />
                                          <input type="hidden" name="shipping_cost" value={selectedShipping.price} />
                                       </>
                                    )}
                                    {selectedAccessories.map(id => (
                                       <input key={id} type="hidden" name="accessory_ids" value={id} />
                                    ))}

                                    {showManualPay && actionData?.snap_token && (
                                       <Button
                                          type="button"
                                          onClick={() => {
                                             window.snap.pay(actionData.snap_token, {
                                                onClose: () => setShowManualPay(true),
                                                onSuccess: () => navigate("/dashboard")
                                             });
                                          }}
                                          className="w-full h-18 mb-4 rounded-[1.8rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-2xl animate-bounce"
                                       >
                                          Buka Jendela Pembayaran
                                          <Icons.ExternalLink className="ml-2 h-6 w-6" />
                                       </Button>
                                    )}

                                    {actionData?.error && (
                                       <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-3">
                                          <Icons.AlertTriangle className="h-5 w-5 shrink-0" />
                                          <p>{actionData.error}</p>
                                       </div>
                                    )}

                                    <Button
                                       type="submit"
                                       disabled={!date?.from || !date?.to || !isVerified || !selectedShipping || navigation.state === "submitting"}
                                       className={`w-full h-18 rounded-[1.8rem] transition-all text-white font-black text-xl shadow-2xl group ${!date?.from || !date?.to || !isVerified || !selectedShipping || navigation.state === "submitting"
                                          ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                          : 'bg-slate-900 hover:bg-primary shadow-slate-900/20'
                                          }`}
                                    >
                                       {navigation.state === "submitting" ? (
                                          <>
                                             <Icons.Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                             Memproses...
                                          </>
                                       ) : isVerified ? (
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

                     </div>
                  </div>

                  {/* Card Footer Trust Section */}
                  <div className="bg-slate-100/80 backdrop-blur-md px-6 sm:px-10 py-5 border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-5">
                     <div className="flex items-center gap-3 text-slate-500">
                        <div className="h-7 w-7 rounded-full bg-slate-200/50 flex items-center justify-center shrink-0 border border-slate-200/50">
                           <Icons.Lock className="h-3.5 w-3.5 text-slate-600" />
                        </div>
                        <p className="text-[11px] sm:text-xs font-medium">
                           Pembayaran Anda dijamin aman & terenkripsi oleh <span className="font-bold text-slate-700">Midtrans</span>.
                        </p>
                     </div>

                     <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                           <Icons.Zap className="h-4 w-4 text-amber-500" />
                           <span className="text-[11px] sm:text-xs font-bold text-slate-700">Proses Instan</span>
                        </div>
                        <div className="h-3 w-[1px] bg-slate-200"></div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                           <Icons.RefreshCcw className="h-4 w-4 text-emerald-500" />
                           <span className="text-[11px] sm:text-xs font-bold text-slate-700">Refund 100%</span>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </main>
         <Footer />
      </div >
   );
}





