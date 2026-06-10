import { useState, useRef } from "react";
import * as Icons from "lucide-react";
import { UserSidebar } from "./components/UserSidebar";
import { BookingTable } from "./components/BookingTable";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export default function UserDashboardFeature({ user }) {
  const userName = user?.name || "Member";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleVerificationRedirect = () => {
    const adminPhone = "6283832352467";
    const message = `Halo Admin, saya ingin mengajukan verifikasi identitas untuk akun: ${userName}`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <UserSidebar user={user} />

      <main className="flex-1 p-4 md:p-10 space-y-10 animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
              My <span className="text-primary text-xl">Account</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Overview of your activity and profile</p>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant={user?.is_verified ? "default" : "outline"} className={`rounded-full px-4 py-1.5 font-black italic uppercase text-[10px] ${user?.is_verified ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-slate-200 text-slate-400'}`}>
              {user?.is_verified ? 'Verified Member' : 'Unverified Account'}
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <BookingTable />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative group">
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <Icons.ShieldCheck className={`h-8 w-8 ${user?.is_verified ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black italic uppercase tracking-tight">Identity Verification</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest italic">Secure your account</p>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-medium">Verifikasi identitas Anda untuk mendapatkan akses penuh ke semua kostum premium dan fitur prioritas kami.</p>

                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-primary hover:text-white font-black uppercase italic tracking-widest transition-all text-[11px]"
                >
                  Verify Now
                </Button>
              </CardContent>
              <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                  <Icons.HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black uppercase italic tracking-tight">Need Help?</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Customer Support</p>
                </div>
              </div>
              <Button variant="outline" className="w-full h-12 rounded-xl border-2 border-slate-50 hover:border-slate-200 font-black uppercase italic tracking-widest text-[10px] text-slate-400 hover:text-slate-900">Contact Support</Button>
            </Card>
          </div>
        </div>

        {/* Verification Modal / Pop-up */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white rounded-[3rem] border-none shadow-2xl">
            <div className="relative">
              {/* Modal Header Visual */}
              <div className="h-32 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                <Icons.ShieldCheck className="h-16 w-16 text-primary animate-pulse relative z-10" />
                <div className="absolute top-0 right-0 h-full w-32 bg-primary/20 blur-3xl rounded-full -mr-16"></div>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-2 text-center">
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tight text-slate-900 leading-tight">
                    Verifikasi Identitas
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 italic leading-relaxed">
                    Untuk menjamin keamanan komunitas kami, mohon lakukan verifikasi identitas resmi Anda (KTP/SIM/Paspor).
                  </DialogDescription>
                </div>

                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <Icons.MessageSquare className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-900 italic tracking-tight">Direct WhatsApp</p>
                      <p className="text-[9px] text-slate-500 font-medium italic">Anda akan diarahkan langsung ke Admin untuk pengiriman dokumen secara aman.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleVerificationRedirect}
                    className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-emerald-600 text-white font-black uppercase italic tracking-widest transition-all text-sm shadow-xl shadow-slate-900/10 flex gap-3"
                  >
                    <Icons.MessageCircle className="h-5 w-5" />
                    Hubungi Admin
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full h-12 rounded-xl text-slate-400 font-bold uppercase italic tracking-widest text-[10px]"
                  >
                    Mungkin Nanti
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
