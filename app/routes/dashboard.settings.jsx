import { useState, useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useSubmit, useSearchParams } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import * as Icons from "lucide-react";
import { getApiClient } from "~/lib/api";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { WilayahAgent } from "~/agents/wilayahAgent";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  if (!token) return redirect("/login");

  try {
    const client = getApiClient(token);
    // Fetch User & Addresses
    const [userRes, addrRes] = await Promise.all([
      client.get("/user"),
      client.get("/user/addresses")
    ]);

    const userJson = userRes.data;
    const addresses = addrRes.data;

    return json({ user: userJson.user || userJson.data || userJson, addresses, token });
  } catch (error) {
    console.error("Settings Loader Error:", error);
    return redirect("/login");
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();
  const intent = formData.get("intent");

  const client = getApiClient(token);

  try {
    if (intent === "update_personal") {
      const name = formData.get("name");
      const phone_number = formData.get("phone_number");

      await client.put("/user/profile", { name, phone_number });
      return json({ success: "Informasi pribadi berhasil diperbarui." });
    }

    if (intent === "update_bank") {
      const bank_name = formData.get("bank_name");
      const bank_account_number = formData.get("bank_account_number");
      const bank_account_name = formData.get("bank_account_name");

      await client.put("/user/profile", { bank_name, bank_account_number, bank_account_name });
      return json({ success: "Informasi rekening bank berhasil diperbarui." });
    }

    if (intent === "update_security") {
      const password = formData.get("password");
      const password_confirmation = formData.get("password_confirmation");

      await client.put("/user/profile", { password, password_confirmation });
      return json({ success: "Password berhasil diperbarui." });
    }

    if (intent === "add_address") {
      const data = {
        label: formData.get("label"),
        receiver_name: formData.get("receiver_name"),
        phone_number: formData.get("phone_number"),
        province_code: formData.get("province_code"),
        province_name: formData.get("province_name"),
        city_code: formData.get("city_code"),
        city_name: formData.get("city_name"),
        district_code: formData.get("district_code"),
        district_name: formData.get("district_name"),
        village_code: formData.get("village_code"),
        village_name: formData.get("village_name"),
        postal_code: formData.get("postal_code"),
        detail_address: formData.get("detail_address"),
        is_primary: formData.get("is_primary") === "on"
      };

      await client.post("/user/addresses", data);
      return json({ success: "Alamat berhasil ditambahkan." });
    }

    if (intent === "edit_address") {
      const id = formData.get("address_id");
      const data = {
        label: formData.get("label"),
        receiver_name: formData.get("receiver_name"),
        phone_number: formData.get("phone_number"),
        province_code: formData.get("province_code"),
        province_name: formData.get("province_name"),
        city_code: formData.get("city_code"),
        city_name: formData.get("city_name"),
        district_code: formData.get("district_code"),
        district_name: formData.get("district_name"),
        village_code: formData.get("village_code"),
        village_name: formData.get("village_name"),
        postal_code: formData.get("postal_code"),
        detail_address: formData.get("detail_address"),
        is_primary: formData.get("is_primary") === "on"
      };

      await client.put(`/user/addresses/${id}`, data);
      return json({ success: "Alamat berhasil diperbarui." });
    }

    if (intent === "set_primary") {
      const id = formData.get("address_id");
      await client.patch(`/user/addresses/${id}/primary`);
      return json({ success: "Alamat utama diubah." });
    }

    if (intent === "delete_address") {
      const id = formData.get("address_id");
      await client.delete(`/user/addresses/${id}`);
      return json({ success: "Alamat dihapus." });
    }
  } catch (error) {
    console.error("Settings Action Error:", error);
    const result = error.response?.data || {};
    return json({ error: result.message || "Gagal memperbarui data." }, { status: error.response?.status || 500 });
  }

  return null;
};



