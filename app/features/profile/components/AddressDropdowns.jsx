import React, { useEffect, useState } from "react";
import { WilayahAgent } from "~/agents/wilayahAgent";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import * as Icons from "lucide-react";

export default function AddressDropdowns() {
  // Local state for the agent (simulating Antigravity store binding)
  const [state, setState] = useState(WilayahAgent.initialState);
  const actions = WilayahAgent.useActions(state, (update) => {
    setState(prev => ({ ...prev, ...(typeof update === 'function' ? update(prev) : update) }));
  });

  useEffect(() => {
    actions.fetchProvinsi();
  }, []);

  return (
    <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Provinsi */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400">Provinsi</label>
          <select 
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            onChange={(e) => actions.fetchKota(e.target.value)}
            value={state.selectedCodes.province}
          >
            <option value="">Pilih Provinsi</option>
            {state.provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Kota / Kabupaten */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400">Kota / Kabupaten</label>
          <select 
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
            disabled={!state.selectedCodes.province || state.isLoading}
            onChange={(e) => actions.fetchKecamatan(e.target.value)}
            value={state.selectedCodes.regency}
          >
            <option value="">Pilih Kota/Kabupaten</option>
            {state.regencies.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Kecamatan */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400">Kecamatan</label>
          <select 
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
            disabled={!state.selectedCodes.regency || state.isLoading}
            onChange={(e) => actions.fetchDesa(e.target.value)}
            value={state.selectedCodes.district}
          >
            <option value="">Pilih Kecamatan</option>
            {state.districts.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Desa / Kelurahan */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400">Desa / Kelurahan</label>
          <select 
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
            disabled={!state.selectedCodes.district || state.isLoading}
            onChange={(e) => actions.setSelectedVillage(e.target.value)}
            value={state.selectedCodes.village}
          >
            <option value="">Pilih Desa/Kelurahan</option>
            {state.villages.map((v) => (
              <option key={v.code} value={v.code}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Detail Alamat */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-slate-400">Detail Alamat (Jalan, No. Rumah, Patokan)</label>
        <textarea 
          className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-none"
          placeholder="Contoh: Jl. Mangga No. 12, Samping Masjid Al-Ikhlas"
        ></textarea>
      </div>

      {state.isLoading && (
        <div className="flex items-center gap-2 text-xs text-primary font-bold animate-pulse">
          <Icons.Loader2 className="h-3 w-3 animate-spin" />
          Memuat data wilayah...
        </div>
      )}

      {state.error && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-medium">
          {state.error}
        </div>
      )}
    </div>
  );
}
