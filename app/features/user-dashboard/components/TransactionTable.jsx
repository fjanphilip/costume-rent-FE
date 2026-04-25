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
import { Link } from "@remix-run/react";

export function TransactionTable({ 
  transactions = [], 
  title = "Recent Transactions", 
  showViewAll = true,
  pagination = null,
  onPageChange = null
}) {
  const [selectedTx, setSelectedTx] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
        <h3 className="font-black text-xl italic uppercase tracking-tight">{title}</h3>
        {showViewAll && (
          <Link to="/dashboard/history">
            <Button variant="ghost" size="sm" className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 rounded-xl px-4">
              View All History
            </Button>
          </Link>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-slate-50/30">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity / Reference</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length > 0 ? transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      tx.transaction_type === 'Top_Up' ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100' : 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100'
                    }`}>
                      {tx.transaction_type === 'Top_Up' ? <Icons.ArrowUpRight className="h-6 w-6" /> : <Icons.ArrowDownLeft className="h-6 w-6" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <span className="font-bold text-sm text-slate-900">{tx.description}</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.reference_id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className="text-xs font-bold text-slate-500 italic">{formatDate(tx.created_at)}</span>
                </td>
                <td className="px-8 py-6">
                   <span className={`text-base font-black italic ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {tx.type === 'Credit' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                   </span>
                </td>
                <td className="px-8 py-6">
                   <Badge className={`border-none font-black text-[9px] rounded-lg px-3 py-1 tracking-widest shadow-sm ${
                     tx.status === 'Completed' ? 'bg-emerald-500 text-white' : 
                     tx.status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white'
                   }`}>
                     {tx.status.toUpperCase()}
                   </Badge>
                </td>
                <td className="px-8 py-6">
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest border-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
                    onClick={() => setSelectedTx(tx)}
                   >
                    Detail
                   </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Icons.Inbox className="h-16 w-16" />
                    <p className="text-sm font-black uppercase tracking-[0.3em] italic">Belum ada transaksi</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && transactions.length > 0 && (
        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
             Showing page {pagination.current_page} of {pagination.last_page}
           </p>
           <div className="flex gap-2">
             <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl border-2 font-black px-4 h-10 uppercase text-[10px] tracking-widest"
                disabled={pagination.current_page === 1}
                onClick={() => onPageChange(pagination.current_page - 1)}
             >
               Prev
             </Button>
             <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl border-2 font-black px-4 h-10 uppercase text-[10px] tracking-widest"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => onPageChange(pagination.current_page + 1)}
             >
               Next
             </Button>
           </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-[3rem] border-none shadow-[0_0_100px_rgba(0,0,0,0.1)]">
            {selectedTx && (
              <div className="flex flex-col relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                <div className="p-10 pb-8 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
                                selectedTx.transaction_type === 'Top_Up' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'
                            }`}>
                                {selectedTx.transaction_type === 'Top_Up' ? <Icons.ArrowUpRight className="h-7 w-7" /> : <Icons.ArrowDownLeft className="h-7 w-7" />}
                            </div>
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Detail Transaksi</DialogTitle>
                            <DialogDescription className="text-[10px] font-black text-slate-400 italic uppercase tracking-widest mt-1">Ref ID: {selectedTx.reference_id}</DialogDescription>
                        </div>
                        <Badge className={`border-none font-black text-[10px] rounded-full px-5 py-1 tracking-widest shadow-xl ${
                            selectedTx.status === 'Completed' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                            selectedTx.status === 'Pending' ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-slate-400 text-white'
                        }`}>
                            {selectedTx.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipe Aktifitas</p>
                            <p className="text-base font-bold text-slate-900 italic uppercase">{selectedTx.transaction_type.replace('_', ' ')}</p>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aliran Dana</p>
                            <p className={`text-base font-black italic ${selectedTx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedTx.type.toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex justify-between items-center text-white">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Amount Credited</p>
                            <p className="text-3xl font-black italic tracking-tighter">Rp {selectedTx.amount.toLocaleString('id-ID')}</p>
                        </div>
                        <Icons.Zap className="h-10 w-10 text-primary" />
                    </div>

                    <div className="space-y-5 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Waktu Transaksi</span>
                            <span className="font-black text-slate-600 italic leading-none">{formatDate(selectedTx.created_at)}</span>
                        </div>
                        <div className="space-y-3 pt-3 border-t border-slate-200">
                             <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Deskripsi Transaksi</span>
                             <p className="text-xs font-medium text-slate-700 italic leading-relaxed">{selectedTx.description}</p>
                        </div>
                    </div>

                    <Button 
                        className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-primary transition-all text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10"
                        onClick={() => setSelectedTx(null)}
                    >
                        Close Detail
                    </Button>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
