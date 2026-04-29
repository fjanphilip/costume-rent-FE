import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { getApiClient } from "~/lib/api";
import AdminUsersFeature from "~/features/admin-users";
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
    const response = await getApiClient(token).get("/admin/users");
    return json({ users: response.data.data || [] });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return json({ users: [] });
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
    if (intent === "update") {
      const name = formData.get("name");
      const email = formData.get("email");
      const role = formData.get("role");
      const is_verified = formData.get("is_verified") === "1";

      const response = await client.put(`/admin/users/${id}`, { name, email, role, is_verified });
      return json({ status: "success", ...response.data });
    }

    if (intent === "verify") {
      const response = await client.put(`/admin/users/${id}/verify`);
      return json({ status: "success", ...response.data });
    }

    if (intent === "delete") {
      const response = await client.delete(`/admin/users/${id}`);
      return json({ status: "success", ...response.data });
    }
  } catch (error) {
    console.error("Admin Users Action Error:", error);
    const result = error.response?.data || {};
    return json({ status: "error", message: result.message || "Terjadi kesalahan pada server." }, { status: error.response?.status || 500 });
  }

  return null;
};


export default function AdminUsersPage() {
  const { users } = useLoaderData();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-10 space-y-10 max-w-7xl">
          <AdminUsersFeature users={users} />
        </div>
      </main>
    </div>
  );
}

export const meta = () => {
  return [{ title: "User Management | Admin Panel" }];
};
