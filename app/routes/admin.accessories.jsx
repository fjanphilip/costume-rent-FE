import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Link, useSearchParams } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { getApiClient } from "~/lib/api";
import { AdminSidebar } from "~/features/admin-dashboard/components/AdminSidebar";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import * as Icons from "lucide-react";
import { useState, useEffect } from "react";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");

  if (!user || !token || user.role !== 'admin') {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;
  const search = url.searchParams.get("search") || "";

  try {
    const client = getApiClient(token);
    const [accessoriesRes, costumesRes] = await Promise.all([
      client.get(`/accessories?page=${page}&search=${search}`),
      client.get("/admin/costumes-list")
    ]);

    return json({
      accessories: accessoriesRes.data.data || [],
      costumesList: costumesRes.data || [],
      pagination: {
        current_page: accessoriesRes.data.current_page,
        last_page: accessoriesRes.data.last_page,
        total: accessoriesRes.data.total,
        from: accessoriesRes.data.from,
        to: accessoriesRes.data.to
      }
    });
  } catch (error) {
    console.error("Admin Accessories Loader Error:", error);
    return json({ accessories: [], costumesList: [], pagination: null });
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id");

  const client = getApiClient(token);

  try {
    if (intent === "add_accessory") {
      await client.post("/accessories", formData);
      return json({ status: "success", message: "Aksesoris berhasil ditambah!" });
    }

    if (intent === "edit_accessory") {
      // Laravel requires POST with _method=PUT for multipart updates
      formData.append("_method", "PUT");
      await client.post(`/accessories/${id}`, formData);
      return json({ status: "success", message: "Aksesoris berhasil diperbarui!" });
    }

    if (intent === "delete_accessory") {
      await client.delete(`/accessories/${id}`);
      return json({ status: "success", message: "Aksesoris berhasil dihapus!" });
    }
  } catch (error) {
    console.error("Admin Accessory Action Error:", error);
    const result = error.response?.data || {};
    return json({ status: "error", message: result.message || "Terjadi kesalahan pada server." }, { status: error.response?.status || 500 });
  }

  return null;
};

export default function AdminAccessoriesPage() {
  const { accessories, costumesList, pagination } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.status === 'success') {
      setIsDialogOpen(false);
      setEditingAccessory(null);
      setPreviewImage(null);
    }
  }, [fetcher.state, fetcher.data]);

  const handleOpenAdd = () => {
    setEditingAccessory(null);
    setPreviewImage(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (accessory) => {
    setEditingAccessory(accessory);
    setPreviewImage(accessory.image_path);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus aksesoris ini?")) {
      fetcher.submit({ intent: "delete_accessory", id }, { method: "post" });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchTerm, page: "1" });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto text-left">
        <div className="container mx-auto px-6 py-10 space-y-10 max-w-7xl">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manajemen Aksesoris</h1>
              <p className="text-slate-500">Kelola wig, sepatu, senjata, dan perlengkapan kostum lainnya.</p>
            </div>
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-slate-900/10"
              onClick={handleOpenAdd}
            >
              <Icons.Plus className="h-4 w-4 mr-2" /> Tambah Aksesoris
            </Button>
          </div>

          {fetcher.data?.status === 'error' && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
              <Icons.AlertCircle className="h-5 w-5" />
              {fetcher.data.message}
            </div>
          )}

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari aksesoris atau brand..." 
                className="pl-10 h-11 rounded-xl border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>

          <Card className="border border-slate-200 shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksesoris</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Terkait Kostum</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {accessories.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group text-left">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-left">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            {item.image_path ? (
                              <img src={item.image_path} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Icons.Image className="h-5 w-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-slate-900">{item.name}</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <Badge className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border-none">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-sm font-bold text-slate-900">Rp {Number(item.rental_price).toLocaleString('id-ID')}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={`text-sm font-bold ${item.stock > 0 ? 'text-slate-900' : 'text-rose-500'}`}>
                          {item.stock} set
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex flex-wrap gap-1 max-w-xs text-left">
                          {item.costumes?.map(c => (
                            <Badge key={c.id} variant="outline" className="text-[9px] px-1.5 py-0 border-slate-200 text-slate-500">
                              {c.name}
                            </Badge>
                          ))}
                          {(!item.costumes || item.costumes.length === 0) && (
                            <span className="text-[10px] text-slate-400 italic">Global (Semua)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-slate-100"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Icons.Edit2 className="h-3.5 w-3.5 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Icons.Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="text-xs font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-900">{pagination.from}</span> to <span className="font-bold text-slate-900">{pagination.to}</span> of <span className="font-bold text-slate-900">{pagination.total}</span> accessories
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-slate-200 text-slate-600 font-bold"
                    disabled={pagination.current_page === 1}
                    asChild={pagination.current_page !== 1}
                  >
                    {pagination.current_page === 1 ? (
                      <span>Previous</span>
                    ) : (
                      <Link to={`?page=${pagination.current_page - 1}${searchTerm ? `&search=${searchTerm}` : ""}`}>Previous</Link>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-slate-200 text-slate-600 font-bold"
                    disabled={pagination.current_page === pagination.last_page}
                    asChild={pagination.current_page !== pagination.last_page}
                  >
                    {pagination.current_page === pagination.last_page ? (
                      <span>Next</span>
                    ) : (
                      <Link to={`?page=${pagination.current_page + 1}${searchTerm ? `&search=${searchTerm}` : ""}`}>Next</Link>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl text-left">
            <fetcher.Form method="post" encType="multipart/form-data" className="flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 bg-white">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {editingAccessory ? "Edit Aksesoris" : "Tambah Aksesoris Baru"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1">
                  Isi data lengkap aksesoris dan hubungkan dengan kostum yang sesuai.
                </DialogDescription>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <input type="hidden" name="intent" value={editingAccessory ? "edit_accessory" : "add_accessory"} />
                {editingAccessory && <input type="hidden" name="id" value={editingAccessory.id} />}

                {/* Image Upload Preview */}
                <div className="flex justify-center">
                  <label className="relative group cursor-pointer">
                    <div className="h-32 w-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <Icons.UploadCloud className="h-8 w-8" />
                          <span className="text-[10px] font-bold uppercase">Upload Foto</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      name="image" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                       <Icons.Camera className="h-6 w-6 text-white" />
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Nama Aksesoris</label>
                    <Input name="name" defaultValue={editingAccessory?.name} required placeholder="Contoh: Wig Raiden Shogun" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Brand / Maker</label>
                    <Input name="brand" defaultValue={editingAccessory?.brand} required placeholder="Contoh: Delusion3" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Kategori</label>
                    <select
                      name="category"
                      defaultValue={editingAccessory?.category || "wig"}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="wig">Wig</option>
                      <option value="shoes">Sepatu</option>
                      <option value="weapon">Senjata</option>
                      <option value="prop">Properti / Lainnya</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Harga Sewa</label>
                    <Input name="rental_price" type="number" defaultValue={editingAccessory?.rental_price} required placeholder="25000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Stok</label>
                    <Input name="stock" type="number" defaultValue={editingAccessory?.stock} required placeholder="5" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Hubungkan dengan Kostum (Pilihan)</label>
                  <div className="border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                    {costumesList.map((costume) => (
                      <label key={costume.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="costume_ids[]"
                          value={costume.id}
                          defaultChecked={editingAccessory?.costumes?.some(c => c.id === costume.id)}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{costume.name}</span>
                          <span className="text-[10px] text-slate-400">{costume.series}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    * Kosongkan jika aksesoris ini bisa digunakan untuk semua kostum (Global).
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl font-bold text-slate-500"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-2 bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8 rounded-xl disabled:opacity-50"
                  disabled={fetcher.state !== 'idle'}
                >
                  {fetcher.state !== 'idle' ? "Menyimpan..." : (editingAccessory ? "Simpan Perubahan" : "Tambah Aksesoris")}
                </Button>
              </div>
            </fetcher.Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
