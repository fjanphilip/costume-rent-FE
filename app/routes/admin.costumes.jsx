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
import { useState, useEffect, useRef } from "react";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");

  if (!user || !token || user.role !== 'admin') {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;

  try {
    const response = await getApiClient(token).get(`/costumes?page=${page}`);
    return json({ 
      costumes: response.data.data || [],
      pagination: response.data.meta || {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total
      }
    });
  } catch (error) {
    console.error("Admin Costumes Loader Error:", error);
    return json({ costumes: [], pagination: null });
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
    if (intent === "add_costume") {
      const response = await client.post("/costumes", formData);
      return json({ status: "success", message: "Kostum berhasil ditambah!" });
    }

    if (intent === "edit_costume") {
      // Laravel often requires POST with _method=PUT for multipart updates
      formData.append("_method", "PUT");
      const response = await client.post(`/costumes/${id}`, formData);
      return json({ status: "success", message: "Kostum berhasil diperbarui!" });
    }

    if (intent === "delete_costume") {
      await client.delete(`/costumes/${id}`);
      return json({ status: "success", message: "Kostum berhasil dihapus!" });
    }
  } catch (error) {
    console.error("Admin Costume Action Error:", error);
    const result = error.response?.data || {};
    return json({ status: "error", message: result.message || "Terjadi kesalahan pada server." }, { status: error.response?.status || 500 });
  }

  return null;
};

