import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { getApiClient } from "~/lib/api";
import AdminDashboardFeature from "~/features/admin-dashboard";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");

  // Security: Check session first
  if (!user || !token) {
    return redirect("/login");
  }

  // Ensure only admin users can access this route
  if (user.role !== 'admin') {
    return redirect("/dashboard");
  }

  try {
    const client = getApiClient(token);

    const [usersRes, txRes, bookingsRes] = await Promise.all([
      client.get("/admin/users"),
      client.get("/admin/deposit-transactions"),
      client.get("/admin/bookings")
    ]);

    const usersData = usersRes.data;
    const txData = txRes.data;
    const bookingsData = bookingsRes.data;

    return json({ 
      user, 
      stats: {
        totalUsers: usersData.data?.length || 0,
        totalRevenue: (txData.data || [])
          .filter(t => t.transaction_type === 'Top_Up' && t.status === 'Completed')
          .reduce((sum, t) => sum + Number(t.amount), 0),
        activeBookings: (bookingsData.data || [])
          .filter(b => ['Pending', 'Confirmed', 'Picked_Up'].includes(b.status)).length,
        recentActivity: txData.data?.slice(0, 5) || [],
        pendingVerification: (usersData.data || [])
          .filter(u => u.verification_status === 'pending').length
      }
    });
  } catch (error) {
    console.error("Admin Dashboard Loader Error:", error);
    return json({ user, stats: null });
  }
};

export default function AdminIndex() {
  const { stats } = useLoaderData();
  return <AdminDashboardFeature stats={stats} />;
}

export const meta = () => {
  return [{ title: "Admin Dashboard | System Overview" }];
};
