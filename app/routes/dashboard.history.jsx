import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, useNavigate } from "@remix-run/react";
import * as Icons from "lucide-react";
import { getSession } from "~/lib/session.server";
import { Button } from "~/components/ui/button";
import { TransactionTable } from "~/features/user-dashboard/components/TransactionTable";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/deposit/transactions?page=${page}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return json({
        transactions: data.data || [],
        pagination: {
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          total: data.total || 0
        }
      });
    }
  } catch (error) {
    console.error("History Loader Error:", error);
  }

  return json({ transactions: [], pagination: null });
};

export default function HistoryPage() {
  const { transactions, pagination } = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    navigate(`?${params.toString()}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Transaction History</h1>
        <p className="text-muted-foreground text-sm font-medium italic">Lihat semua riwayat transaksi sewa dan wallet Anda secara lengkap.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <TransactionTable
          transactions={transactions}
          title="All Transactions"
          showViewAll={false}
          pagination={pagination}
          onPageChange={handlePageChange}
        />

        <div className="flex flex-col md:flex-row gap-6 items-center p-10 bg-slate-900 rounded-[3rem] relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="relative z-10 h-20 w-20 bg-primary/10 backdrop-blur-xl border border-white/70 rounded-[1.8rem] flex items-center justify-center text-white shadow-inner">
            <Icons.DownloadCloud className="h-10 w-10 text-white" />
          </div>
          <div className="relative z-10 flex-1 space-y-2 text-center md:text-left">
            <h4 className="text-white font-black text-2xl uppercase italic tracking-tight">Download Report</h4>
            <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-sm">Dapatkan laporan riwayat transaksi dalam format PDF atau Excel untuk pembukuan pribadi Anda.</p>
          </div>
          <Button className="relative z-10 bg-primary hover:bg-emerald-500 text-white font-black rounded-2xl h-14 px-10 active:scale-95 transition-all shadow-xl shadow-primary/20 italic uppercase tracking-widest text-xs">
            Generate Report
          </Button>

          {/* Artistic background elements */}
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent skew-x-[-15deg] -mr-16"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
}
