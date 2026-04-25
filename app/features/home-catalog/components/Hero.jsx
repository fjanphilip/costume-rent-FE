import { Link } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Button } from "~/components/ui/button";

export function Hero() {
  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl pt-4">
      <div className="relative rounded-[2rem] overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center shadow-2xl">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1200&q=80"
          alt="Hero Anime"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 bg-linear-to-r from-black/60 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 px-8 md:px-16 space-y-6 max-w-2xl text-white text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
            New Arrival
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            New Anime <br />
            <span className="text-primary italic">Season Arrivals</span>
          </h1>
          <p className="text-white/80 text-sm md:text-lg max-w-md">
            Siapkan dirimu untuk musim baru anime! Dapatkan koleksi kostum terbaru dengan kualitas premium dan detail yang akurat.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/catalog">
              <Button size="lg" className="h-12 px-8 rounded-xl font-bold active:scale-95 transition-transform">
                Explore Collection
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 rounded-xl bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white font-bold active:scale-95 transition-transform">

              Flash Deals
            </Button>
          </div>
        </div>

        {/* Decorative Indicator (From Figma) */}
        <div className="absolute bottom-8 right-12 flex gap-2">
          <div className="h-1.5 w-8 bg-primary rounded-full"></div>
          <div className="h-1.5 w-2 bg-white/50 rounded-full"></div>
          <div className="h-1.5 w-2 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
