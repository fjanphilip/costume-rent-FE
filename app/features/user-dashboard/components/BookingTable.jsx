import { useState } from "react";
import * as Icons from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "~/components/ui/dialog";
import { Link, useFetcher } from "@remix-run/react";

export function BookingTable({ 
  bookings = [], 
  title = "Recent Bookings",
  showViewAll = true,
  accessories = []
}) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnResi, setReturnResi] = useState("");
  const [returnFile, setReturnFile] = useState(null);
  const fetcher = useFetcher();

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
      case 'Completed':
        return 'bg-emerald-500 text-white shadow-emerald-500/20';
      case 'Pending_Payment':
      case 'Preparing':
        return 'bg-amber-500 text-white shadow-amber-500/20';
      case 'Rented':
        return 'bg-blue-600 text-white shadow-blue-500/20';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-rose-500 text-white shadow-rose-500/20';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  const handleCopyResi = (resi) => {
    navigator.clipboard.writeText(resi);
    alert('Nomor Resi berhasil disalin!');
  };

  const handleConfirmReceived = (bookingId) => {
    if (confirm('Konfirmasi bahwa barang sudah Anda terima dengan baik?')) {
      fetcher.submit(
        { intent: 'confirm_received', booking_id: bookingId },
        { method: 'post' }
      );
    }
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnResi || !returnFile) {
      alert("Harap isi nomor resi dan upload bukti pengiriman.");
      return;
    }

    const formData = new FormData();
    formData.append("intent", "request_return");
    formData.append("booking_id", selectedBooking.id);
    formData.append("return_tracking_number", returnResi);
    formData.append("return_proof_image", returnFile);

    fetcher.submit(formData, { method: "post", encType: "multipart/form-data" });
    setReturnModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
        <h3 className="font-black text-xl italic uppercase tracking-tight">{title}</h3>
        {showViewAll && (
          <Link to="/dashboard/bookings">
            <Button variant="ghost" size="sm" className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 rounded-xl px-4">
              View All Bookings
            </Button>
          </Link>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-slate-50/30">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Costume / Code</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rental Period</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nomor Resi</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Fee</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.length > 0 ? bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-12 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm flex-shrink-0">
                      <img 
                        src={booking.costume?.images?.[0] ? `http://127.0.0.1:8000/storage/${booking.costume.images[0].image_path}` : "https://via.placeholder.com/100"} 
                        className="w-full h-full object-cover"
                        alt={booking.costume?.name}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <span className="font-bold text-sm text-slate-900 line-clamp-1">{booking.costume?.name || "Deleted Costume"}</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.booking_code}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700 italic">{formatDate(booking.start_date)}</span>
                      <span className="text-[10px] font-medium text-slate-400 italic">sampai {formatDate(booking.end_date)}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   {booking.tracking_number ? (
                     <div className="flex items-center gap-2">
                        <div className="bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                           <Icons.Truck className="h-3 w-3 text-primary" />
                           <span className="text-[10px] font-black text-primary tracking-widest uppercase">{booking.tracking_number}</span>
                        </div>
                        <button 
                          onClick={() => handleCopyResi(booking.tracking_number)}
                          className="p-2 hover:bg-primary hover:text-white bg-slate-50 text-slate-400 rounded-lg transition-all active:scale-95 border border-slate-100"
                        >
                           <Icons.Copy className="h-3 w-3" />
                        </button>
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-slate-300 italic">
                        <Icons.Clock className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Menunggu Admin</span>
                     </div>
                   )}
                </td>
                <td className="px-8 py-6">
                   <span className="text-base font-black italic text-slate-900">
                     Rp {Number(booking.total_rental_fee).toLocaleString('id-ID')}
                   </span>
                </td>
                <td className="px-8 py-6">
                   <Badge className={`border-none font-black text-[9px] rounded-lg px-3 py-1 tracking-widest shadow-sm ${getStatusColor(booking.status)}`}>
                     {booking.status.toUpperCase()}
                   </Badge>
                </td>
                 <td className="px-8 py-6">
                    <div className="flex gap-2">
                       <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest border-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
                        onClick={() => setSelectedBooking(booking)}
                       >
                        Detail
                       </Button>
                       
                       {booking.status === 'Shipping' && (
                         <Button 
                          size="sm" 
                          className="rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95"
                          onClick={() => handleConfirmReceived(booking.id)}
                         >
                          Terima Barang
                         </Button>
                       )}

                       {booking.status === 'Rented' && (
                         <Button 
                          size="sm" 
                          className="rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-95"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setReturnModalOpen(true);
                          }}
                         >
                          Ajukan Pengembalian
                         </Button>
                       )}
                    </div>
                 </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Icons.ShoppingBag className="h-16 w-16" />
                    <p className="text-sm font-black uppercase tracking-[0.3em] italic">Belum ada pesanan</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Detail Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-[3rem] border-none shadow-2xl">
            {selectedBooking && (
              <div className="flex flex-col">
                <div className="p-10 pb-8 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${getStatusColor(selectedBooking.status)}`}>
                                <Icons.Package className="h-7 w-7" />
                            </div>
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Detail Pesanan</DialogTitle>
                            <DialogDescription className="text-[10px] font-black text-slate-400 italic uppercase tracking-widest mt-1">Code: {selectedBooking.booking_code}</DialogDescription>
                        </div>
                        <Badge className={`border-none font-black text-[10px] rounded-full px-5 py-1 tracking-widest shadow-xl ${getStatusColor(selectedBooking.status)}`}>
                            {selectedBooking.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div className="flex gap-6 items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="h-20 w-16 rounded-xl overflow-hidden bg-white border-2 border-white shadow-sm flex-shrink-0">
                           <img 
                              src={selectedBooking.costume?.images?.[0] ? `http://127.0.0.1:8000/storage/${selectedBooking.costume.images[0].image_path}` : "https://via.placeholder.com/100"} 
                              className="w-full h-full object-cover"
                              alt=""
                           />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kostum Disewa</p>
                           <p className="text-base font-bold text-slate-900 italic">{selectedBooking.costume?.name}</p>
                           <p className="text-[10px] font-bold text-primary italic uppercase tracking-wider">Size {selectedBooking.costume?.size}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mulai Sewa</p>
                            <p className="text-sm font-bold text-slate-800 italic">{formatDate(selectedBooking.start_date)}</p>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kembali</p>
                            <p className="text-sm font-bold text-slate-800 italic">{formatDate(selectedBooking.end_date)}</p>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex flex-col gap-6 text-white">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Total Biaya Sewa</p>
                                <p className="text-3xl font-black italic tracking-tighter">Rp {Number(selectedBooking.total_rental_fee).toLocaleString('id-ID')}</p>
                            </div>
                            <Icons.CreditCard className="h-10 w-10 text-primary" />
                        </div>
                        
                        {selectedBooking.tracking_number && (
                           <div className="pt-6 border-t border-white/10 flex flex-col gap-2">
                               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                  <Icons.Truck className="h-3 w-3" /> Nomor Resi Pengiriman
                               </p>
                               <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                                  <span className="text-sm font-black tracking-widest text-white">{selectedBooking.tracking_number}</span>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 text-[9px] font-black uppercase text-primary hover:bg-primary/10"
                                    onClick={() => handleCopyResi(selectedBooking.tracking_number)}
                                  >
                                    Copy
                                  </Button>
                               </div>
                           </div>
                        )}
                    </div>

                    <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Jaminan (Deposit)</span>
                            <span className="font-black text-slate-900 italic">Rp {Number(selectedBooking.locked_deposit_amount).toLocaleString('id-ID')}</span>
                        </div>
                        {selectedBooking.total_fine > 0 && (
                           <div className="flex justify-between items-center text-xs text-rose-600 pt-2 border-t border-slate-200">
                               <span className="font-bold uppercase tracking-widest text-[9px]">Total Denda</span>
                               <span className="font-black italic">Rp {Number(selectedBooking.total_fine).toLocaleString('id-ID')}</span>
                           </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aksesoris Tambahan</p>
                            {['Paid', 'Preparing'].includes(selectedBooking.status) && (
                                <div className="relative group">
                                    <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg border border-primary/20">
                                        + Tambah
                                    </Button>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="max-h-48 overflow-y-auto space-y-1">
                                            {accessories.map(acc => (
                                                <button 
                                                    key={acc.id}
                                                    onClick={() => fetcher.submit({ intent: 'add_accessory', booking_id: selectedBooking.id, accessory_id: acc.id }, { method: 'post' })}
                                                    className="w-full text-left p-2 hover:bg-slate-50 rounded-lg flex flex-col gap-0.5"
                                                >
                                                    <span className="text-[10px] font-bold text-slate-900">{acc.name}</span>
                                                    <span className="text-[9px] font-medium text-primary">Rp {Number(acc.price).toLocaleString('id-ID')}</span>
                                                </button>
                                            ))}
                                            {accessories.length === 0 && <p className="text-[9px] text-center p-2 italic text-slate-400">No accessories</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            {selectedBooking.accessories?.length > 0 ? selectedBooking.accessories.map(acc => (
                                <div key={acc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-800">{acc.name}</span>
                                        <span className="text-[9px] font-medium text-slate-400 italic">Rp {Number(acc.price).toLocaleString('id-ID')}</span>
                                    </div>
                                    {['Paid', 'Preparing'].includes(selectedBooking.status) && (
                                        <button 
                                            onClick={() => fetcher.submit({ intent: 'remove_accessory', booking_id: selectedBooking.id, accessory_id: acc.id }, { method: 'post' })}
                                            className="h-7 w-7 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Icons.Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )) : (
                                <p className="text-[10px] text-slate-400 italic font-medium">Belum ada aksesoris tambahan.</p>
                            )}
                        </div>
                    </div>

                    <Button 
                        className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-primary transition-all text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10"
                        onClick={() => setSelectedBooking(null)}
                    >
                        Tutup Detail
                    </Button>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>

      {/* Return Application Modal */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-[3rem] border-none shadow-2xl">
          <div className="p-10 space-y-8">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Ajukan Pengembalian</DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400 italic">
                Harap masukkan nomor resi dan foto paket yang dikembalikan.
              </DialogDescription>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor Resi Pengembalian</label>
                <input 
                  type="text" 
                  value={returnResi}
                  onChange={(e) => setReturnResi(e.target.value)}
                  className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Contoh: JNE123456789"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bukti Pengiriman (Foto Paket)</label>
                <div className="relative h-40 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors group cursor-pointer overflow-hidden">
                  {returnFile ? (
                    <img src={URL.createObjectURL(returnFile)} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <Icons.Upload className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klik untuk upload foto</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    onChange={(e) => setReturnFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button"
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                  onClick={() => setReturnModalOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/10"
                >
                  Kirim Pengajuan
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
