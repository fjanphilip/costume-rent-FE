import { useState, useEffect, useMemo } from "react";
import { useFetcher } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "~/components/ui/dialog";

export default function AdminWithdrawalsFeature({ transactions: initialTransactions }) {
  const fetcher = useFetcher();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedTx, setSelectedTx] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter(tx => {
      const matchesSearch = tx.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.reference_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialTransactions, searchTerm, statusFilter]);

  useEffect(() => {
    if (fetcher.data?.status === "success") {
      setIsApproveModalOpen(false);
      setIsRejectModalOpen(false);
      setRejectReason("");
      setSelectedTx(null);
    } else if (fetcher.data?.status === "error") {
      alert("Gagal memperbarui status: " + fetcher.data.message);
    }
  }, [fetcher.data]);

  const handleApprove = () => {
    if (!selectedTx) return;
    fetcher.submit(
      { intent: "status_update", id: selectedTx.id, status: "Completed" },
      { method: "post" }
    );
  };

  const handleReject = () => {
    if (!selectedTx) return;
    if (!rejectReason) return alert("Silakan masukkan alasan penolakan.");
    fetcher.submit(
      { intent: "status_update", id: selectedTx.id, status: "Rejected", reason: rejectReason },
      { method: "post" }
    );
  };

  const formatIDR = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBankLogo = (bankName) => {
    const name = bankName?.toLowerCase() || "";
    if (name.includes("bca")) return "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg";
    if (name.includes("mandiri")) return "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg";
    if (name.includes("bni")) return "https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg";
    if (name.includes("bri")) return "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_Logo.svg";
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Penarikan Dana</h1>
        <p className="text-sm font-medium text-slate-500">Otorisasi dan kelola pengajuan pencairan saldo user.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari user atau reference ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-11 bg-white border-slate-200 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
           {['all', 'Pending', 'Completed', 'Rejected'].map(status => (
             <button
               key={status}
               onClick={() => setStatusFilter(status)}
               className={`px-5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                 statusFilter === status ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               {status}
             </button>
           ))}
        </div>
      </div>

      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User / Reference</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Withdraw Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bank Target</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-900">{tx.user?.name}</span>
                       <span className="text-[10px] font-medium text-slate-400 font-mono">{tx.reference_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-900">{formatIDR(tx.amount)}</span>
                       <span className="text-[10px] font-medium text-slate-400">{new Date(tx.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                          {getBankLogo(tx.user?.bank_name) ? (
                            <img src={getBankLogo(tx.user?.bank_name)} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Icons.CreditCard className="h-4 w-4 text-slate-300" />
                          )}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-900">{tx.user?.bank_account_number}</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">A/N {tx.user?.bank_account_name}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant="outline" className={`border-none font-bold text-[9px] rounded-lg px-2.5 py-1 tracking-widest ${
                      tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                      tx.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {tx.status === 'Completed' ? 'APPROVED' : tx.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {tx.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setSelectedTx(tx); setIsApproveModalOpen(true); }}
                          className="text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold text-[10px]"
                        >
                          APPROVE
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setSelectedTx(tx); setIsRejectModalOpen(true); }}
                          className="text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-[10px]"
                        >
                          REJECT
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* APPROVE MODAL - STANDARD UI */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 border-none shadow-2xl rounded-2xl overflow-hidden bg-white">
          <div className="p-8 text-center space-y-4">
             <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                <Icons.CheckCircle2 className="h-8 w-8" />
             </div>
             <div className="space-y-1">
                <DialogTitle className="text-xl font-bold text-slate-900">Approve Withdrawal?</DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500">
                   Confirm that you have transferred <strong>{selectedTx ? formatIDR(selectedTx.amount) : ''}</strong> to the user's account.
                </DialogDescription>
             </div>
          </div>
          
          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-3">
            <Button variant="ghost" onClick={() => setIsApproveModalOpen(false)} className="flex-1 font-bold text-slate-500 h-11">
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={fetcher.state !== "idle"}
              className="bg-slate-900 hover:bg-slate-800 text-white h-11 flex-[2] font-bold"
            >
              {fetcher.state !== "idle" ? "Processing..." : "YES, APPROVED"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT MODAL - STANDARD UI */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 border-none shadow-2xl rounded-2xl overflow-hidden bg-white">
          <div className="p-8 text-center space-y-4">
             <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto">
                <Icons.XCircle className="h-8 w-8" />
             </div>
             <div className="space-y-1">
                <DialogTitle className="text-xl font-bold text-slate-900">Reject Withdrawal?</DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500">
                   Please provide a reason for rejecting this request.
                </DialogDescription>
             </div>
          </div>

          <div className="px-8 pb-4">
            <Input 
              placeholder="Reason (e.g. Invalid account details)" 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="h-11 border-slate-200 focus:border-slate-900"
            />
          </div>
          
          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-3">
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)} className="flex-1 font-bold text-slate-500 h-11">
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={fetcher.state !== "idle" || !rejectReason}
              className="bg-rose-600 hover:bg-rose-700 text-white h-11 flex-[2] font-bold"
            >
              {fetcher.state !== "idle" ? "Processing..." : "YES, REJECT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
