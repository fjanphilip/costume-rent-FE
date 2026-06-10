import { useState, useEffect, lazy, Suspense } from "react";

// Lazy load the real map component outside to prevent recreation on every render
const MapInner = lazy(() => import("./MapPickerInner"));

// This component acts as a wrapper that only renders the Map on the client
export default function MapPicker(props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-[300px] bg-slate-100 rounded-2xl animate-pulse flex flex-col items-center justify-center font-bold text-slate-400 gap-2 border-2 border-dashed border-slate-200">
        <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-400 animate-spin" />
        <span className="text-[10px] uppercase tracking-widest">Inisialisasi Map...</span>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="h-[300px] bg-slate-50 rounded-2xl animate-pulse" />}>
      <MapInner {...props} />
    </Suspense>
  );
}
