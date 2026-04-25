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

export function BookingTable({ transactions = [] }) {
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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-black text-lg italic uppercase tracking-tight">Recent Transactions</h3>
        <Button variant="ghost" size="sm" className="text-primary font-black uppercase text-[10px] tracking-widest">View All</Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length > 0 ? transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      tx.transaction_type === 'Top_Up' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {tx.transaction_type === 'Top_Up' ? <Icons.ArrowUpRight className="h-5 w-5" /> : <Icons.ArrowDownLeft className="h-5 w-5" />}
                    </div>
                    <div className="flex flex-col">
                       <span className="font-bold text-sm text-slate-900">{tx.description}</span>
                       <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{tx.reference_id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <span className="text-xs font-bold text-slate-600 italic">{formatDate(tx.created_at)}</span>
                </td>
                <td className="px-6 py-5">
                   <span className={`text-sm font-black italic ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {tx.type === 'Credit' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                   </span>
                </td>
                <td className="px-6 py-5">
                   <Badge className={`border-none font-black text-[9px] rounded-lg px-2 py-0.5 tracking-widest ${
                     tx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                     tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                   }`}>
                     {tx.status.toUpperCase()}
                   </Badge>
                </td>
                <td className="px-6 py-5">
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-8 px-4 font-black uppercase text-[9px] tracking-widest border-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                    onClick={() => setSelectedTx(tx)}
                   >
                    Detail
                   </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <Icons.Inbox className="h-10 w-10" />
                    <p className="text-xs font-black uppercase tracking-widest italic">Belum ada transaksi</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-[2.5rem] border-none shadow-2xl">
            {selectedTx && (
              <div className="flex flex-col">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${
                                selectedTx.transaction_type === 'Top_Up' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                                {selectedTx.transaction_type === 'Top_Up' ? <Icons.ArrowUpRight className="h-6 w-6" /> : <Icons.ArrowDownLeft className="h-6 w-6" />}
                            </div>
                            <DialogTitle className="text-xl font-black italic uppercase tracking-tight">Detail Transaksi</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-slate-500 italic">ID: {selectedTx.id}</DialogDescription>
                        </div>
                        <Badge className={`border-none font-black text-[10px] rounded-full px-4 py-1 tracking-widest shadow-sm ${
                            selectedTx.status === 'Completed' ? 'bg-emerald-500 text-white' : 
                            selectedTx.status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                        }`}>
                            {selectedTx.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipe Transaksi</p>
                            <p className="text-sm font-bold text-slate-900 italic">{selectedTx.transaction_type.replace('_', ' ')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mode</p>
                            <p className={`text-sm font-bold italic ${selectedTx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedTx.type}</p>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Nominal</p>
                            <p className="text-2xl font-black italic tracking-tighter text-slate-900">Rp {selectedTx.amount.toLocaleString('id-ID')}</p>
                        </div>
                        <Icons.Wallet className="h-8 w-8 text-slate-200" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Reference ID</span>
                            <span className="font-black text-slate-900 italic">{selectedTx.reference_id}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Waktu</span>
                            <span className="font-black text-slate-600 italic">{formatDate(selectedTx.created_at)}</span>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                             <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Deskripsi</span>
                             <p className="text-xs font-medium text-slate-600 italic leading-relaxed bg-white p-4 rounded-2xl border border-slate-50">{selectedTx.description}</p>
                        </div>
                    </div>

                    <Button 
                        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-primary transition-all text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10"
                        onClick={() => setSelectedTx(null)}
                    >
                        Tutup
                    </Button>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
