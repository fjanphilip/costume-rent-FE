import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { getApiClient } from "~/lib/api";
import AdminWithdrawalsFeature from "~/features/admin-withdrawals";
import { AdminSidebar } from "~/features/admin-dashboard/components/AdminSidebar";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");

  // Admin Security Check
  if (!user || !token || user.role !== 'admin') {
    return redirect("/login");
  }

  try {
    const response = await getApiClient(token).get("/admin/deposit-transactions?type=Withdraw");
    return json({ transactions: response.data.data || [] });
  } catch (error) {
    console.error("Fetch Withdrawals Error:", error);
    return json({ transactions: [] });
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();

  const intent = formData.get("intent");
  const id = formData.get("id");

  const client = getApiClient(token);

  if (intent === "status_update") {
    const status = formData.get("status");
    const reason = formData.get("reason");

    try {
      const payload = { status };
      if (reason) payload.reason = reason;

      const response = await client.put(`/admin/deposit-transactions/${id}/status`, payload);
      return json({ status: "success", ...response.data });
    } catch (error) {
      console.error("Action Error:", error);
      const result = error.response?.data || {};
      return json({
        status: "error",
        message: result.message || "Gagal memperbarui status di server."
      }, { status: error.response?.status || 500 });
    }
  }

  return null;
};


export default function AdminWithdrawalsPage() {
  const { transactions } = useLoaderData();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-10 space-y-10 max-w-7xl">
          <AdminWithdrawalsFeature transactions={transactions} />
        </div>
      </main>
    </div>
  );
}

export const meta = () => {
  return [{ title: "Manage Withdrawals | Admin Panel" }];
};
