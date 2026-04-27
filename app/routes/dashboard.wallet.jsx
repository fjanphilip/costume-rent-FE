import { useState, useEffect, useRef } from "react";
import { json } from "@remix-run/node";
import { useOutletContext, useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { getSession } from "~/lib/session.server";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/deposit/balance", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();
    return json({ balance: data.deposit_balance || 0 });
  } catch (error) {
    return json({ balance: 0 });
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();

  const intent = formData.get("intent");
  const amount = formData.get("amount");
  const description = formData.get("description");
  const type = formData.get("type");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/deposit/transactions", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        transaction_type: intent,
        type,
        amount: parseInt(amount),
        description
      })
    });

    const result = await response.json();
    if (response.ok) return json({ success: true, ...result });
    return json({ success: false, message: result.message || "Transaksi gagal." }, { status: 400 });
  } catch (error) {
    return json({ success: false, message: "Server error." }, { status: 500 });
  }
};

export default function WalletPage() {
  const { user } = useOutletContext();
  const { balance } = useLoaderData();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [successType, setSuccessType] = useState(null); // 'deposit' or 'withdraw'
  const [errorMsg, setErrorMsg] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("Idle");
  const processedTokenRef = useRef(null);

  // Midtrans & Polling Integration
  useEffect(() => {
    const snapToken = fetcher.data?.snap_token;
    const newTrxId = fetcher.data?.data?.id;

    if (snapToken && processedTokenRef.current !== snapToken) {
      if (window.snap) {
        processedTokenRef.current = snapToken;
        setTransactionId(newTrxId);
        setCurrentStatus("Pending");
        
        window.snap.pay(snapToken, {
          onSuccess: function (result) {
            try {
              if (window.snap && typeof window.snap.hide === 'function') {
                window.snap.hide();
              }
            } catch (e) {}
            setDepositAmount("");
            setSuccessType("deposit");
            setCurrentStatus("Completed");
            revalidator.revalidate();
            processedTokenRef.current = null;
          },
          onPending: () => setCurrentStatus("Pending"),
          onClose: () => {
            processedTokenRef.current = null;
            revalidator.revalidate();
          }
        });
      }
    }
  }, [fetcher.data, revalidator]);

  useEffect(() => {
    let pollInterval;
    if (transactionId && currentStatus === "Pending") {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/check-deposit-status?id=${transactionId}`);
          const data = await res.json();
          if (data.status === "Completed") {
            try {
              if (window.snap && typeof window.snap.hide === 'function') {
                window.snap.hide(); 
              }
            } catch (e) {
              console.warn("Midtrans hide error:", e);
            }
            setCurrentStatus("Completed");
            setSuccessType("deposit");
            setTransactionId(null);
            revalidator.revalidate();
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(pollInterval);
  }, [transactionId, currentStatus, revalidator]);

  const processedWithdrawRef = useRef(null);

  // Handle Withdraw Success -> WhatsApp Redirect
  useEffect(() => {
    const trxData = fetcher.data?.data;
    if (fetcher.data?.success && trxData?.transaction_type === "Withdraw") {
      // Pastikan hanya running jika ID transaksi ini belum pernah diproses
      if (processedWithdrawRef.current !== trxData.id) {
        processedWithdrawRef.current = trxData.id;
        
        const amount = trxData.amount;
        const refId = trxData.reference_id;
        const adminPhone = "6283832352467";
        
        const message = `Halo Admin, saya ingin mengajukan penarikan saldo:\n\n` +
                        `Nominal: Rp ${amount.toLocaleString('id-ID')}\n` +
                        `Ref ID: ${refId}\n` +
                        `Rekening: BCA - 1234567890 a/n ${user?.name || 'Jan Philip Faith'}\n\n` +
                        `Mohon segera diproses. Terima kasih.`;
        
        const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        
        setWithdrawAmount("");
        setSuccessType("withdraw");
        revalidator.revalidate();
      }
    }
  }, [fetcher.data, revalidator, user?.name]);

  const handleDeposit = () => {
    const amt = parseInt(depositAmount);
    if (!amt || amt < 10000) return setErrorMsg("Minimal pengisian saldo adalah Rp 10.000");
    fetcher.submit(
      { intent: "Top_Up", type: "Credit", amount: depositAmount, description: "Top up via Midtrans" },
      { method: "post" }
    );
  };

  const handleWithdraw = () => {
    const amt = parseInt(withdrawAmount);
    if (!amt || amt < 50000) return setErrorMsg("Minimal penarikan dana adalah Rp 50.000");
    if (amt > balance) return setErrorMsg("Saldo Anda tidak mencukupi untuk penarikan ini.");
    
    fetcher.submit(
      { 
        intent: "Withdraw", 
        type: "Debit", 
        amount: withdrawAmount, 
        description: `Tarik saldo ke Rekening BCA - 1234567890 a/n ${user?.name || 'Jan Philip Faith'}` 
      },
      { method: "post" }
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Dompet Saya</h1>
        <p className="text-sm text-slate-500">Kelola saldo deposit dan riwayat transaksi keuangan Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-lg overflow-hidden relative">
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Saldo</span>
                <Icons.Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold leading-none">
                  Rp {balance.toLocaleString('id-ID')}
                </h2>
                <p className="text-xs text-slate-400">Tersedia untuk disewa</p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                <Icons.ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Terverifikasi</span>
              </div>
            </CardContent>
            <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-primary/20 rounded-full blur-3xl"></div>
          </Card>

          <Card className="border-slate-100 bg-slate-50/50 p-6 space-y-3">
             <div className="flex items-center gap-2 text-slate-900 font-bold">
               <Icons.Zap className="h-4 w-4 text-primary" />
               <span className="text-sm">Info Deposit</span>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               Gunakan QRIS atau E-Wallet untuk pengisian saldo instan. Saldo akan bertambah otomatis setelah pembayaran berhasil.
             </p>
          </Card>
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl sm:rounded-3xl">
            <Tabs defaultValue="deposit" className="w-full">
              <div className="border-b border-slate-100 px-4 sm:px-8 pt-6">
                <TabsList className="bg-slate-100/50 p-1 rounded-xl h-12 w-full max-w-[320px] grid grid-cols-2">
                  <TabsTrigger value="deposit" className="rounded-lg py-2 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Isi Saldo
                    {currentStatus === "Pending" && <span className="ml-2 h-2 w-2 bg-primary rounded-full animate-pulse" />}
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="rounded-lg py-2 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Tarik Dana
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-8">
                <TabsContent value="deposit" className="space-y-6 mt-0 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Masukkan Nominal</label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="pl-12 h-14 text-xl font-bold rounded-2xl border-slate-200 focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[50000, 100000, 250000, 500000].map(amt => (
                        <Button
                          key={amt}
                          variant="outline"
                          onClick={() => setDepositAmount(amt.toString())}
                          className={`rounded-xl h-12 font-bold text-xs transition-all ${depositAmount === amt.toString() ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500'}`}
                        >
                          + {amt.toLocaleString('id-ID')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleDeposit}
                    disabled={fetcher.state !== "idle" || !depositAmount}
                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-md transition-all flex gap-3"
                  >
                    {fetcher.state !== "idle" ? <Icons.Loader2 className="h-5 w-5 animate-spin" /> : <Icons.Zap className="h-5 w-5" />}
                    {fetcher.state !== "idle" ? "Memproses..." : "Top Up Sekarang"}
                  </Button>
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-6 mt-0 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nominal Penarikan</label>
                      <button onClick={() => setWithdrawAmount(balance.toString())} className="text-xs font-bold text-primary hover:underline">Tarik Semua</button>
                    </div>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="pl-12 h-14 text-xl font-bold rounded-2xl border-slate-200 focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                        <Icons.CreditCard className="h-6 w-6 text-slate-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">Bank Central Asia (BCA)</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">**** 1234 • {user?.name}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleWithdraw}
                    disabled={fetcher.state !== "idle" || !withdrawAmount}
                    className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-md transition-all flex gap-3"
                  >
                    {fetcher.state !== "idle" ? <Icons.Loader2 className="h-5 w-5 animate-spin" /> : <Icons.ArrowDownToLine className="h-5 w-5" />}
                    {fetcher.state !== "idle" ? "Memproses..." : "Tarik Dana"}
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {successType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
          <Card className="max-w-sm w-full border-none shadow-xl rounded-3xl bg-white overflow-hidden animate-in zoom-in-95 duration-300">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                <Icons.Check className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  {successType === 'deposit' ? 'Top Up Berhasil!' : 'Pengajuan Berhasil!'}
                </h3>
                <p className="text-sm text-slate-500">
                  {successType === 'deposit' 
                    ? 'Saldo Anda telah diperbarui secara otomatis. Terima kasih!' 
                    : 'Permintaan penarikan Anda telah kami terima. Admin akan segera memprosesnya.'}
                </p>
                {successType === 'withdraw' && (
                  <p className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full">WhatsApp Admin Telah Dibuka</p>
                )}
              </div>
              <Button onClick={() => setSuccessType(null)} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">Tutup</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Modal */}
      {errorMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="max-w-sm w-full border-none shadow-xl rounded-3xl bg-white overflow-hidden animate-in zoom-in-95 duration-300">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="h-20 w-20 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
                <Icons.AlertCircle className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Gagal</h3>
                <p className="text-sm text-slate-500">{errorMsg}</p>
              </div>
              <Button onClick={() => setErrorMsg(null)} className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold">Saya Mengerti</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