export default function AdminCostumesPage() {
  const { costumes, pagination } = useLoaderData();
  const fetcher = useFetcher();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.status === 'success') {
      setIsDialogOpen(false);
      setEditingCostume(null);
      setPreviewImages([]);
      setFormData({ name: '', slug: '' });
    }
  }, [fetcher.state, fetcher.data]);

  const handleOpenAdd = () => {
    setEditingCostume(null);
    setPreviewImages([]);
    setFormData({ name: '', slug: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (costume) => {
    setEditingCostume(costume);
    setFormData({ name: costume.name, slug: costume.slug });
    if (costume.images) {
      setPreviewImages(costume.images.map(img => `http://127.0.0.1:8000/storage/${img.image_path}`));
    } else {
      setPreviewImages([]);
    }
    setIsDialogOpen(true);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus kostum ini?")) {
      fetcher.submit({ intent: "delete_costume", id }, { method: "post" });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(urls);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-10 space-y-10 max-w-7xl text-left">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Katalog Kostum</h1>
              <p className="text-slate-500">Kelola koleksi kostum, stok, dan harga penyewaan.</p>
            </div>
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-slate-900/10"
              onClick={handleOpenAdd}
            >
              <Icons.Plus className="h-4 w-4 mr-2" /> Tambah Kostum
            </Button>
          </div>

          <Card className="border border-slate-200 shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kostum</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Detail</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Harga & Deposit</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {costumes.map((costume) => (
                    <tr key={costume.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                            <img
                              src={costume.images?.[0] ? `http://127.0.0.1:8000/storage/${costume.images[0].image_path}` : "https://via.placeholder.com/100"}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{costume.name}</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Size {costume.size}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{costume.series}</span>
                          <span className="text-[10px] font-medium text-slate-400">{costume.brand}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">Rp {Number(costume.rental_price).toLocaleString('id-ID')}</span>
                          <span className="text-[10px] font-medium text-slate-400">Dep: Rp {Number(costume.required_deposit).toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          costume.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          costume.status === 'rented' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {costume.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-slate-100"
                            onClick={() => handleOpenEdit(costume)}
                          >
                            <Icons.Edit2 className="h-3.5 w-3.5 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => handleDelete(costume.id)}
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

            {/* Pagination Controls */}
            {pagination && pagination.last_page > 1 && (
              <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="text-xs font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-900">{pagination.from || 1}</span> to <span className="font-bold text-slate-900">{pagination.to || costumes.length}</span> of <span className="font-bold text-slate-900">{pagination.total}</span> costumes
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-slate-200 text-slate-600 font-bold disabled:opacity-50"
                    disabled={pagination.current_page === 1}
                    asChild={pagination.current_page !== 1}
                  >
                    {pagination.current_page === 1 ? (
                      <span>Previous</span>
                    ) : (
                      <Link to={`?page=${pagination.current_page - 1}`}>Previous</Link>
                    )}
                  </Button>

                  <div className="flex items-center gap-1">
                    {[...Array(pagination.last_page)].map((_, i) => {
                      const pageNum = i + 1;
                      // Simple logic to show current, first, last, and around current
                      if (
                        pageNum === 1 || 
                        pageNum === pagination.last_page || 
                        (pageNum >= pagination.current_page - 1 && pageNum <= pagination.current_page + 1)
                      ) {
                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.current_page === pageNum ? "default" : "outline"}
                            size="sm"
                            className={`h-9 w-9 rounded-xl font-bold ${
                              pagination.current_page === pageNum 
                              ? 'bg-slate-900 text-white' 
                              : 'border-slate-200 text-slate-600'
                            }`}
                            asChild={pagination.current_page !== pageNum}
                          >
                            {pagination.current_page === pageNum ? (
                              <span>{pageNum}</span>
                            ) : (
                              <Link to={`?page=${pageNum}`}>{pageNum}</Link>
                            )}
                          </Button>
                        );
                      } else if (
                        pageNum === 2 || pageNum === pagination.last_page - 1
                      ) {
                        return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-slate-200 text-slate-600 font-bold disabled:opacity-50"
                    disabled={pagination.current_page === pagination.last_page}
                    asChild={pagination.current_page !== pagination.last_page}
                  >
                    {pagination.current_page === pagination.last_page ? (
                      <span>Next</span>
                    ) : (
                      <Link to={`?page=${pagination.current_page + 1}`}>Next</Link>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
            <fetcher.Form method="post" encType="multipart/form-data" className="flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 bg-white">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {editingCostume ? "Edit Kostum" : "Tambah Kostum Baru"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1">
                  Isi data lengkap kostum di bawah ini.
                </DialogDescription>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <input type="hidden" name="intent" value={editingCostume ? "edit_costume" : "add_costume"} />
                {editingCostume && <input type="hidden" name="id" value={editingCostume.id} />}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Nama Kostum</label>
                    <Input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleNameChange}
                      required 
                      placeholder="Contoh: Raiden Shogun" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Slug</label>
                    <Input 
                      name="slug" 
                      value={formData.slug} 
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      required 
                      placeholder="raiden-shogun-d3" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Brand / Maker</label>
                    <Input name="brand" defaultValue={editingCostume?.brand} required placeholder="Contoh: Delusion3" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Series / Anime</label>
                    <Input name="series" defaultValue={editingCostume?.series} required placeholder="Contoh: Genshin Impact" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Ukuran</label>
                    <Input name="size" defaultValue={editingCostume?.size} required placeholder="S / M / L / XL" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Harga Sewa</label>
                    <Input name="rental_price" type="number" defaultValue={editingCostume?.rental_price} required placeholder="150000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Jaminan (Deposit)</label>
                    <Input name="required_deposit" type="number" defaultValue={editingCostume?.required_deposit} required placeholder="100000" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingCostume?.status || "available"}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Deskripsi Kostum</label>
                  <textarea
                    name="description"
                    defaultValue={editingCostume?.description}
                    required
                    rows={4}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Jelaskan rincian kostum, aksesoris yang didapat, dll."
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Gambar Kostum</label>
                  <div 
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:bg-slate-50 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icons.UploadCloud className="h-8 w-8 text-slate-400" />
                    <p className="text-xs text-slate-500 font-medium">Klik untuk upload gambar kostum</p>
                    <input 
                      type="file" 
                      name="images" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </div>
                  {previewImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-2">
                      {previewImages.map((src, i) => (
                        <div key={i} className="h-20 w-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={src} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                    </div>
                  )}
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
                  {fetcher.state !== 'idle' ? "Menyimpan..." : (editingCostume ? "Simpan Perubahan" : "Tambah Kostum")}
                </Button>
              </div>
            </fetcher.Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
