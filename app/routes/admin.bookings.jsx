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
      const response = await fetch(`http://127.0.0.1:8000/api/admin/bookings/${id}/confirm-return`, {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
      case 'Completed': return 'bg-emerald-500 text-white';
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
                            className={`appearance-none cursor-pointer border-none font-black text-[9px] rounded-lg px-3 py-1.5 tracking-widest shadow-sm outline-none transition-all pr-8 ${getStatusColor(booking.status)}`}
                          >
                            {BOOKING_STATUSES.map(status => (
                              <option key={status} value={status} className="bg-white text-slate-900 font-bold uppercase py-2">
                                {status.replace('_', ' ').toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <Icons.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {booking.status === 'Returned' && (
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase rounded-xl h-10 px-6 italic tracking-widest shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
                            onClick={() => {
                              if(confirm('Konfirmasi pengembalian kostum ini? Pastikan barang sudah dicek.')) {
                                fetcher.submit({ intent: 'confirm_return', id: booking.id }, { method: 'post' });
                              }
                            }}
                            disabled={fetcher.state !== 'idle'}
                          >
                            <Icons.CheckCircle2 className="h-4 w-4 mr-2" />
                            Verify & Complete
                          </Button>
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
