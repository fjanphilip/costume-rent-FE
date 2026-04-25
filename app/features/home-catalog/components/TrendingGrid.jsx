import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { TRENDING_OUTFITS } from "../constants";

export function TrendingGrid() {
  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1 text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Trending Outfits</h2>
          <p className="text-muted-foreground text-sm">Kostum paling banyak disewa minggu ini.</p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-xl items-center text-xs">
          <Button size="sm" className="bg-background shadow-sm hover:bg-background text-primary font-bold px-4 h-7">Popular</Button>
          <Link to="/catalog"><Button variant="ghost" size="sm" className="h-7 px-4">See All</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {TRENDING_OUTFITS.map((outfit) => (
          <div key={outfit.id} className="group flex flex-col gap-4 bg-white p-4 rounded-[2rem] border border-transparent hover:border-primary/20 transition-all hover:shadow-xl">
            <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-muted">
              <img
                src={outfit.image}
                alt={outfit.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-primary shadow-sm">
                {outfit.category}
              </div>
            </div>
            <div className="px-2 flex flex-col gap-1 text-left">
              <h3 className="font-bold text-lg line-clamp-1">{outfit.name}</h3>
              <p className="text-primary font-black">Rp {outfit.price.toLocaleString('id-ID')}</p>
            </div>
            <Button className="w-full h-11 rounded-xl font-bold bg-muted text-foreground hover:bg-primary hover:text-white transition-all active:scale-95 shadow-none hover:shadow-lg hover:shadow-primary/20">
              View Detail
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
