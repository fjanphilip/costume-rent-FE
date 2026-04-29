import { useState } from "react";
import * as Icons from "lucide-react";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { Navbar } from "../home-catalog/components/Navbar";
import { Footer } from "~/components/layout/Footer";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DatePickerWithRange } from "~/components/ui/date-range-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { format } from "date-fns";

export default function CostumeDetailFeature() {
  const { costume, user, bookedDates: bookedDatesStrings = [] } = useLoaderData();
  const navigate = useNavigate();

  // Convert booked dates strings to Date objects
  const bookedDates = bookedDatesStrings.map(d => new Date(d));
  const [selectedImage, setSelectedImage] = useState(
    costume.images?.[0]?.image_path || null
  );

  const [date, setDate] = useState({
    from: undefined,
    to: undefined,
  });
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleOpenChange = (isOpen) => {
    if (!isOpen && date?.from && date?.to) {
      const diff = Math.ceil((date.to - date.from) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 3) {
        setIsAlertOpen(true);
      }
    }
  };

  const images = costume.images || [];

  const calculateDays = () => {
    if (!date?.from || !date?.to) return 3;
    const diff = Math.ceil((date.to - date.from) / (1000 * 60 * 60 * 24));
    return diff > 0 ? Math.max(diff, 3) : 3;
  };

  const days = calculateDays();
  const totalRental = costume.rental_price * days;

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFE] text-left">
      <Navbar user={user} />

      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl py-12">

          {/* Top Section: Breadcrumbs & Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-all">Home</Link>
              <Icons.ChevronRight className="h-3 w-3" />
              <Link to="/catalog" className="hover:text-primary transition-all">Catalog</Link>
              <Icons.ChevronRight className="h-3 w-3" />
              <span className="text-primary italic">{costume.name}</span>
            </nav>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest leading-none">
                {costume.category || "Cosplay"}
              </Badge>
              <div className="h-4 w-[1px] bg-slate-200"></div>
              <div className="flex items-center gap-1 text-amber-500">
                <Icons.Star className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-black italic text-slate-900">4.9 (120+)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">

            {/* Left: Fixed Gallery */}
            <div className="lg:w-[50%]">
              <div className="sticky top-32 space-y-6">
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-white border-8 border-white shadow-2xl shadow-primary/5 group">
                  <img
                    src={selectedImage ? `http://127.0.0.1:8000/storage/${selectedImage}` : "https://images.unsplash.com/photo-1608831540955-35094d48694a?w=800&q=80"}
                    alt={costume.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <Badge className="bg-primary/90 backdrop-blur-md text-white border-none py-1.5 px-4 rounded-full text-[10px] font-black tracking-widest uppercase">
                      {costume.series}
                    </Badge>
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-4 p-1 overflow-x-auto scrollbar-hide">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img.image_path)}
                        className={`relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === img.image_path ? 'border-primary shadow-lg shadow-primary/10 scale-105' : 'border-white hover:border-primary/20'
                          }`}
                      >
                        <img src={`http://127.0.0.1:8000/storage/${img.image_path}`} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Detailed Info */}
            <div className="lg:w-[50%] space-y-12">
              <div className="space-y-4">
                <h1 className="text-5xl font-black tracking-tight leading-none text-slate-900 group">
                  {costume.name}
                  <span className="block h-2 w-16 bg-primary mt-4 rounded-full transition-all group-hover:w-24"></span>
                </h1>

                <div className="flex items-baseline gap-2 pt-2">
                  <p className="text-4xl font-black text-primary italic">Rp {costume.rental_price.toLocaleString('id-ID')}</p>
                  <span className="text-sm font-bold text-muted-foreground italic">/ hari sewa</span>
                </div>
              </div>

              {/* Action: Booking Card (Main Focus) */}
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 h-40 w-40 bg-primary opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

                <div className="space-y-8 relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Booking Jadwal</h3>
                    <Badge className="bg-primary/20 text-primary border-none font-bold text-[10px] uppercase tracking-widest">{days} Hari Terpilih</Badge>
                  </div>

                  <div className="space-y-3">
                    <DatePickerWithRange
                      date={date}
                      setDate={setDate}
                      onOpenChange={handleOpenChange}
                      label="Durasi Penyewaan"
                      bookedDates={bookedDates}
                    />
                    <p className="text-[10px] text-primary/80 font-bold italic">* Minimal durasi penyewaan adalah 3 hari.</p>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/40 mb-1">Total Biaya Sewa</p>
                      <p className="text-3xl font-white text-white italic ">Rp {totalRental.toLocaleString('id-ID')}</p>
                    </div>
                    <Link
                      to={user?.is_verified ? `/checkout?costume_slug=${costume.slug}${date?.from ? `&start_date=${format(date.from, "yyyy-MM-dd")}` : ""}${date?.to ? `&end_date=${format(date.to, "yyyy-MM-dd")}` : ""}` : "/dashboard"}
                      className="inline-block"
                    >
                      <Button
                        className={`h-16 px-10 rounded-2xl transition-all text-base group w-full font-black shadow-2xl ${!user?.is_verified
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                            : 'bg-white hover:bg-primary/90 hover:text-white text-black shadow-primary/20'
                          }`}
                      >
                        {!user?.is_verified ? (
                          <>
                            Verifikasi Identitas
                            <Icons.Lock className="ml-2 h-5 w-5" />
                          </>
                        ) : (
                          <>
                            Lanjut Detail Sewa
                            <Icons.ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                          </>
                        )}
                      </Button>
                    </Link>

                  </div>
                </div>
              </div>

              {/* Secondary Details: Tabs/Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 italic">
                    <Icons.Info className="h-4 w-4 text-primary" /> Informasi Produk
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between text-sm">
                      <span className="font-bold text-muted-foreground">Size</span>
                      <span className="font-black text-slate-800">{costume.size}</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="font-bold text-muted-foreground">Series</span>
                      <span className="font-black text-slate-800">{costume.series}</span>
                    </li>
                    <li className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-muted-foreground">Deposit</span>
                        <span className="font-black text-emerald-600">Rp {costume.required_deposit.toLocaleString('id-ID')}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 italic text-right">* Deposit akan ditotal saat checkout</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 italic">
                    <Icons.Layers className="h-4 w-4 text-primary" /> Aksesori Item
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {costume.accessories?.length > 0 ? costume.accessories.map(acc => (
                      <Badge key={acc.id} variant="outline" className="border-slate-200 text-slate-600 font-bold text-[10px] uppercase px-3 py-1">
                        {acc.name}
                      </Badge>
                    )) : <span className="text-xs text-muted-foreground italic">Tidak ada aksesori.</span>}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4 pt-8 border-t border-slate-100">
                <h3 className="text-lg font-black italic">Tentang Kostum</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {costume.description || "Kostum premium dengan kualitas bahan terbaik untuk memberikan detail semirip mungkin dengan karakter aslinya."}
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />

      {/* Date Validation Alert Modal */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-[3rem] border-none shadow-2xl">
          <div className="p-10 flex flex-col items-center text-center space-y-6">
            <div className="h-20 w-20 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
              <Icons.AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-slate-900">Durasi Kurang dari 3 Hari</DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Peringatan: Minimal durasi penyewaan kostum adalah <strong className="text-slate-900">3 hari</strong>. Sistem akan secara otomatis membulatkan perhitungan biaya untuk 3 hari sewa.
              </DialogDescription>
            </div>
            <Button onClick={() => setIsAlertOpen(false)} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm">
              Saya Mengerti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


