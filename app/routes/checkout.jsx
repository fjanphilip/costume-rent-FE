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

    // 1. Fetch latest user data
    const userRes = await fetch(`http://127.0.0.1:8000/api/user`, { headers });
    if (!userRes.ok) return redirect("/login");
    const userDataResponse = await userRes.json();
    const latestUser = userDataResponse.data || userDataResponse.user || userDataResponse;

    // 2. Fetch Costume Details
    const response = await fetch(`http://127.0.0.1:8000/api/costumes/${costumeSlug}`, {
      headers
    });
    if (!response.ok) return redirect("/catalog");
    const costume = await response.json();

    // 3. Fetch Booked Dates for this costume
    const bookedDatesRes = await fetch(`http://127.0.0.1:8000/api/costumes/${costume.id}/booked-dates`, {
      headers
    });
    let bookedDates = [];
    if (bookedDatesRes.ok) {
       const bookedData = await bookedDatesRes.json();
       bookedDates = Array.isArray(bookedData) ? bookedData : (bookedData.booked_dates || bookedData.data || []);
    }

    return json({ 
      user: latestUser, 
      costume, 
      bookedDates,
      initialStartDate: startDate, 
      initialEndDate: endDate 
    });
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
  const end_date = formData.get("end_date");
  const duration_days = formData.get("duration_days");
  const payment_method = "midtrans"; // Changed to midtrans
  const notes = formData.get("notes") || "";

  // Fetch latest user data to verify status on server-side
  const userRes = await fetch(`http://127.0.0.1:8000/api/user`, {
    headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
  });
  const userDataResponse = await userRes.json();
  const user = userDataResponse.data || userDataResponse.user || userDataResponse;

  if (user.is_verified != 1 && user.is_verified !== true && user.is_verified !== "1") {
    return json({ error: "Akun Anda belum terverifikasi. Silakan verifikasi KTP/ID Anda terlebih dahulu." }, { status: 403 });
  }

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
        end_date,
        duration_days: parseInt(duration_days),
        payment_method,
        notes
      })
    });

    const result = await response.json();

    if (response.ok) {
       // Return snap_token to the frontend instead of redirecting
       return json({ 
         success: true, 
         snap_token: result.snap_token || result.data?.snap_token 
       });
    }

    return json({ error: result.message || "Gagal melakukan checkout." }, { status: 400 });
  } catch (error) {
    console.error("Checkout Action Error:", error);
    return json({ error: "Terjadi kesalahan server saat memproses pesanan." }, { status: 500 });
  }
};

export default function CheckoutRoute() {
  return <CheckoutFeature />;
}
