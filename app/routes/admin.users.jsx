import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
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
    const response = await fetch("http://127.0.0.1:8000/api/admin/users", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();
    return json({ users: result.data || [] });
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

  if (intent === "update") {
    const name = formData.get("name");
    const email = formData.get("email");
    const role = formData.get("role");
    const is_verified = formData.get("is_verified") === "1";

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, role, is_verified })
      });

      const result = await response.json();
      if (response.ok) return json({ status: "success", ...result });
      return json({ status: "error", message: result.message }, { status: 400 });
    } catch (e) {
      return json({ status: "error", message: "Network error" }, { status: 500 });
    }
  }

  if (intent === "verify") {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${id}/verify`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok) return json({ status: "success", ...result });
      return json({ status: "error", message: result.message }, { status: 400 });
    } catch (e) {
      return json({ status: "error", message: "Network error" }, { status: 500 });
    }
  }

  if (intent === "delete") {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
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
