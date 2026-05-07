import { Link } from "@remix-run/react";
// import * as Icons from "lucide-react";


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
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                     </div>
                     <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                     </div>
                     <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
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
