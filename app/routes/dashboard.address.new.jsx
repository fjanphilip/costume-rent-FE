import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { getApiClient } from "~/lib/api";
import { AddressForm } from "~/features/user-dashboard/components/AddressForm";
import * as Icons from "lucide-react";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  if (!token) return redirect("/login");
  return json({ token });
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();
  const client = getApiClient(token);

  try {
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
      is_primary: formData.get("is_primary") === "on",
      biteship_area_id: formData.get("biteship_area_id"),
      latitude: formData.get("latitude") || null,
      longitude: formData.get("longitude") || null
    };

    await client.post("/user/addresses", data);
    return redirect("/dashboard/settings?tab=address");
  } catch (error) {
    console.error("Add Address Action Error:", error);
    const result = error.response?.data || {};
    return json({ error: result.message || "Gagal menambahkan alamat." }, { status: error.response?.status || 500 });
  }
};

export default function AddAddressPage() {
  const { token } = useLoaderData();
  const actionData = useActionData();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
            <Icons.PlusCircle className="h-8 w-8 text-slate-900" />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Tambah Alamat Baru</h1>
        </div>
        <p className="text-sm font-medium text-slate-400 italic">Lengkapi detail alamat Anda untuk mempermudah proses pengiriman.</p>
      </div>

      {actionData?.error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-2">
          <Icons.AlertCircle className="h-4 w-4" />
          {actionData.error}
        </div>
      )}

      <AddressForm token={token} intent="add_address" />
    </div>
  );
}
