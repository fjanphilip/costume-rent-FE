import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
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
    const response = await fetch("http://127.0.0.1:8000/api/admin/deposit-transactions?type=Withdraw", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();
    return json({ transactions: result.data || [] });
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

  if (intent === "status_update") {
    const status = formData.get("status");
    const reason = formData.get("reason");

    console.log(`Updating Status: ID=${id}, Status=${status}, Reason=${reason}`);

    try {
      const payload = { status };
      if (reason) payload.reason = reason;

      const response = await fetch(`http://127.0.0.1:8000/api/admin/deposit-transactions/${id}/status`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok) {
        return json({ status: "success", ...result });
      }
      
      return json({ 
        status: "error", 
        message: result.message || "Gagal memperbarui status di server." 
      }, { status: response.status });

    } catch (e) {
      console.error("Action Error:", e);
      return json({ status: "error", message: "Terjadi kesalahan koneksi ke server." }, { status: 500 });
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
