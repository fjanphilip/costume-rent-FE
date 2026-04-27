import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { AdminSidebar } from "~/features/admin-dashboard/components/AdminSidebar";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import * as Icons from "lucide-react";
import { useState } from "react";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");

  if (!user || !token || user.role !== 'admin') {
    return redirect("/login");
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/costumes", {
      headers: { "Accept": "application/json" }
    });
    const result = await response.json();
    return json({ costumes: result.data || [] });
  } catch (error) {
    return json({ costumes: [] });
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add_costume") {
    const name = formData.get("name");
    const category_id = formData.get("category_id");
    const size = formData.get("size");
    const price = formData.get("price");
    const description = formData.get("description");
    const stock = formData.get("stock");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/costumes", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, category_id, size, price, description, stock })
      });

      const result = await response.json();
      if (response.ok) return json({ status: "success", ...result });
      return json({ status: "error", message: result.message }, { status: 400 });
    } catch (e) {
      return json({ status: "error", message: "Network error" }, { status: 500 });
    }
  }

  return null;
};

export default function AdminCostumesPage() {
  const { costumes } = useLoaderData();
  const fetcher = useFetcher();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-10 space-y-10 max-w-7xl text-left">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Kostum</h1>
              <p className="text-sm text-slate-500 font-medium">Kelola stok dan harga kostum yang tersedia.</p>
            </div>
            <Button 
                className="bg-primary hover:bg-emerald-600 text-white font-black rounded-xl h-11 px-6 shadow-lg shadow-primary/20"
                onClick={() => setIsAddModalOpen(true)}
            >
                + Tambah Kostum
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {costumes.map((costume) => (
              <Card key={costume.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                <div className="aspect-square bg-slate-100">
                  <img 
                    src={costume.images?.[0] ? `http://127.0.0.1:8000/storage/${costume.images[0].image_path}` : "https://via.placeholder.com/300"} 
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{costume.category?.name}</span>
                    <h3 className="font-bold text-slate-900">{costume.name}</h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-900">Rp {Number(costume.price).toLocaleString('id-ID')}</span>
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg uppercase">Size {costume.size}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Simplistic Add Modal for Demo */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl bg-white overflow-hidden p-8 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Tambah Kostum Baru</h2>
                    <fetcher.Form method="post" className="space-y-4">
                        <input type="hidden" name="intent" value="add_costume" />
                        <Input name="name" placeholder="Nama Kostum" required />
                        <Input name="category_id" placeholder="ID Kategori (1: Anime, 2: Game)" required />
                        <Input name="size" placeholder="Size (S, M, L, XL)" required />
                        <Input name="price" type="number" placeholder="Harga Sewa" required />
                        <Input name="stock" type="number" placeholder="Stok" defaultValue="1" required />
                        <textarea 
                            name="description" 
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm" 
                            placeholder="Deskripsi"
                            rows={3}
                        ></textarea>
                        <div className="flex gap-3 pt-4">
                            <Button variant="ghost" className="flex-1 font-bold" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                            <Button type="submit" className="flex-1 bg-primary text-white font-bold" disabled={fetcher.state !== 'idle'}>
                                {fetcher.state !== 'idle' ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </fetcher.Form>
                </Card>
            </div>
        )}
      </main>
    </div>
  );
}
