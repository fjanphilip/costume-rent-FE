import { useState } from "react";
import * as Icons from "lucide-react";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { Navbar } from "../home-catalog/components/Navbar";
import { Footer } from "~/components/layout/Footer";
import { FilterSidebar } from "./components/FilterSidebar";
import { Button } from "~/components/ui/button";
import { Pagination } from "./components/Pagination";


export default function CatalogFeature() {
  const { user, pagination, filterOptions } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const costumes = pagination?.data || [];
  const meta = {
    current_page: pagination?.current_page || 1,
    last_page: pagination?.last_page || 1,
    total: pagination?.total || 0,
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const query = formData.get("search");

    const params = new URLSearchParams(searchParams);
    if (query) params.set("search", query);
    else params.delete("search");
    params.set("page", "1");
    setSearchParams(params);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFE] text-left">
      <Navbar user={user} />

      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl py-12">

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                <Icons.Home className="h-3 w-3" /> Home / Catalog
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tight">Katalog Kostum</h1>
                <p className="text-muted-foreground text-sm">Temukan ribuan kostum anime, gaming, dan tradisional terbaik.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <form onSubmit={handleSearch} className="relative w-full sm:w-80 group">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  name="search"
                  type="text"
                  placeholder="Cari Kostum atau Series..."
                  defaultValue={searchParams.get("search") || ""}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border-2 border-transparent focus:border-primary shadow-sm outline-none transition-all font-bold text-sm"
                />
              </form>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex-1 rounded-xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20"
                >
                  {Icons.Filter && <Icons.Filter className="h-4 w-4" />} Filters
                </Button>
                <Button variant="outline" className="rounded-xl border-2 h-12 px-6 font-bold gap-2 bg-white">
                  {Icons.SortAsc && <Icons.SortAsc className="h-4 w-4" />} Sort
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 relative">
            {/* Desktop Sidebar */}
            <aside className="w-72 flex-shrink-0 hidden lg:block sticky top-32 h-fit">
              <FilterSidebar options={filterOptions} />
            </aside>

            {/* Mobile Filter Overlay */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
                <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white p-8 overflow-y-auto animate-in slide-in-from-right duration-500 rounded-l-[3rem]">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black uppercase italic text-primary">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)} className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Icons.X className="h-5 w-5" />
                    </button>
                  </div>
                  <FilterSidebar options={filterOptions} />
                </div>
              </div>
            )}

            <div className="flex-1">
              {costumes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {costumes.map((product) => (
                    <Link to={`/catalog/${product.slug}`} key={product.id} className="group flex flex-col gap-4 bg-white p-4 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer text-left">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-100">
                        <img
                          src={
                            product.images?.[0]?.image_path
                              ? `http://127.0.0.1:8000/storage/${product.images[0].image_path}`
                              : "https://images.unsplash.com/photo-1608831540955-35094d48694a?w=500&q=80"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Icons.Heart className="h-5 w-5" />
                        </div>
                        <div className="absolute bottom-4 left-4 flex gap-2">
                          <span className="bg-primary/90 backdrop-blur text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none flex items-center justify-center h-6">
                            {product.series || product.brand || "Cosplay"}
                          </span>
                        </div>
                      </div>

                      <div className="px-2 space-y-1">
                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                          <Icons.Star className="h-3 w-3 fill-current" />
                          <span className="text-[10px] font-black uppercase tracking-widest">4.9</span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                        <p className="text-xl font-black text-primary italic">Rp {product.rental_price.toLocaleString('id-ID')}<span className="text-[10px] not-italic font-bold text-muted-foreground ml-1">/ hari</span></p>
                      </div>

                      <Button className="w-full h-12 rounded-[1.5rem] font-bold text-base shadow-lg shadow-primary/10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Lihat Detail
                      </Button>
                    </Link>
                  ))}

                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed">
                  <Icons.Ghost className="h-16 w-16 text-muted-foreground opacity-20" />
                  <p className="font-bold text-muted-foreground">Yah, belum ada kostum di katalog nih...</p>
                </div>
              )}

              <Pagination {...meta} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

