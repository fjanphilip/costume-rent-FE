import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { AdminSidebar } from "~/features/admin-dashboard/components/AdminSidebar";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import * as Icons from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";

import { getApiClient } from "~/lib/api";

const BOOKING_STATUSES = [
  'Pending_Payment',
  'Paid',
  'Preparing',
  'Shipping',
  'Rented',
  'Returned',
  'Completed',
  'Cancelled'
];

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");

  if (!user || !token || user.role !== 'admin') {
    return redirect("/login");
  }

  try {
    const response = await getApiClient(token).get("/admin/bookings");
    return json({ bookings: response.data.data || [] });
  } catch (error) {
    console.error("Fetch Admin Bookings Error:", error);
    return json({ bookings: [] });
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();

  const intent = formData.get("intent");
  const id = formData.get("id");

  const client = getApiClient(token);

  try {
    if (intent === "update_status" || intent === "update_tracking") {
      const status = formData.get("status");
      const tracking_number = formData.get("tracking_number");
      const response = await client.patch(`/bookings/${id}/status`, { status, tracking_number });
      return json({ status: "success", ...response.data });
    }

    if (intent === "confirm_return") {
      const response = await client.post(`/admin/bookings/${id}/confirm-return`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return json({ status: "success", ...response.data });
    }

    if (intent === "confirm_payment") {
      const response = await client.post(`/admin/bookings/${id}/confirm-payment`);
      return json({ status: "success", ...response.data });
    }
  } catch (error) {
    console.error("Admin Booking Action Error:", error);
    const result = error.response?.data || {};
    return json({ status: "error", message: result.message || "Terjadi kesalahan pada server." }, { status: error.response?.status || 500 });
  }

  return null;
};


export default function AdminBookingsPage() {
  const { bookings } = useLoaderData();
  const fetcher = useFetcher();
  const [editingTracking, setEditingTracking] = useState(null);
  const [tempTracking, setTempTracking] = useState("");
  const [verifyingBooking, setVerifyingBooking] = useState(null);
  const [fineAmount, setFineAmount] = useState(0);
  const [fineReason, setFineReason] = useState("");
  const [damageFile, setDamageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  // Show error alerts
  const lastError = fetcher.data?.status === "error" ? fetcher.data.message : null;
  useEffect(() => {
    if (lastError) alert(`Error: ${lastError}`);
  }, [lastError]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status, booking = null) => {
    const statusVal = (status?.value || status || '').toString();
    switch (statusVal) {
      case 'Paid':
      case 'Completed':
        if (booking && Number(booking.total_fine) > Number(booking.locked_deposit_amount)) {
          return 'bg-emerald-600 text-white border-2 border-emerald-300';
        }
        return 'bg-emerald-500 text-white';
      case 'Returned': return 'bg-purple-600 text-white';
      case 'Shipping':
      case 'Rented': return 'bg-blue-600 text-white';
      case 'Preparing':
      case 'Pending_Payment': return 'bg-amber-500 text-white';
      case 'Cancelled':
      case 'Rejected': return 'bg-rose-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const handleStatusChange = (booking, newStatus) => {
    fetcher.submit(
      {
        intent: 'update_status',
        id: booking.id,
        status: newStatus,
        tracking_number: booking.tracking_number || ""
      },
      { method: 'post' }
    );
  };

  const handleSaveTracking = (booking) => {
    fetcher.submit(
      { intent: 'update_tracking', id: booking.id, tracking_number: tempTracking, status: booking.status },
      { method: 'post' }
    );
    setEditingTracking(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDamageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitVerify = (bookingId) => {
    const formData = new FormData();
    formData.append("intent", "confirm_return");
    formData.append("id", bookingId);
    formData.append("damage_fine", fineAmount);
    formData.append("damage_description", fineReason);
    if (damageFile) {
      formData.append("damage_proof_image", damageFile);
    }

    fetcher.submit(formData, { method: "post", encType: "multipart/form-data" });
    setVerifyingBooking(null);
    setDamageFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-10 space-y-10 max-w-7xl text-left">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manajemen Penyewaan</h1>
            <p className="text-slate-500">Pantau dan kelola semua transaksi penyewaan kostum.</p>
          </div>

          <Card className="border border-slate-200 shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Code / User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Costume / Resi</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rental Period</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{booking.booking_code}</span>
                          <span className="text-xs text-slate-500">{booking.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-slate-700">{booking.costume?.name}</span>
                          {editingTracking === booking.id ? (
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-primary/20">
                              <Input
                                value={tempTracking}
                                onChange={(e) => setTempTracking(e.target.value)}
                                placeholder="Input No. Resi..."
                                className="h-8 text-[10px] rounded-lg w-32 border-slate-200 bg-white"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                className="h-8 w-8 rounded-lg p-0 bg-emerald-500 hover:bg-emerald-600 shadow-md"
                                onClick={() => handleSaveTracking(booking)}
                              >
                                <Icons.Check className="h-4 w-4 text-white" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg p-0 text-rose-500 hover:bg-rose-50"
                                onClick={() => setEditingTracking(null)}
                              >
                                <Icons.X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <div className={`flex items-center gap-3`}>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${booking.tracking_number ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200 border-dashed'}`}>
                                  <Icons.Truck className={`h-3 w-3 ${booking.tracking_number ? 'text-primary' : 'text-slate-300'}`} />
                                  <span className={`text-xs font-semibold uppercase tracking-wider ${booking.tracking_number ? 'text-primary' : 'text-slate-400'}`}>
                                    {booking.tracking_number || "Belum Ada Resi"}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingTracking(booking.id);
                                    setTempTracking(booking.tracking_number || "");
                                  }}
                                  className="p-2 hover:bg-primary hover:text-white bg-slate-100 text-slate-400 rounded-xl transition-all shadow-sm active:scale-95"
                                  title="Edit Resi"
                                >
                                  <Icons.Edit3 className="h-3 w-3" />
                                </button>
                              </div>

                              {booking.return_tracking_number && (
                                <div className="bg-purple-50 border border-purple-100 p-3 rounded-2xl flex flex-col gap-2">
                                  <p className="text-[9px] font-black uppercase text-purple-600 tracking-widest flex items-center gap-1">
                                    <Icons.RotateCcw className="h-3 w-3" /> Resi Balik: {booking.return_tracking_number}
                                  </p>
                                  {booking.return_proof_image && (
                                    <a
                                      href={`http://127.0.0.1:8000/storage/${booking.return_proof_image}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="h-16 w-16 rounded-lg overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform"
                                    >
                                      <img src={`http://127.0.0.1:8000/storage/${booking.return_proof_image}`} className="w-full h-full object-cover" alt="Return Proof" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">{formatDate(booking.start_date)}</span>
                          <span className="text-xs text-slate-400">sampai {formatDate(booking.end_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group/select">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking, e.target.value)}
                            disabled={fetcher.state !== 'idle'}
                            className={`appearance-none cursor-pointer border-none font-bold text-[10px] rounded-lg px-3 py-1.5 tracking-wider shadow-sm outline-none transition-all pr-8 ${getStatusColor(booking.status, booking)}`}
                          >
                            {BOOKING_STATUSES.map(status => (
                              <option key={status} value={status} className="bg-white text-slate-900 font-bold uppercase py-2">
                                {status.replace('_', ' ').toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <Icons.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                          {booking.status === 'Completed' && Number(booking.total_fine) > Number(booking.locked_deposit_amount) && (
                            <div className="mt-1 flex items-center gap-1 text-emerald-600 font-black text-[7px] uppercase tracking-tighter italic">
                              <Icons.CheckCircle2 className="h-2 w-2" /> Denda Lunas (Midtrans)
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg h-9 px-4 text-xs font-semibold border hover:bg-slate-900 hover:text-white transition-all w-fit"
                            onClick={() => setSelectedBookingDetail(booking)}
                          >
                            <Icons.Eye className="h-4 w-4 mr-2" />
                            Detail Kirim
                          </Button>

                          {booking.status === 'Returned' && !booking.returned_at && (
                            <>
                              {verifyingBooking === booking.id ? (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                  <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                                    <div className="space-y-1">
                                      <h3 className="text-xl font-bold">Verify Return</h3>
                                      <p className="text-xs text-slate-400 font-medium italic">Input denda dan bukti kerusakan jika ada.</p>
                                    </div>

                                    <div className="space-y-4">
                                      <div className="space-y-1.5">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Denda Kerusakan (Rp)</p>
                                        <Input
                                          type="number"
                                          value={fineAmount}
                                          onChange={(e) => setFineAmount(e.target.value)}
                                          className="h-12 rounded-2xl border-slate-200 text-sm font-bold"
                                          placeholder="0"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Alasan / Deskripsi</p>
                                        <Input
                                          value={fineReason}
                                          onChange={(e) => setFineReason(e.target.value)}
                                          className="h-12 rounded-2xl border-slate-200 text-sm font-medium"
                                          placeholder="Contoh: Baju robek di lengan..."
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bukti Foto</p>
                                        <div className="flex flex-col gap-3">
                                          {previewUrl && (
                                            <div className="relative h-32 w-full rounded-2xl overflow-hidden border-2 border-primary/20">
                                              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                              <button
                                                onClick={() => { setDamageFile(null); setPreviewUrl(null); }}
                                                className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full"
                                              >
                                                <Icons.X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          )}
                                          <label className="cursor-pointer flex items-center justify-center gap-2 h-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-primary/50 transition-all text-slate-400 hover:text-primary">
                                            <Icons.Camera className="h-4 w-4" />
                                            <span className="text-[10px] font-semibold text-xs">Upload Bukti</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                          </label>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                      <Button
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-slate-900/20 italic"
                                        onClick={() => handleSubmitVerify(booking.id)}
                                      >
                                        Submit Verification
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="h-12 w-12 rounded-2xl text-rose-500 hover:bg-rose-50 p-0 border border-slate-100"
                                        onClick={() => { setVerifyingBooking(null); setPreviewUrl(null); }}
                                      >
                                        <Icons.X className="h-5 w-5" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase rounded-xl h-10 px-6 italic tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                                  onClick={() => {
                                    setVerifyingBooking(booking.id);
                                    setFineAmount(0);
                                    setFineReason("");
                                    setDamageFile(null);
                                    setPreviewUrl(null);
                                  }}
                                >
                                  <Icons.ShieldCheck className="h-4 w-4 mr-2" />
                                  Verify Return
                                </Button>
                              )}
                            </>
                          )}

                          {booking.status === 'Returned' && booking.returned_at && (
                            <div className="flex flex-col items-end gap-2">
                              <div className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg mb-1 flex items-center gap-2">
                                <Icons.CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest italic">Checked</span>
                              </div>

                              {Number(booking.total_fine) > Number(booking.locked_deposit_amount) ? (
                                <div className="bg-rose-50 border border-rose-100 px-4 py-3 rounded-2xl flex flex-col items-end gap-1">
                                  <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">User Kurang Bayar</p>
                                  <p className="text-xs font-black text-rose-700 italic">Rp {(Number(booking.total_fine) - Number(booking.locked_deposit_amount)).toLocaleString('id-ID')}</p>
                                  <p className="text-[8px] text-rose-400 italic">Menunggu Pelunasan Sisa Denda...</p>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase rounded-xl h-10 px-6 italic tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                                  onClick={() => {
                                    if (confirm('Konfirmasi bahwa sisa deposit sudah ditransfer manual?')) {
                                      fetcher.submit({ intent: 'confirm_payment', id: booking.id }, { method: 'post' });
                                    }
                                  }}
                                >
                                  <Icons.DollarSign className="h-4 w-4 mr-2" />
                                  Confirm Refund
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic text-sm">
                        Belum ada data penyewaan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      {/* MODAL BEST PRACTICE: DETAIL PENGIRIMAN & CHECKLIST */}
      <Dialog open={!!selectedBookingDetail} onOpenChange={() => setSelectedBookingDetail(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
          {selectedBookingDetail && (
            <div className="flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Instruksi Pengiriman</DialogTitle>
                  <p className="text-xs text-slate-500 mt-1">Order ID: {selectedBookingDetail.booking_code}</p>
                </div>
                <Badge className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(selectedBookingDetail.status)}`}>
                  {selectedBookingDetail.status.toUpperCase()}
                </Badge>
              </div>

              <div className="p-10 space-y-10 overflow-y-auto">
                {/* SECTION 1: SHIPPING LABEL */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                      <Icons.MapPin className="h-4 w-4" /> Label Pengiriman
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold"
                      onClick={() => {
                        const fullText = selectedBookingDetail.shipping_address || "";
                        const parts = fullText.split(" | ");
                        const addressOnly = parts[2] || fullText;
                        navigator.clipboard.writeText(addressOnly);
                        alert("Alamat berhasil disalin!");
                      }}
                    >
                      <Icons.Copy className="h-3.5 w-3.5 mr-2" /> Salin Alamat
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
                    {(() => {
                      const parts = (selectedBookingDetail.shipping_address || "").split(" | ");
                      const receiver = parts[0] || selectedBookingDetail.user?.name;
                      const phone = parts[1] || selectedBookingDetail.user?.phone_number;
                      const address = parts[2] || selectedBookingDetail.shipping_address || "Alamat tidak ditemukan";

                      return (
                        <>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase text-primary">Penerima</p>
                              <p className="text-sm font-black text-slate-900">{receiver}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase text-primary">No. WhatsApp</p>
                              <p className="text-sm font-black text-slate-900">{phone}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-primary">Alamat Pengiriman Lengkap</p>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                              {address}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                    {selectedBookingDetail.notes && (
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-[10px] font-bold uppercase text-primary">Catatan Khusus</p>
                        <p className="text-xs text-slate-500 italic">"{selectedBookingDetail.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 2: PACKING CHECKLIST */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                    <Icons.CheckSquare className="h-4 w-4" /> Checklist Barang (Packing)
                  </h4>
                  <div className="space-y-3">
                    {/* The Main Costume */}
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 group hover:border-primary/30 transition-colors">
                      <div className="h-14 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                        <img
                          src={selectedBookingDetail.costume?.images?.[0] ? `http://127.0.0.1:8000/storage/${selectedBookingDetail.costume.images[0].image_path}` : "https://via.placeholder.com/100"}
                          className="w-full h-full object-cover"
                          alt={selectedBookingDetail.costume?.name}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-bold uppercase text-slate-400">Main Costume</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedBookingDetail.costume?.name} (Size {selectedBookingDetail.costume?.size})</p>
                      </div>
                      <div className="h-6 w-6 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-primary transition-colors cursor-pointer">
                        <div className="h-3 w-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Additional Accessories */}
                    {selectedBookingDetail.accessories?.map(acc => (
                      <div key={acc.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 group hover:border-primary/30 transition-colors">
                        <div className="h-14 w-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                          <Icons.Gem className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-bold uppercase text-slate-400">Accessory</p>
                          <p className="text-sm font-semibold text-slate-800">{acc.name}</p>
                        </div>
                        <div className="h-6 w-6 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-primary transition-colors cursor-pointer">
                          <div className="h-3 w-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 3: QUICK CONTACT */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Icons.MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900">Hubungi User</p>
                      <p className="text-[10px] text-blue-600">Butuh konfirmasi alamat? Klik untuk chat WA.</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 rounded-lg px-4 h-9 font-semibold text-[11px]"
                    onClick={() => {
                      const phone = selectedBookingDetail.user?.phone_number || "";
                      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}`, "_blank");
                    }}
                  >
                    Chat WA
                  </Button>
                </div>

                {/* SECTION 4: DAMAGE VERIFICATION (If Any) */}
                {selectedBookingDetail.returned_at && (selectedBookingDetail.damage_proof_image || selectedBookingDetail.damage_description) && (
                  <div className="space-y-4 pt-6 border-t border-slate-200">
                    <h4 className="text-xs font-bold uppercase text-rose-500 flex items-center gap-2">
                      <Icons.AlertTriangle className="h-4 w-4" /> Hasil Verifikasi Kerusakan/Telat
                    </h4>
                    <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-rose-400 uppercase">Denda Telat</p>
                          <p className="text-sm font-black text-rose-700 italic">Rp {Number(selectedBookingDetail.late_fine || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-rose-400 uppercase">Denda Kerusakan</p>
                          <p className="text-sm font-black text-rose-700 italic">Rp {Number(selectedBookingDetail.damage_fine || 0).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-rose-400 uppercase">Catatan Admin</p>
                        <p className="text-xs text-rose-700 font-medium italic">"{selectedBookingDetail.damage_description || 'Tidak ada catatan.'}"</p>
                      </div>

                      {selectedBookingDetail.damage_proof_image && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-rose-400 uppercase">Foto Bukti Kerusakan</p>
                          <div className="rounded-xl overflow-hidden border-2 border-white shadow-sm h-40">
                            <img 
                              src={`http://127.0.0.1:8000/storage/${selectedBookingDetail.damage_proof_image}`} 
                              className="w-full h-full object-cover" 
                              alt="Damage Proof" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                <Button
                  className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm"
                  onClick={() => setSelectedBookingDetail(null)}
                >
                  Tutup
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-xl font-bold text-sm"
                  onClick={() => window.print()}
                >
                  <Icons.Printer className="h-4 w-4 mr-2" /> Cetak Label
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
