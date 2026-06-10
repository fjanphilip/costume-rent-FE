import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { getApiClient } from "~/lib/api";
import { AddressForm } from "~/features/user-dashboard/components/AddressForm";
import * as Icons from "lucide-react";

export const loader = async ({ request, params }) => {
  const session = await getSession(request);
  const token = session.get("token");
  if (!token) return redirect("/login");

  const { id } = params;
  try {
    const client = getApiClient(token);
    const response = await client.get("/user/addresses");
    const address = response.data.find(a => a.id === id);
    if (!address) return redirect("/dashboard/settings?tab=address");

    return json({ token, address });
  } catch (error) {
    console.error("Edit Address Loader Error:", error);
    return redirect("/dashboard/settings?tab=address");
  }
};

export const action = async ({ request, params }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();
  const client = getApiClient(token);
  const { id } = params;

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

    await client.put(`/user/addresses/${id}`, data);
    return redirect("/dashboard/settings?tab=address");
  } catch (error) {
    console.error("Edit Address Action Error:", error);
    const result = error.response?.data || {};
    return json({ error: result.message || "Gagal memperbarui alamat." }, { status: error.response?.status || 500 });
  }
};

export default function EditAddressPage() {
  const { token, address } = useLoaderData();
  const actionData = useActionData();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
            <Icons.Edit3 className="h-8 w-8 text-slate-900" />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Edit Alamat</h1>
        </div>
        <p className="text-sm font-medium text-slate-400 italic">Perbarui informasi alamat pengiriman Anda.</p>
      </div>

      {actionData?.error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-2">
          <Icons.AlertCircle className="h-4 w-4" />
          {actionData.error}
        </div>
      )}

      <AddressForm token={token} initialData={address} intent="edit_address" />
    </div>
  );
}
