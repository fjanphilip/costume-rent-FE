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
    const response = await fetch("http://127.0.0.1:8000/api/admin/bookings", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();
    return json({ bookings: result.data || [] });
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

  if (intent === "update_status") {
    const status = formData.get("status");
    const tracking_number = formData.get("tracking_number");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, tracking_number })
      });

      const result = await response.json();
      if (response.ok) return json({ status: "success", ...result });
      return json({ status: "error", message: result.message }, { status: 400 });
    } catch (e) {
      return json({ status: "error", message: "Network error" }, { status: 500 });
    }
  }

  if (intent === "update_tracking") {
    const tracking_number = formData.get("tracking_number");
    const status = formData.get("status"); // Current status
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, tracking_number })
      });

      const result = await response.json();
      if (response.ok) return json({ status: "success", ...result });
      return json({ status: "error", message: result.message }, { status: 400 });
    } catch (e) {
      return json({ status: "error", message: "Network error" }, { status: 500 });
    }
  }

  if (intent === "confirm_return") {
    try {
      const apiFormData = new FormData();
      apiFormData.append("damage_fine", formData.get("damage_fine") || 0);
      apiFormData.append("damage_description", formData.get("damage_description") || "");
      
      const file = formData.get("damage_proof_image");
      if (file && file.size > 0) {
        apiFormData.append("damage_proof_image", file);
      }

      const response = await fetch(`http://127.0.0.1:8000/api/admin/bookings/${id}/confirm-return`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: apiFormData
      });

      const result = await response.json();
      if (response.ok) return json({ status: "success", ...result });
      return json({ status: "error", message: result.message }, { status: 400 });
    } catch (e) {
      console.error("Action Error:", e);
      return json({ status: "error", message: "Network error" }, { status: 500 });
    }
  }

  if (intent === "confirm_payment") {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/bookings/${id}/confirm-payment`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok) return json({ status: "success", ...result });
      return json({ status: "error", message: result.message }, { status: 400 });
    } catch (e) {
      return json({ status: "error", message: "Network error" }, { status: 500 });
    }
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">Manajemen Penyewaan</h1>
            <p className="text-sm text-slate-500 font-medium italic">Pantau dan kelola semua transaksi penyewaan kostum.</p>
          </div>

          <Card className="border border-slate-200 shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Booking Code / User</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Costume / Resi</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Rental Period</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-black text-slate-900 italic">{booking.booking_code}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                           <span className="text-sm font-bold text-slate-700 italic">{booking.costume?.name}</span>
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
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${booking.tracking_number ? 'text-primary' : 'text-slate-400 italic'}`}>
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
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-0.5">
                           <span className="text-xs font-bold text-slate-600 italic">{formatDate(booking.start_date)}</span>
                           <span className="text-[10px] font-medium text-slate-400 italic">sampai {formatDate(booking.end_date)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="relative group/select">
                          <select 
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking, e.target.value)}
                            disabled={fetcher.state !== 'idle'}
                            className={`appearance-none cursor-pointer border-none font-black text-[9px] rounded-lg px-3 py-1.5 tracking-widest shadow-sm outline-none transition-all pr-8 ${getStatusColor(booking.status, booking)}`}
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
                        {booking.status === 'Returned' && !booking.returned_at && (
                          <div className="flex flex-col items-end gap-3">
                            {verifyingBooking === booking.id ? (
                              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                                  <div className="space-y-1">
                                    <h3 className="text-xl font-black italic uppercase tracking-tight">Verify Return</h3>
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
                                          <span className="text-[10px] font-black uppercase tracking-widest">Upload Bukti</span>
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
                          </div>
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
                                    if(confirm('Konfirmasi bahwa sisa deposit sudah ditransfer manual?')) {
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
    </div>
  );
}
