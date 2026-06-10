import { useState, useEffect } from "react";
import { Form, useNavigation, Link, useSubmit } from "@remix-run/react";
import * as Icons from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { WilayahAgent } from "~/agents/wilayahAgent";
import MapPicker from "~/components/MapPicker";
import { getApiClient } from "~/lib/api";

export function AddressForm({ initialData, token, intent }) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [postalCode, setPostalCode] = useState(initialData?.postal_code || "");

  // Wilayah Agent Integration
  const [wilayahState, setWilayahState] = useState(WilayahAgent.initialState);
  const wilayahActions = WilayahAgent.useActions(wilayahState, (update) => {
    setWilayahState(prev => ({ ...prev, ...(typeof update === 'function' ? update(prev) : update) }));
  });

  useEffect(() => {
    if (wilayahState.provinces.length === 0) {
      wilayahActions.fetchProvinsi();
    }
  }, []);

  // Pre-fill if editing
  useEffect(() => {
    if (initialData) {
      wilayahActions.setRegionData({
        selectedCodes: {
          province: initialData.province_code || "",
          regency: initialData.city_code || "",
          district: initialData.district_code || "",
          village: initialData.village_code || ""
        },
        selectedNames: {
          province: initialData.province_name || "",
          regency: initialData.city_name || "",
          district: initialData.district_name || "",
          village: initialData.village_name || ""
        },
        latitude: initialData.latitude || null,
        longitude: initialData.longitude || null
      });

      // Fetch lists for editing
      if (initialData.province_code) {
        const client = getApiClient(token);
        const fetchWilayah = async () => {
          try {
            const promises = [client.get(`/wilayah/regencies/${initialData.province_code}`)];
            if (initialData.city_code) promises.push(client.get(`/wilayah/districts/${initialData.city_code}`));
            if (initialData.district_code) promises.push(client.get(`/wilayah/villages/${initialData.district_code}`));

            const results = await Promise.all(promises);
            wilayahActions.setRegionData({
              regencies: results[0]?.data?.data || [],
              districts: results[1]?.data?.data || [],
              villages: results[2]?.data?.data || []
            });
          } catch (e) { console.error("Fetch wilayah failed:", e); }
        };
        fetchWilayah();
      }
    }
  }, [initialData]);



  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung geolokasi.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        wilayahActions.setCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Gagal mengambil lokasi. Pastikan izin lokasi aktif.");
      }
    );
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    
    // Check if map coordinates are set
    if (!wilayahState.latitude || !wilayahState.longitude) {
      alert("Harap tentukan titik lokasi pada peta sebelum menyimpan alamat.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    setFormValues(values);
    setIsConfirmOpen(true);
  };

  const actualSubmit = () => {
    setIsConfirmOpen(false);
    const form = document.getElementById("address-form");
    if (form) {
      submit(form);
    }
  };

  return (
    <Form id="address-form" method="post" onSubmit={handlePreSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <input type="hidden" name="intent" value={intent} />
      {initialData?.id && <input type="hidden" name="address_id" value={initialData.id} />}
      
      {/* Hidden Region Details */}
      <input type="hidden" name="province_name" value={wilayahState.selectedNames.province} />
      <input type="hidden" name="city_name" value={wilayahState.selectedNames.regency} />
      <input type="hidden" name="district_name" value={wilayahState.selectedNames.district} />
      <input type="hidden" name="village_name" value={wilayahState.selectedNames.village} />
      <input type="hidden" name="province_code" value={wilayahState.selectedCodes.province} />
      <input type="hidden" name="city_code" value={wilayahState.selectedCodes.regency} />
      <input type="hidden" name="district_code" value={wilayahState.selectedCodes.district} />
      <input type="hidden" name="village_code" value={wilayahState.selectedCodes.village} />
      <input type="hidden" name="biteship_area_id" value={wilayahState.biteshipAreaId} />
      <input type="hidden" name="latitude" value={wilayahState.latitude || ""} />
      <input type="hidden" name="longitude" value={wilayahState.longitude || ""} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side: Basic Info & Regions */}
        <div className="space-y-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
             <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <Icons.Info className="h-5 w-5" />
             </div>
             <h3 className="font-black italic uppercase tracking-tight text-slate-900 text-lg">Informasi Dasar</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Label Alamat</label>
              <input name="label" defaultValue={initialData?.label || ""} required placeholder="Contoh: Rumah, Kantor, Kos" className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold focus:ring-2 focus:ring-slate-900 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nama Penerima</label>
              <input name="receiver_name" defaultValue={initialData?.receiver_name || ""} required minLength={3} className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nomor HP</label>
              <input name="phone_number" defaultValue={initialData?.phone_number || ""} required type="tel" pattern="[0-9]*" minLength={10} maxLength={15} onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Provinsi</label>
              <select className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm" onChange={(e) => wilayahActions.fetchKota(e.target.value)} value={wilayahState.selectedCodes.province} required>
                <option value="">Pilih Provinsi</option>
                {wilayahState.provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kota / Kabupaten</label>
              <select className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm disabled:opacity-50" disabled={!wilayahState.selectedCodes.province || wilayahState.isLoading} onChange={(e) => wilayahActions.fetchKecamatan(e.target.value)} value={wilayahState.selectedCodes.regency} required>
                <option value="">Pilih Kota</option>
                {wilayahState.regencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kecamatan</label>
              <select className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm disabled:opacity-50" disabled={!wilayahState.selectedCodes.regency || wilayahState.isLoading} onChange={(e) => wilayahActions.fetchDesa(e.target.value)} value={wilayahState.selectedCodes.district} required>
                <option value="">Pilih Kecamatan</option>
                {wilayahState.districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Desa / Kelurahan</label>
              <select className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm disabled:opacity-50" disabled={!wilayahState.selectedCodes.district || wilayahState.isLoading} onChange={(e) => wilayahActions.setSelectedVillage(e.target.value)} value={wilayahState.selectedCodes.village} required>
                <option value="">Pilih Desa</option>
                {wilayahState.villages.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kode Pos</label>
              <input name="postal_code" value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ''))} required pattern="[0-9]*" maxLength={5} minLength={5} className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Detail Alamat</label>
              <textarea name="detail_address" defaultValue={initialData?.detail_address || ""} required minLength={10} className="w-full min-h-[100px] p-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold resize-none" placeholder="Contoh: Jl. Mangga No. 12, Samping Masjid" />
            </div>
          </div>
        </div>

        {/* Right Side: Map & Biteship */}
        <div className="space-y-8 flex flex-col h-full">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icons.MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="font-black italic uppercase tracking-tight text-slate-900 text-lg">Lokasi Map</h3>
               </div>
               <Button type="button" onClick={handleGetLocation} variant="outline" className="rounded-xl h-10 px-4 bg-primary/5 border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10">
                  <Icons.Locate className="h-3 w-3 mr-2" /> GPS
               </Button>
            </div>

            <div className="space-y-4">
              <MapPicker 
                lat={wilayahState.latitude} 
                lng={wilayahState.longitude} 
                onChange={(lat, lng) => wilayahActions.setCoords(lat, lng)} 
              />
              <p className="text-[10px] font-bold text-slate-400 italic text-center px-10">
                Geser marker atau klik pada peta untuk menentukan titik koordinat yang tepat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Koordinat</span>
                <div className="flex items-center gap-2 truncate">
                  <Icons.Navigation className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-800 truncate">
                    {wilayahState.latitude ? `${wilayahState.latitude.toString().slice(0, 8)}, ${wilayahState.longitude.toString().slice(0, 8)}` : "Belum diatur"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <input type="checkbox" name="is_primary" id="is_primary" defaultChecked={initialData?.is_primary || false} className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary" />
              <label htmlFor="is_primary" className="text-sm font-bold text-slate-300">Jadikan Alamat Utama</label>
            </div>

            <div className="flex gap-4">
              <Link to="/dashboard/settings?tab=address" className="flex-1">
                <Button type="button" variant="outline" className="w-full h-16 rounded-2xl bg-transparent border-slate-700 text-slate-400 font-black uppercase tracking-widest hover:bg-slate-800">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="flex-[2] h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                {isSubmitting ? "Menyimpan..." : "Simpan Alamat"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 sm:p-10 space-y-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-20 w-20 rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                <Icons.CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Konfirmasi Alamat</h3>
                <p className="text-sm font-medium text-slate-400 italic">Apakah Anda sudah yakin dengan detail alamat ini?</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
               <div className="flex justify-between items-start border-b border-slate-200/50 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Penerima</span>
                    <p className="text-xs font-black text-slate-800">{formValues.receiver_name}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold border-slate-200 bg-white">{formValues.label}</Badge>
               </div>
               
               <div className="space-y-1 border-b border-slate-200/50 pb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Wilayah</span>
                  <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                    {formValues.village_name}, {formValues.district_name}, {formValues.city_name}, {formValues.province_name} {formValues.postal_code}
                  </p>
               </div>

               <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Titik Koordinat</span>
                  <div className="flex items-center gap-2">
                    <Icons.Navigation className="h-3 w-3 text-emerald-500" />
                    <p className="text-[10px] font-bold text-slate-600">
                      {wilayahState.latitude ? `${wilayahState.latitude.toString().slice(0, 10)}, ${wilayahState.longitude.toString().slice(0, 10)}` : "Belum diatur"}
                    </p>
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)} className="flex-1 h-14 rounded-2xl text-slate-500 font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50">
                Cek Lagi
              </Button>
              <Button type="button" onClick={actualSubmit} className="flex-[1.5] h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-lg shadow-slate-900/20">
                Ya, Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
