import { Link } from "@remix-run/react";
import * as Icons from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-20">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tighter italic text-primary">SewaCosplay</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Platform penyewaan kostum anime dan tradisional nomor 1 di Indonesia. Wujudkan karakter impianmu bersama kami.
            </p>
            <div className="flex gap-4">
               <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  {Icons.Instagram && <Icons.Instagram className="h-5 w-5" />}
               </div>
               <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  {Icons.Twitter && <Icons.Twitter className="h-5 w-5" />}
               </div>
               <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  {Icons.Facebook && <Icons.Facebook className="h-5 w-5" />}
               </div>
            </div>
          </div>

          <div className="space-y-6">
             <h4 className="font-bold text-lg">Quick Links</h4>
             <ul className="space-y-4 text-white/60 text-sm font-medium">
                <li><Link to="/catalog" className="hover:text-primary transition-colors">Katalog Kostum</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Cara Menyewa</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
             </ul>
          </div>

          <div className="space-y-6">
             <h4 className="font-bold text-lg">Categories</h4>
             <ul className="space-y-4 text-white/60 text-sm font-medium">
                <li className="hover:text-primary transition-colors cursor-pointer">Anime Shonen</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Traditional Japanese</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Movie & Cinema</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Game Cosplay</li>
             </ul>
          </div>

          <div className="space-y-6">
             <h4 className="font-bold text-lg">Newsletter</h4>
             <p className="text-white/60 text-sm leading-relaxed">
                Dapatkan info promo dan update kostum terbaru langsung di emailmu.
             </p>
             <div className="flex gap-2">
                <input 
                   type="email" 
                   placeholder="Email anda..." 
                   className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex-1 text-sm outline-none focus:border-primary transition-colors"
                />
                <button className="bg-primary text-white p-2 rounded-xl h-10 w-10 flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-primary/20">
                   {Icons.Send && <Icons.Send className="h-4 w-4" />}
                </button>
             </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-white/30">
           <p>© 2024 SEWA COSPLAY TEAM. ALL RIGHTS RESERVED.</p>
           <div className="flex gap-8">
              <span>Privacy Policy</span>
              <span>Terms of Use</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
