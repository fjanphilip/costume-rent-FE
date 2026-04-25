import { useState, useEffect } from "react";
import { useSearchParams } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Button } from "~/components/ui/button";

export function FilterSidebar({ options }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for price to make it feel instant (SSR will happen on mouseUp)
  const currentMaxPriceUrl = searchParams.get("max_price") || options?.price_range?.max || 0;
  const [localMaxPrice, setLocalMaxPrice] = useState(currentMaxPriceUrl);

  // Sync local state if URL changes externally (e.g. Reset)
  useEffect(() => {
    setLocalMaxPrice(currentMaxPriceUrl);
  }, [currentMaxPriceUrl]);

  if (!options) return <div className="w-64 animate-pulse bg-gray-100 rounded-2xl h-96"></div>;

  const currentCategory = searchParams.get("category");
  const currentSize = searchParams.get("size");

  const updateUrl = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    setSearchParams(params, { preventScrollReset: true });
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
    setLocalMaxPrice(options.price_range.max);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Categories - Checkbox Style */}
      <div className="space-y-5">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Icons.Layers className="h-3 w-3 text-primary" /> Categories
        </h3>
        <div className="flex flex-col gap-1.5">
          <div
            onClick={() => updateUrl("category", null)}
            className={`flex items-center gap-3 cursor-pointer group p-2 rounded-xl transition-all ${!currentCategory ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
          >
            <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${!currentCategory ? 'bg-primary border-primary' : 'border-slate-200 group-hover:border-primary/50'}`}>
              {!currentCategory && <Icons.Check className="h-3 w-3 text-white stroke-[4]" />}
            </div>
            <span className={`text-sm font-bold transition-colors ${!currentCategory ? 'text-primary' : 'text-slate-600'}`}>All Categories</span>
          </div>

          {options.categories.map(cat => (
            <div
              key={cat}
              onClick={() => updateUrl("category", cat)}
              className={`flex items-center gap-3 cursor-pointer group p-2 rounded-xl transition-all ${currentCategory === cat ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
            >
              <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${currentCategory === cat ? 'bg-primary border-primary' : 'border-slate-200 group-hover:border-primary/50'}`}>
                {currentCategory === cat && <Icons.Check className="h-3 w-3 text-white stroke-[4]" />}
              </div>
              <span className={`text-sm font-bold transition-colors ${currentCategory === cat ? 'text-primary' : 'text-slate-600'}`}>{cat}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Size - Toggle Group Style */}
      <div className="space-y-5">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Icons.Maximize className="h-3 w-3 text-primary" /> Size
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {options.sizes.map(size => (
            <button
              key={size}
              onClick={() => updateUrl("size", size === currentSize ? null : size)}
              className={`h-10 rounded-xl border-2 font-bold text-xs transition-all ${currentSize === size ? 'border-primary bg-primary text-white shadow-lg shadow-primary/10' : 'border-slate-100 text-slate-500 hover:border-primary/30'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-5">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Icons.Banknote className="h-3 w-3 text-primary" /> Price Range
        </h3>
        <div className="space-y-5">
          <input
            type="range"
            min={options.price_range.min}
            max={options.price_range.max}
            step={10000}
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            onMouseUp={() => updateUrl("max_price", localMaxPrice)}
            onTouchEnd={() => updateUrl("max_price", localMaxPrice)}
            className="w-full accent-primary h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-muted-foreground/60 leading-none">Max Budget:</span>
              {/* <span className="text-[10px] font-black text-rose-500 uppercase">SSR Update</span> */}
            </div>
            <span className="text-lg font-black text-primary italic leading-none">Rp {Number(localMaxPrice).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleReset}
        variant="outline"
        className="w-full h-12 rounded-2xl font-black border-2 border-slate-200 hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 transition-all gap-2 mt-4"
      >
        <Icons.RotateCcw className="h-4 w-4" /> Reset Filters
      </Button>
    </div>
  );
}



