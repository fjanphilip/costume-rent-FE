import { json, redirect } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import CheckoutFeature from "~/features/checkout";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");

  if (!user) return redirect("/login?redirectTo=/catalog");

  const url = new URL(request.url);
  const costumeSlug = url.searchParams.get("costume_slug");
  const startDate = url.searchParams.get("start_date") || "";
  const endDate = url.searchParams.get("end_date") || "";

  if (!costumeSlug) return redirect("/catalog");

  try {
    const headers = { 
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    };

    // Fetch latest user data to check verification status
    const userRes = await fetch(`http://127.0.0.1:8000/api/user`, { headers });
    if (!userRes.ok) return redirect("/login");
    const latestUser = await userRes.json();

    const response = await fetch(`http://127.0.0.1:8000/api/costumes/${costumeSlug}`, {
      headers
    });
    
    if (!response.ok) return redirect("/catalog");

    const costume = await response.json();

    return json({ user: latestUser, costume, initialStartDate: startDate, initialEndDate: endDate });
  } catch (error) {
    console.error("Checkout Loader Error:", error);
    return redirect("/catalog");
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  
  const formData = await request.formData();
  const costume_id = formData.get("costume_id");
  const start_date = formData.get("start_date");
  const duration_days = formData.get("duration_days");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/bookings/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        costume_id,
        start_date,
        duration_days,
        payment_method: "bank_transfer"
      })
    });

    const result = await response.json();

    if (response.ok) {
       // Redirect to success or payment page
       return redirect("/dashboard");
    }

    return json({ error: result.message || "Gagal melakukan checkout" }, { status: 400 });
  } catch (error) {
    return json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
};

export default function CheckoutRoute() {
  return <CheckoutFeature />;
}
