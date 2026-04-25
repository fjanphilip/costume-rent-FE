import { useSearchParams } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Button } from "~/components/ui/button";

export function Pagination({ current_page, last_page, total }) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (last_page <= 1) return null;

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-12 border-t mt-12">
      <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
         Showing Page <span className="text-primary">{current_page}</span> of <span className="text-primary">{last_page}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          disabled={current_page === 1}
          onClick={() => handlePageChange(current_page - 1)}
          className="rounded-xl border-2 font-bold h-11 px-4 gap-2 disabled:opacity-30"
        >
          {Icons.ChevronLeft && <Icons.ChevronLeft className="h-4 w-4" />} Previous
        </Button>

        <div className="flex gap-2">
           {[...Array(last_page)].map((_, i) => {
             const page = i + 1;
             // Show only current, first, last and 1 neighboring page to keep it clean
             if (
               page === 1 || 
               page === last_page || 
               (page >= current_page - 1 && page <= current_page + 1)
             ) {
               return (
                 <Button
                    key={page}
                    variant={current_page === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={`h-11 w-11 rounded-xl border-2 font-bold transition-all ${
                      current_page === page ? "shadow-lg shadow-primary/20" : ""
                    }`}
                 >
                    {page}
                 </Button>
               );
             } else if (
               page === current_page - 2 || 
               page === current_page + 2
             ) {
               return <span key={page} className="flex items-center px-1 text-muted-foreground">...</span>;
             }
             return null;
           })}
        </div>

        <Button 
          variant="outline" 
          disabled={current_page === last_page}
          onClick={() => handlePageChange(current_page + 1)}
          className="rounded-xl border-2 font-bold h-11 px-4 gap-2 disabled:opacity-30"
        >
          Next {Icons.ChevronRight && <Icons.ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