export default function SettingsPage() {
  const { user, addresses, token } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "personal");
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const submit = useSubmit();

  // Wilayah Agent Integration
  const [wilayahState, setWilayahState] = useState(WilayahAgent.initialState);
  const wilayahActions = WilayahAgent.useActions(wilayahState, (update) => {
    setWilayahState(prev => ({ ...prev, ...(typeof update === 'function' ? update(prev) : update) }));
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
    if (tabId === "address" && wilayahState.provinces.length === 0) {
      wilayahActions.fetchProvinsi();
    }
  };

  useEffect(() => {
    if (activeTab === "address" && wilayahState.provinces.length === 0) {
      wilayahActions.fetchProvinsi();
    }
  }, [activeTab]);

  const openEditModal = async (addr) => {
    setEditingAddress(addr);
    
    // Pre-fill wilayah store for editing
    wilayahActions.setRegionData({
      selectedCodes: {
        province: addr.province_code || "",
        regency: addr.city_code || "",
        district: addr.district_code || "",
        village: addr.village_code || ""
      },
      selectedNames: {
        province: addr.province_name || "",
        regency: addr.city_name || "",
        district: addr.district_name || "",
        village: addr.village_name || ""
      }
    });
    
    // We only fetch lists if we have the parent codes
    if (addr.province_code) {
      const client = getApiClient(token);
      try {
        const promises = [client.get(`/wilayah/regencies/${addr.province_code}`)];
        if (addr.city_code) promises.push(client.get(`/wilayah/districts/${addr.city_code}`));
        if (addr.district_code) promises.push(client.get(`/wilayah/villages/${addr.district_code}`));

        const results = await Promise.all(promises);
        
        wilayahActions.setRegionData({
          regencies: results[0]?.data?.data || [],
          districts: results[1]?.data?.data || [],
          villages: results[2]?.data?.data || []
        });
      } catch (e) { console.error("Fetch wilayah failed:", e); }
    }
    
    setIsAddAddressOpen(true);
  };

  // Security Validation States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordMatch = password === confirmPassword;

  useEffect(() => {
    if (actionData?.success) {
      setIsAddAddressOpen(false);
      setEditingAddress(null);
      setPassword("");
      setConfirmPassword("");
    }
  }, [actionData]);

  const closeAddressModal = (isOpen) => {
    setIsAddAddressOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setEditingAddress(null), 200);
    }
  };

  const TABS = [
    { id: "personal", label: "Profil Pribadi", icon: Icons.User, description: "Informasi dasar Anda" },
    { id: "bank", label: "Rekening Bank", icon: Icons.CreditCard, description: "Untuk pengembalian deposit" },
    { id: "security", label: "Keamanan", icon: Icons.Lock, description: "Ubah kata sandi" },
    { id: "address", label: "Alamat Pengiriman", icon: Icons.MapPin, description: "Kelola lokasi Anda" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Pengaturan Akun</h1>
        <p className="text-sm font-medium text-slate-400 italic">Kelola profil, keamanan, dan alamat Anda dengan mudah.</p>
      </div>

      {actionData?.error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-2">
          <Icons.AlertCircle className="h-4 w-4" />
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
          <Icons.CheckCircle2 className="h-4 w-4" />
          {actionData.success}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-72 flex-shrink-0 space-y-2 sticky top-24">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl transition-all text-left ${isActive
                    ? "bg-white border-2 border-primary shadow-lg shadow-primary/5"
                    : "bg-transparent border-2 border-transparent hover:bg-white hover:border-slate-100 text-slate-500"
                  }`}
              >
                <div className={`mt-0.5 p-2 rounded-xl ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`font-black italic uppercase tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{tab.label}</h4>
                  <p className="text-[10px] font-bold text-slate-400">{tab.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[500px]">

          {/* TAB: PERSONAL INFO */}
          {activeTab === "personal" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                  <Icons.User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black italic uppercase tracking-tight text-slate-900 text-xl">Profil Pribadi</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                </div>
              </div>

              <Form method="post" className="space-y-6 max-w-xl">
                <input type="hidden" name="intent" value="update_personal" />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={user?.name || ""}
                    required
                    minLength={3}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    name="phone_number"
                    defaultValue={user?.phone_number || ""}
                    required
                    pattern="[0-9]*"
                    minLength={10}
                    maxLength={15}
                    placeholder="Contoh: 08123456789"
                    onInvalid={(e) => e.target.setCustomValidity("Harap masukkan nomor HP yang valid (hanya angka, 10-15 digit)")}
                    onInput={(e) => { e.target.setCustomValidity(""); e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs mt-4"
                >
                  {navigation.state === "submitting" ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </Form>
            </div>
          )}

          {/* TAB: BANK INFO */}
          {activeTab === "bank" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100/50">
                  <Icons.CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black italic uppercase tracking-tight text-slate-900 text-xl">Rekening Refund</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digunakan jika ada pengembalian deposit</p>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-sm font-semibold text-blue-800 flex gap-3 max-w-xl">
                <Icons.Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p>Pastikan nama pemilik rekening sesuai dengan identitas asli untuk mempermudah verifikasi transfer deposit.</p>
              </div>

              <Form method="post" className="space-y-6 max-w-xl">
                <input type="hidden" name="intent" value="update_bank" />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nama Bank</label>
                  <input
                    type="text"
                    name="bank_name"
                    defaultValue={user?.bank_name || ""}
                    placeholder="Contoh: BCA, Mandiri, BRI"
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nomor Rekening</label>
                  <input
                    type="text"
                    name="bank_account_number"
                    defaultValue={user?.bank_account_number || ""}
                    placeholder="Contoh: 1234567890"
                    pattern="[0-9]*"
                    onInvalid={(e) => e.target.setCustomValidity("Hanya boleh berisi angka")}
                    onInput={(e) => { e.target.setCustomValidity(""); e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    name="bank_account_name"
                    defaultValue={user?.bank_account_name || ""}
                    placeholder="Sesuai nama di buku tabungan"
                    pattern="[a-zA-Z\s]*"
                    onInvalid={(e) => e.target.setCustomValidity("Hanya boleh berisi huruf")}
                    onInput={(e) => { e.target.setCustomValidity(""); e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); }}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-800"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs mt-4 shadow-lg shadow-blue-600/20"
                >
                  {navigation.state === "submitting" ? "Menyimpan..." : "Simpan Rekening"}
                </Button>
              </Form>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-lg shadow-rose-100/50">
                  <Icons.Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black italic uppercase tracking-tight text-slate-900 text-xl">Keamanan</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ubah password Anda untuk menjaga keamanan akun</p>
                </div>
              </div>

              <Form method="post" className="space-y-6 max-w-xl">
                <input type="hidden" name="intent" value="update_security" />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password Baru</label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-4 mr-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Konfirmasi Password</label>
                    {confirmPassword.length > 0 && (
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${passwordMatch ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {passwordMatch ? 'Cocok' : 'Tidak Cocok'}
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Ketik ulang password baru"
                    className={`w-full h-14 px-6 rounded-2xl bg-slate-50 border transition-all font-bold text-slate-800 focus:bg-white focus:ring-2
                      ${confirmPassword.length > 0 ? (passwordMatch ? 'border-emerald-200 focus:ring-emerald-500' : 'border-rose-300 focus:ring-rose-500') : 'border-slate-100 focus:ring-rose-500'}`}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={navigation.state === "submitting" || !passwordMatch || password.length < 8}
                  className={`w-full h-14 rounded-2xl text-white font-black uppercase tracking-widest text-xs mt-4 transition-all ${passwordMatch && password.length >= 8
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20'
                      : 'bg-slate-300 cursor-not-allowed'
                    }`}
                >
                  {navigation.state === "submitting" ? "Menyimpan..." : "Update Password"}
                </Button>
              </Form>
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === "address" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                    <Icons.MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black italic uppercase tracking-tight text-slate-900 text-xl">Alamat Pengiriman</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tujuan pengiriman kostum sewaan</p>
                  </div>
                </div>

                <Dialog open={isAddAddressOpen} onOpenChange={closeAddressModal}>
                  <DialogTrigger asChild>
                    <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] flex gap-2 shadow-lg shadow-primary/20">
                      <Icons.Plus className="h-4 w-4" /> Tambah Alamat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="p-8 sm:p-12 space-y-8">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                          {editingAddress ? "Edit Alamat" : "Alamat Baru"}
                        </h3>
                        <p className="text-sm font-medium text-slate-400 italic">Pastikan informasi alamat lengkap dan benar.</p>
                      </div>

                      <Form method="post" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="hidden" name="intent" value={editingAddress ? "edit_address" : "add_address"} />
                        {editingAddress && <input type="hidden" name="address_id" value={editingAddress.id} />}
                        
                        {/* Hidden Inputs for Region Names (captured in WilayahAgent) */}
                        <input type="hidden" name="province_name" value={wilayahState.selectedNames.province} />
                        <input type="hidden" name="city_name" value={wilayahState.selectedNames.regency} />
                        <input type="hidden" name="district_name" value={wilayahState.selectedNames.district} />
                        <input type="hidden" name="village_name" value={wilayahState.selectedNames.village} />
                        
                        <input type="hidden" name="province_code" value={wilayahState.selectedCodes.province} />
                        <input type="hidden" name="city_code" value={wilayahState.selectedCodes.regency} />
                        <input type="hidden" name="district_code" value={wilayahState.selectedCodes.district} />
                        <input type="hidden" name="village_code" value={wilayahState.selectedCodes.village} />

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Label Alamat</label>
                          <input name="label" defaultValue={editingAddress?.label || ""} required placeholder="Contoh: Rumah, Kantor, Kos" className="w-full h-12 px-5 rounded-xl bg-slate-50 border border-slate-100 font-bold" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nama Penerima</label>
                          <input name="receiver_name" defaultValue={editingAddress?.receiver_name || ""} required minLength={3} className="w-full h-12 px-5 rounded-xl bg-slate-50 border border-slate-100 font-bold" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nomor HP</label>
                          <input
                            name="phone_number"
                            defaultValue={editingAddress?.phone_number || ""}
                            required
                            type="tel"
                            pattern="[0-9]*"
                            minLength={10}
                            maxLength={15}
                            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                            className="w-full h-12 px-5 rounded-xl bg-slate-50 border border-slate-100 font-bold"
                          />
                        </div>

                        {/* Wilayah Chained Dropdowns */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Provinsi</label>
                          <select 
                            className="w-full h-12 px-5 rounded-xl bg-slate-50 border border-slate-100 font-bold text-sm"
                            onChange={(e) => wilayahActions.fetchKota(e.target.value)}
                            value={wilayahState.selectedCodes.province}
                            required
                          >
                            <option value="">Pilih Provinsi</option>
                            {wilayahState.provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kota / Kabupaten</label>
                          <select 
                            className="w-full h-12 px-5 rounded-xl bg-slate-50 border border-slate-100 font-bold text-sm disabled:opacity-50"
                            disabled={!wilayahState.selectedCodes.province || wilayahState.isLoading}
                            onChange={(e) => wilayahActions.fetchKecamatan(e.target.value)}
                            value={wilayahState.selectedCodes.regency}
                            required
                          >
                            <option value="">Pilih Kota</option>
                            {wilayahState.regencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kecamatan</label>
                          <select 
                            className="w-full h-12 px-5 rounded-xl bg-slate-50 border border-slate-100 font-bold text-sm disabled:opacity-50"
                            disabled={!wilayahState.selectedCodes.regency || wilayahState.isLoading}
                            onChange={(e) => wilayahActions.fetchDesa(e.target.value)}
                            value={wilayahState.selectedCodes.district}
                            required
                          >
                            <option value="">Pilih Kecamatan</option>
                            {wilayahState.districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Desa / Kelurahan</label>
                          <select 
                            className="w-full h-12 px-5 rounded-xl bg-slate-50 border border-slate-100 font-bold text-sm disabled:opacity-50"
                            disabled={!wilayahState.selectedCodes.district || wilayahState.isLoading}
                            onChange={(e) => wilayahActions.setSelectedVillage(e.target.value)}
                            value={wilayahState.selectedCodes.village}
                            required
                          >
                            <option value="">Pilih Desa</option>
                            {wilayahState.villages.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kode Pos</label>
                          <input
                            name="postal_code"
                            defaultValue={editingAddress?.postal_code || ""}
                            required
                            pattern="[0-9]*"
                            maxLength={5}
                            minLength={5}
                            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                            className="w-full h-12 px-5 rounded-xl bg-slate-50 border border-slate-100 font-bold"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Detail Alamat (Jalan, No. Rumah, Patokan)</label>
                          <textarea name="detail_address" defaultValue={editingAddress?.detail_address || ""} required minLength={10} className="w-full min-h-[100px] p-5 rounded-xl bg-slate-50 border border-slate-100 font-bold resize-none" placeholder="Contoh: Jl. Mangga No. 12, Samping Masjid" />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                          <input type="checkbox" name="is_primary" id="is_primary" defaultChecked={editingAddress?.is_primary || false} className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" />
                          <label htmlFor="is_primary" className="text-sm font-bold text-slate-700">Jadikan Alamat Utama</label>
                        </div>

                        <div className="md:col-span-2 pt-4 flex gap-4">
                          {editingAddress && (
                            <Button type="button" onClick={() => closeAddressModal(false)} variant="outline" className="flex-1 h-14 rounded-2xl text-slate-600 font-black uppercase tracking-widest border-slate-200">
                              Batal
                            </Button>
                          )}
                          <Button type="submit" className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-lg shadow-slate-900/20">
                            {navigation.state === "submitting" ? "Menyimpan..." : "Simpan Alamat"}
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-6 md:p-8 rounded-[2.5rem] bg-white border-2 transition-all relative group flex flex-col h-full ${addr.is_primary ? 'border-primary shadow-lg shadow-primary/5' : 'border-slate-50 hover:border-slate-100'
                        }`}
                    >
                      {addr.is_primary && (
                        <Badge className="absolute top-6 right-6 bg-primary text-white border-none text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1">
                          UTAMA
                        </Badge>
                      )}

                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3 pr-16">
                          <Icons.Home className={`h-5 w-5 ${addr.is_primary ? 'text-primary' : 'text-slate-300'}`} />
                          <h4 className="font-black italic uppercase text-slate-900 truncate">{addr.label}</h4>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-800">{addr.receiver_name}</p>
                          <p className="text-xs font-bold text-slate-400 italic">{addr.phone_number}</p>
                        </div>

                        <p className="text-xs font-semibold text-slate-500 leading-relaxed italic line-clamp-3">
                          {addr.detail_address}, {addr.village_name}, {addr.district_name}, {addr.city_name}, {addr.province_name} {addr.postal_code}
                        </p>
                      </div>

                      <div className="pt-6 flex flex-wrap items-center gap-2 mt-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(addr)}
                          className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 h-8 px-3"
                        >
                          Edit
                        </Button>
                        {!addr.is_primary && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => submit({ intent: "set_primary", address_id: addr.id }, { method: "post" })}
                              className="text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 h-8 px-3"
                            >
                              Set Utama
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Hapus alamat ini?")) {
                                  submit({ intent: "delete_address", address_id: addr.id }, { method: "post" })
                                }
                              }}
                              className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 h-8 px-3 ml-auto"
                            >
                              Hapus
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 p-16 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <Icons.MapPinOff className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black italic uppercase text-slate-900">Belum Ada Alamat</h4>
                      <p className="text-xs font-bold text-slate-400 italic max-w-xs">Tambahkan alamat pengiriman Anda untuk memudahkan proses penyewaan kostum.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
