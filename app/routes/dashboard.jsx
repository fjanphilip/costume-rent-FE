import { json, redirect } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { UserSidebar } from "~/features/user-dashboard/components/UserSidebar";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  
  const token = session.get("token");
  
  if (!user || !token) {
    return redirect("/login");
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/user", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const freshUser = await response.json();
      return json({ user: freshUser });
    }
  } catch (error) {
    console.error("Dashboard Loader Error:", error);
  }

  return json({ user });
};

export default function DashboardLayout() {
  const { user } = useLoaderData();
  
  return (
    <div className="flex min-h-screen bg-[#FBFBFE]">
      <UserSidebar user={user} />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl py-10 space-y-8 text-left">
           <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}

export const meta = () => {
  return [{ title: "Dashboard | SewaCosplay" }];
};
