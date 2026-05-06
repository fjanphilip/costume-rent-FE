import { useState, useEffect } from "react";
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
  const [fineModalOpen, setFineModalOpen] = useState(false);
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
    const statusVal = (status?.value || status || '').toString();
    switch (statusVal) {
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
      case 'Returned':
        return 'bg-slate-600 text-white shadow-slate-600/20';
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

  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.data?.error) {
      alert("Terjadi Kesalahan: " + fetcher.data.error);
    } else if (fetcher.data?.success && fetcher.data?.snap_token) {
      // Tutup semua modal dashboard sebelum membuka Midtrans
      setSelectedBooking(null);
      setFineModalOpen(false);
      setReturnModalOpen(false);

      if (window.snap) {
        window.snap.pay(fetcher.data.snap_token, {
          onSuccess: () => window.location.reload(),
          onPending: () => window.location.reload(),
          onError: () => alert("Pembayaran gagal."),
          onClose: () => console.log("Snap closed")
        });
      } else {
        alert("Sistem pembayaran Midtrans belum siap. Coba muat ulang halaman.");
      }
    } else if (fetcher.data?.success && !fetcher.data?.snap_token) {
       // Operasi lain yang berhasil (misal: submit resi) tanpa snap_token
       // Kita bisa memberi tahu user (opsional) atau membiarkan UI refresh sendiri
       if (fetcher.formData?.get('intent') === 'request_return') {
          alert("Pengajuan pengembalian berhasil dikirim!");
       }
    }
  }, [fetcher.data]);

  const handlePayment = (bookingId) => {
    fetcher.submit(
      { intent: "get_payment_token", booking_id: bookingId },
      { method: "post" }
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
        <h3 className="font-bold text-xl ">{title}</h3>
        {showViewAll && (
          <Link to="/dashboard/bookings">
            <Button variant="ghost" size="sm" className="text-primary font-semibold text-xs hover:bg-primary/5 rounded-xl px-4">
              View All Bookings
            </Button>
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase ">Costume / Code</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase ">Rental Period</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase ">Nomor Resi</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase ">Total Fee</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase ">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase ">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.length > 0 ? bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-12 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm flex-shrink-0">
                      <img
                        src={booking.costume?.images?.[0] ? `${booking.costume.images[0].image_path}` : "https://via.placeholder.com/100"}
                        className="w-full h-full object-cover"
                        alt={booking.costume?.name}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-slate-900 line-clamp-1">{booking.costume?.name || "Deleted Costume"}</span>
                      <span className="text-xs text-slate-500">{booking.booking_code}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-slate-700">{formatDate(booking.start_date)}</span>
                    <span className="text-xs text-slate-400">sampai {formatDate(booking.end_date)}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {booking.tracking_number ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <Icons.Truck className="h-3 w-3 text-primary" />
                        <span className="text-xs font-semibold text-primary  uppercase">{booking.tracking_number}</span>
                      </div>
                      <button
                        onClick={() => handleCopyResi(booking.tracking_number)}
                        className="p-2 hover:bg-primary hover:text-white bg-slate-50 text-slate-400 rounded-lg transition-all active:scale-95 border border-slate-100"
                      >
                        <Icons.Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-300 ">
                      <Icons.Clock className="h-3 w-3" />
                      <span className="text-xs font-medium">Menunggu Admin</span>
                    </div>
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-slate-900">
                      Rp {(
                        Number(booking.total_rental_fee) +
                        Number(booking.locked_deposit_amount) +
                        Number(booking.shipping_cost || 0) +
                        (booking.accessories?.reduce((sum, acc) => sum + Number(acc.pivot?.price_at_booking || acc.rental_price), 0) || 0)
                      ).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Grand Total</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <Badge className={`border-none font-bold text-[10px] rounded-lg px-3 py-1  shadow-sm ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-9 px-4 text-xs font-semibold border hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      Detail
                    </Button>

                    {((booking.status?.value || booking.status) === 'Pending_Payment') && (
                      <Button
                        size="sm"
                        className="rounded-lg h-9 px-4 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-95"
                        onClick={() => handlePayment(booking.id)}
                      >
                        Bayar Sekarang
                      </Button>
                    )}

                    {((booking.status?.value || booking.status) === 'Shipping') && (
                      <Button
                        size="sm"
                        className="rounded-lg h-9 px-4 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-95"
                        onClick={() => handleConfirmReceived(booking.id)}
                      >
                        Terima Barang
                      </Button>
                    )}

                    {((booking.status?.value || booking.status) === 'Rented') && (
                      <Button
                        size="sm"
                        className="rounded-lg h-9 px-4 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-95"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setReturnModalOpen(true);
                        }}
                      >
                        Ajukan Pengembalian
                      </Button>
                    )}

                    {((booking.status?.value || booking.status)?.toLowerCase() === 'returned') && !booking.returned_at && (
                      <div className="flex items-center gap-2 text-amber-600 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 animate-pulse whitespace-nowrap">
                        <Icons.Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-[8px] font-semibold text-xs">Pengecekan Admin</span>
                      </div>
                    )}

                    {((booking.status?.value || booking.status)?.toLowerCase() === 'returned') && booking.returned_at && (
                      <div className="flex flex-col items-end gap-2">
                        {Number(booking.total_fine) > Number(booking.locked_deposit_amount) ? (
                          <Button
                            size="sm"
                            className="rounded-xl h-10 px-4 font-semibold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 active:scale-95 flex items-center gap-2"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setFineModalOpen(true);
                            }}
                          >
                            <Icons.AlertCircle className="h-4 w-4" />
                            Review & Bayar Denda
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="rounded-lg h-9 px-4 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-95"
                            onClick={() => {
                              const adminPhone = "6283832352467";
                              const amount = Number(booking.locked_deposit_amount);
                              const finalAmount = amount - (Number(booking.total_fine) || 0);
                              const message = `Halo Admin, saya ingin mengajukan pengembalian deposit:\n\n` +
                                `No. Booking: ${booking.booking_code}\n` +
                                `Deposit Awal: Rp ${amount.toLocaleString('id-ID')}\n` +
                                `Total Denda: Rp ${(Number(booking.total_fine) || 0).toLocaleString('id-ID')}\n` +
                                `Estimasi Refund: Rp ${finalAmount.toLocaleString('id-ID')}\n\n` +
                                `Mohon segera diproses ke rekening saya. Terima kasih.`;
                              const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                          >
                            Tarik Deposit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Icons.ShoppingBag className="h-16 w-16" />
                    <p className="text-sm font-bold uppercase tracking-[0.3em] ">Belum ada pesanan</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Detail Modal */}
      <Dialog open={!!selectedBooking && !fineModalOpen && !returnModalOpen} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
          {selectedBooking && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900">Detail Pesanan</DialogTitle>
                  <p className="text-xs text-slate-500 mt-1">ID Transaksi: {selectedBooking.booking_code}</p>
                </div>
                <Badge className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status.toUpperCase()}
                </Badge>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Costume Info */}
                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="h-20 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                    <img
                      src={selectedBooking.costume?.images?.[0] ? `${selectedBooking.costume.images[0].image_path}` : "https://via.placeholder.com/100"}
                      className="w-full h-full object-cover"
                      alt={selectedBooking.costume?.name}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-slate-900 text-sm">{selectedBooking.costume?.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">Ukuran: <span className="font-semibold text-primary">{selectedBooking.costume?.size}</span></p>
                  </div>
                </div>

                {/* Rental Period & Address */}
                <div className="grid grid-cols-2 gap-6 py-4 border-y border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Mulai Sewa</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(selectedBooking.start_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Selesai Sewa</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(selectedBooking.end_date)}</p>
                  </div>
                  {selectedBooking.shipping_address && (
                    <div className="col-span-2 space-y-1 pt-2">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Alamat Pengiriman</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{selectedBooking.shipping_address}</p>
                      {selectedBooking.notes && (
                        <p className="text-[11px] text-slate-400 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-500 mr-1">Catatan:</span> {selectedBooking.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tracking Info */}
                {selectedBooking.tracking_number && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icons.Truck className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Nomor Resi</p>
                        <p className="text-sm font-bold text-emerald-700 tracking-wider">{selectedBooking.tracking_number}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-emerald-600 hover:bg-emerald-100"
                      onClick={() => handleCopyResi(selectedBooking.tracking_number)}
                    >
                      <Icons.Copy className="h-3.5 w-3.5 mr-2" /> Salin
                    </Button>
                  </div>
                )}


                {/* Payment Summary */}
                <div className="space-y-3 pt-4 border-t border-slate-100 bg-slate-50/30 -mx-6 px-6 pb-6">
                  <p className="text-[10px] font-semibold uppercase text-slate-400 mb-2">Rincian Pembayaran</p>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Biaya Sewa Kostum</span>
                    <span className="font-medium text-slate-700">Rp {Number(selectedBooking.total_rental_fee).toLocaleString('id-ID')}</span>
                  </div>

                  {selectedBooking.accessories?.length > 0 && (
                    <div className="space-y-2 py-2 border-y border-slate-100 border-dashed my-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Aksesoris</p>
                      {selectedBooking.accessories.map(acc => (
                        <div key={acc.id} className="flex justify-between items-center text-sm py-1">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white overflow-hidden border border-slate-200 flex-shrink-0">
                               {acc.image_path ? (
                                 <img src={acc.image_path} alt={acc.name} className="h-full w-full object-cover" />
                               ) : (
                                 <Icons.Gem className="h-4 w-4 text-slate-300 m-auto mt-2 flex justify-center" />
                               )}
                            </div>
                            <span className="text-slate-500 italic text-xs">{acc.name}</span>
                          </div>
                          <span className="font-medium text-slate-700">Rp {Number(acc.pivot?.price_at_booking || acc.rental_price).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Deposit (Jaminan)</span>
                    <span className="font-medium text-slate-700">Rp {Number(selectedBooking.locked_deposit_amount).toLocaleString('id-ID')}</span>
                  </div>

                  {Number(selectedBooking.shipping_cost) > 0 && (
                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-500">Biaya Pengiriman</span>
                        <span className="text-[10px] text-slate-400 italic">{selectedBooking.courier_name} ({selectedBooking.courier_service})</span>
                      </div>
                      <span className="font-medium text-slate-700">Rp {Number(selectedBooking.shipping_cost).toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {(Number(selectedBooking.total_fine) > 0) && (
                    <div className="flex justify-between text-sm text-rose-600 font-medium pt-2 border-t border-slate-100 border-dashed">
                      <span>Total Denda {Number(selectedBooking.total_fine) > Number(selectedBooking.locked_deposit_amount) && <Badge className="ml-2 bg-rose-100 text-rose-600 border-none text-[8px]">Over Deposit</Badge>}</span>
                      <span>+ Rp {Number(selectedBooking.total_fine).toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-slate-200">
                    <div>
                      <span className="block text-base font-bold text-slate-900">Total Biaya</span>
                      <span className="text-[9px] text-slate-400 font-medium">Sewa + Aksesoris + Deposit + Denda</span>
                    </div>
                    <span className="text-primary text-2xl font-black italic tracking-tighter">
                      Rp {(
                        Number(selectedBooking.total_rental_fee) +
                        Number(selectedBooking.locked_deposit_amount) +
                        Number(selectedBooking.shipping_cost || 0) +
                        (selectedBooking.accessories?.reduce((sum, acc) => sum + Number(acc.pivot?.price_at_booking || acc.rental_price), 0) || 0) +
                        (Number(selectedBooking.total_fine) || 0)
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Admin Verification (Late/Damage) */}
                {!selectedBooking.returned_at && selectedBooking.status === 'Returned' && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                    <p className="text-xs font-semibold text-amber-700">Admin sedang memverifikasi kondisi kostum. Mohon tunggu informasi denda jika ada.</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <Button
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return Application Modal */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
          <div className="p-10 space-y-8">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-2xl font-bold">Ajukan Pengembalian</DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400 ">
                Harap masukkan nomor resi dan foto paket yang dikembalikan.
              </DialogDescription>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-xs text-slate-400">Nomor Resi Pengembalian</label>
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
                <label className="text-[10px] font-semibold text-xs text-slate-400">Bukti Pengiriman (Foto Paket)</label>
                <div className="relative h-40 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors group cursor-pointer overflow-hidden">
                  {returnFile ? (
                    <img src={URL.createObjectURL(returnFile)} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <Icons.Upload className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase ">Klik untuk upload foto</p>
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
                  className="flex-1 h-14 rounded-2xl font-semibold text-xs"
                  onClick={() => setReturnModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-primary text-white font-semibold text-xs shadow-xl shadow-slate-900/10"
                >
                  Kirim Pengajuan
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fine Settlement Modal */}
      <Dialog open={fineModalOpen} onOpenChange={(open) => {
        setFineModalOpen(open);
        if (!open) setSelectedBooking(null);
      }}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-rose-600 p-8 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Icons.AlertCircle className="h-6 w-6" />
              </div>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => setFineModalOpen(false)}>
                <Icons.X className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-2xl font-bold mb-1">Penyelesaian Denda</h2>
            <p className="text-white/80 text-xs font-medium ">Harap tinjau denda sebelum melakukan pelunasan.</p>
          </div>

          {selectedBooking && (
            <div className="p-8 space-y-8 bg-white">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase  text-[9px]">Jaminan (Deposit)</span>
                  <span className="font-bold text-slate-900">Rp {Number(selectedBooking.locked_deposit_amount).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-rose-600">
                  <span className="font-bold uppercase  text-[9px]">Total Denda Keseluruhan</span>
                  <span className="font-bold">Rp {Number(selectedBooking.total_fine).toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-xs text-slate-900">Sisa yang harus dibayar</span>
                  <span className="text-xl font-bold text-rose-600">
                    Rp {(Number(selectedBooking.total_fine) - Number(selectedBooking.locked_deposit_amount)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase text-slate-400 ">Catatan Admin</p>
                  <p className="text-xs font-medium text-slate-700  leading-relaxed">
                    {selectedBooking.damage_description || "Tidak ada catatan tambahan."}
                  </p>
                </div>
                {selectedBooking.damage_proof_image && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase text-slate-400 ">Bukti Foto Kerusakan</p>
                    <div className="rounded-2xl overflow-hidden border-2 border-white shadow-md">
                      <img
                        src={`${selectedBooking.damage_proof_image}`}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                        alt="Proof"
                        onClick={() => window.open(`${selectedBooking.damage_proof_image}`, '_blank')}
                      />
                    </div>
                    <p className="text-[8px] text-slate-400  text-center">Klik gambar untuk memperbesar</p>
                  </div>
                )}
              </div>

              <Button
                className="w-full h-14 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                onClick={() => {
                  fetcher.submit(
                    { intent: 'pay_fine', booking_id: selectedBooking.id },
                    { method: 'post' }
                  );
                  setFineModalOpen(false);
                }}
                disabled={fetcher.state !== 'idle'}
              >
                <Icons.CreditCard className="h-4 w-4" />
                Bayar Sekarang via Midtrans
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
