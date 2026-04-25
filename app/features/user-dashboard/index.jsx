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
  DialogDescription 
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

export default function UserDashboardFeature({ user }) {
  const userName = user?.name || "BujangCosplay";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBFBFE]">
      <UserSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl py-10 space-y-8 text-left">
           
           <header className="flex flex-col gap-1 text-left">
              <h1 className="text-3xl font-black tracking-tight italic">Halo, {userName}! 👋</h1>
              <p className="text-muted-foreground text-sm font-medium italic">Selamat datang kembali. Cek status penyewaan kostum kamu di sini.</p>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm rounded-3xl bg-primary text-white overflow-hidden relative group">
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Points</span>
                       <Icons.Zap className="h-5 w-5 fill-white/20" />
                    </div>
                    <p className="text-4xl font-black italic">2,450</p>
                    <p className="text-[10px] mt-2 font-bold opacity-60 italic">Setara dengan Rp 24.500</p>
                 </CardContent>
                 <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Rentals</span>
                       <Icons.Clock className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-4xl font-black text-foreground italic">01</p>
                    <p className="text-[10px] mt-2 font-bold text-emerald-500 flex items-center gap-1 italic">
                       <Icons.CheckCircle2 className="h-3 w-3" /> Ready for pickup
                    </p>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wishlist</span>
                       <Icons.Heart className="h-5 w-5 text-rose-500 fill-rose-500/10" />
                    </div>
                    <p className="text-4xl font-black text-foreground italic">12</p>
                    <p className="text-[10px] mt-2 font-bold text-muted-foreground italic">Kostum impian kamu</p>
                 </CardContent>
              </Card>
           </div>

           <BookingTable />

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <div className="bg-emerald-500 rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-500/20">
                    <div className="relative z-10 flex flex-col gap-4">
                        <h4 className="text-xl font-black italic uppercase tracking-tight">Verifikasi Identitas</h4>
                        <p className="text-white/80 text-xs max-w-[200px] font-medium italic leading-relaxed">Dapatkan badge "Verified Member" untuk diskon penyewaan hingga 20%.</p>
                        <div className="bg-white text-emerald-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit active:scale-95 transition-transform shadow-lg shadow-emerald-900/10">Verifikasi Sekarang</div>
                    </div>
                    <Icons.ShieldCheck className="absolute -right-8 -bottom-8 h-40 w-40 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                </DialogTrigger>

                <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
                  <DialogHeader className="p-10 pb-4">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                        <Icons.ShieldCheck className="h-7 w-7" />
                    </div>
                    <DialogTitle>Verifikasi Identitas</DialogTitle>
                    <DialogDescription>
                        Unggah foto KTP atau kartu identitas lainnya untuk memverifikasi akun Anda.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="p-10 pt-4 space-y-8">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative h-64 w-full rounded-[2.5rem] border-4 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 ${
                          previewImage ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200'
                      }`}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        {previewImage ? (
                          <>
                            <img src={previewImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <p className="text-white text-xs font-black uppercase tracking-widest">Ganti Gambar</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center border shadow-sm">
                              <Icons.Camera className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-black text-slate-900">Klik untuk upload atau ambil foto</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Maksimal file 5MB (PNG, JPG)</p>
                            </div>
                          </>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-wider text-slate-700">
                          <Icons.Info className="h-4 w-4 text-primary" />
                          Petunjuk Verifikasi
                        </div>
                        <ul className="space-y-2">
                          {[
                            "Foto harus jelas dan tidak buram",
                            "Identitas masih berlaku (E-KTP)",
                            "Informasi nama & NIK terlihat jelas"
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-500 italic">
                                <Icons.Check className="h-3 w-3 text-emerald-500" /> {item}
                            </li>
                          ))}
                        </ul>
                    </div>

                    <Button 
                      disabled={!previewImage}
                      className="w-full h-18 rounded-[1.8rem] bg-slate-900 hover:bg-emerald-600 transition-all text-white font-black text-lg disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
                      onClick={() => {
                          alert("Identitas berhasil diunggah! Mohon tunggu verifikasi admin.");
                          setIsModalOpen(false);
                      }}
                    >
                        Kirim untuk Verifikasi
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-500/20 font-black">
                 <div className="relative z-10 flex flex-col gap-4 text-left">
                    <h4 className="text-xl font-bold italic uppercase tracking-tight">Butuh Bantuan?</h4>
                    <p className="text-white/80 text-xs max-w-[200px] font-medium italic leading-relaxed">Hubungi customer service kami jika ada kendala dalam penyewaan.</p>
                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase w-fit active:scale-95 transition-transform">Chat Support</button>
                 </div>
                 <Icons.MessageSquare className="absolute -right-8 -bottom-8 h-40 w-40 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}
