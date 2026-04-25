import { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import { useOutletContext, useFetcher, useLoaderData } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
        transaction_type: intent, // Top_Up or Withdraw
        type, // Credit or Debit
        amount: parseInt(amount),
        description
      })
    });

    const result = await response.json();

    if (response.ok) {
      return json({ success: true, message: result.message || "Transaksi berhasil diajukan!" });
    }
    return json({ success: false, message: result.message || "Terjadi kesalahan pada transaksi." }, { status: 400 });
  } catch (error) {
    console.error("Wallet Action Error:", error);
    return json({ success: false, message: "Server error. Coba lagi nanti." }, { status: 500 });
  }
};

export default function WalletPage() {
  const { user } = useOutletContext();
  const { balance } = useLoaderData();
  
  const depositFetcher = useFetcher();
  const withdrawFetcher = useFetcher();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Handle successful actions
  useEffect(() => {
    if (depositFetcher.data?.success) {
      setDepositAmount("");
      alert("Top Up berhasil diajukan! Saldo akan bertambah setelah verifikasi.");
    }
  }, [depositFetcher.data]);

  useEffect(() => {
    if (withdrawFetcher.data?.success) {
      setWithdrawAmount("");
      alert("Penarikan saldo berhasil diajukan! Mohon tunggu 1x24 jam.");
    }
  }, [withdrawFetcher.data]);

  const handleDeposit = () => {
    if (!depositAmount || parseInt(depositAmount) < 10000) {
      alert("Minimal Top Up adalah Rp 10.000");
      return;
    }
    depositFetcher.submit(
      {
        intent: "Top_Up",
        type: "Credit",
        amount: depositAmount,
        description: "Top up saldo deposit via Transfer Bank"
      },
      { method: "post" }
    );
  };

  const handleWithdraw = () => {
    const amt = parseInt(withdrawAmount);
    if (!amt || amt < 50000) {
      alert("Minimal penarikan adalah Rp 50.000");
      return;
    }
    if (amt > balance) {
      alert("Saldo tidak mencukupi!");
      return;
    }
    withdrawFetcher.submit(
      {
        intent: "Withdraw",
        type: "Debit",
        amount: withdrawAmount,
        description: `Tarik saldo ke Rekening BCA - 1234567890 a/n ${user.name}`
      },
      { method: "post" }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-1 text-left">
        <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">My Wallet</h1>
        <p className="text-muted-foreground text-sm font-medium italic">Kelola saldo dan transaksi pembayaran Anda dengan aman.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Balance Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative p-1">
            <CardContent className="p-10 space-y-10 relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Available Balance</p>
                  <p className="text-4xl font-black italic tracking-tighter text-white">Rp {balance.toLocaleString('id-ID')}</p>
                </div>
                <div className="h-14 w-14 bg-white/5 backdrop-blur-3xl rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                  <Icons.Wallet className="h-6 w-6 bg-emerald-500/10 text-emerald-400" />
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-black">
                <div className="flex gap-1 items-center bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm">
                  <Icons.ShieldCheck className="h-4 w-4" /> SECURE
                </div>
                <span className="opacity-40 uppercase tracking-widest italic">Fully Encrypted</span>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] font-mono">SewaCosplay Card</div>
                <div className="flex -space-x-2 group cursor-pointer hover:opacity-100 opacity-60 transition-opacity">
                  <div className="h-5 w-5 bg-emerald-400 rounded-full blur-[1px]"></div>
                  <div className="h-5 w-5 bg-emerald-600 rounded-full blur-[1px]"></div>
                </div>
              </div>
            </CardContent>
            {/* Glossy decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] -ml-16 -mb-16"></div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-50 border border-slate-100 p-8 space-y-4">
            <div className="flex items-center gap-3 text-slate-900 group">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                <Icons.BadgePercent className="h-5 w-5" />
              </div>
              <span className="text-sm font-black uppercase italic tracking-tight">Cashback Promo!</span>
            </div>
            <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
              Dapatkan cashback 5% untuk setiap deposit minimal Rp 500.000 menggunakan QRIS. Berlaku hingga akhir bulan ini!
            </p>
          </Card>
        </div>

        {/* Transaction Forms */}
        <Card className="lg:col-span-8 border-none shadow-sm rounded-[3rem] bg-white overflow-hidden border border-slate-50 shadow-slate-200/50">
          <Tabs defaultValue="deposit" className="w-full">
            <div className="px-10 pt-10 flex items-center justify-between">
              <TabsList className="bg-slate-100/50 border border-slate-100 p-1.5 rounded-[2rem] h-auto">
                <TabsTrigger value="deposit" className="rounded-[1.5rem] px-10 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:shadow-slate-200 transition-all">
                  Deposit
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="rounded-[1.5rem] px-10 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-xl data-[state=active]:shadow-slate-200 transition-all">
                  Withdraw
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="deposit" className="p-10 space-y-8 mt-0 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Nominal Deposit</label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-primary transition-colors">Rp</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="pl-16 h-18 rounded-[2rem] border-2 border-slate-50 bg-slate-50/50 font-black text-2xl text-slate-900 focus-visible:ring-primary/10 focus:border-primary/30 transition-all shadow-inner placeholder:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[50000, 100000, 250000, 500000].map(amt => (
                    <Button
                      key={amt}
                      variant="outline"
                      onClick={() => setDepositAmount(amt.toString())}
                      className={`rounded-2xl border-2 h-14 font-black text-xs transition-all active:scale-95 ${depositAmount === amt.toString() ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50 text-slate-500'
                        }`}
                    >
                      + {amt.toLocaleString('id-ID')}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3 pt-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Pilih Metode Pembayaran</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-primary bg-primary/5 cursor-pointer group shadow-lg shadow-primary/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl shadow-primary/10 transition-transform group-hover:scale-110">
                          <Icons.QrCode className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase italic tracking-tight">QRIS / E-Wallet</span>
                          <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest mt-0.5 italic">Instant Payment</span>
                        </div>
                      </div>
                      <div className="h-6 w-6 rounded-full border-4 border-primary bg-white flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 hover:border-slate-200 cursor-pointer group transition-all opacity-40 grayscale">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center p-2">
                          <Icons.CreditCard className="h-6 w-6 text-slate-300" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase italic tracking-tight text-slate-400">Transfer Bank</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5 italic">Manual Check</span>
                        </div>
                      </div>
                      <div className="h-6 w-6 rounded-full border-2 border-slate-100 bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDeposit}
                disabled={depositFetcher.state !== "idle" || !depositAmount}
                className="w-full h-18 rounded-[2rem] bg-slate-900 hover:bg-primary transition-all text-white font-black text-lg uppercase italic tracking-tighter shadow-2xl shadow-slate-900/10 active:scale-95 flex gap-4"
              >
                {depositFetcher.state !== "idle" ? (
                  <Icons.Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Icons.Zap className="h-6 w-6 text-primary animate-pulse" />
                )}
                {depositFetcher.state !== "idle" ? "Processing..." : "Top Up Sekarang"}
              </Button>
            </TabsContent>

            <TabsContent value="withdraw" className="p-10 space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 text-rose-600">Nominal Penarikan</label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-rose-500 transition-colors">Rp</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-16 h-18 rounded-[2rem] border-2 border-slate-50 bg-slate-50/50 font-black text-2xl text-rose-600 focus-visible:ring-rose-500/10 focus:border-rose-500/30 transition-all shadow-inner placeholder:text-slate-200"
                    />
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Maksimal penarikan: Rp {balance.toLocaleString('id-ID')}</p>
                    <button onClick={() => setWithdrawAmount(balance.toString())} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline italic">Tarik Semua</button>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Rekening Tujuan</label>
                  <div className="p-8 rounded-[2.5rem] border-2 border-slate-50 bg-slate-50/30 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest mb-2 inline-block">Primary</span>
                        <p className="text-base font-black text-slate-900 italic tracking-tight">Bank Central Asia (BCA)</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">**** **** 1234 - {user?.name?.toUpperCase() || "MEMBER"}</p>
                      </div>
                      <Icons.CreditCard className="h-10 w-10 text-slate-100 transition-transform group-hover:scale-110" />
                    </div>
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-slate-500/5 rounded-full blur-2xl transition-transform group-hover:scale-150"></div>
                  </div>
                  <Button variant="link" className="text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest p-2 h-auto italic">+ Ganti Info Rekening</Button>
                </div>
              </div>

              <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-[2rem] flex gap-4">
                <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                  <Icons.ShieldAlert className="h-5 w-5 text-rose-500" />
                </div>
                <p className="text-[10px] leading-relaxed text-rose-800 font-medium italic">
                  Penarikan saldo membutuhkan verifikasi keamanan. Proses dana masuk ke rekening Anda adalah <span className="font-black">1x24 jam</span> (Hari Kerja). Pastikan informasi Anda sudah valid.
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={handleWithdraw}
                disabled={withdrawFetcher.state !== "idle" || !withdrawAmount}
                className="w-full h-18 rounded-[2rem] bg-rose-600 hover:bg-rose-700 transition-all text-white font-black text-lg uppercase italic tracking-tighter shadow-2xl shadow-rose-500/20 active:scale-95 flex gap-4 border-none"
              >
                {withdrawFetcher.state !== "idle" ? (
                  <Icons.Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Icons.ArrowDownToLine className="h-6 w-6" />
                )}
                {withdrawFetcher.state !== "idle" ? "Processing..." : "Tarik Saldo Sekarang"}
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
