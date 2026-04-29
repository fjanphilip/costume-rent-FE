import { json, redirect } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import CheckoutFeature from "~/features/checkout";

import { getApiClient } from "~/lib/api";

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
    const client = getApiClient(token);

    // 1. Fetch latest user data
    const userRes = await client.get("/user");
    const userDataResponse = userRes.data;
    const latestUser = userDataResponse.data || userDataResponse.user || userDataResponse;

    // 2. Fetch Costume Details
    const response = await client.get(`/costumes/${costumeSlug}`);
    const costume = response.data;

    // 3. Fetch Addresses
    const addrRes = await client.get("/user/addresses");
    const addresses = addrRes.data;

    // 4. Fetch Booked Dates for this costume
    const bookedDatesRes = await client.get(`/costumes/${costume.id}/booked-dates`);
    const bookedData = bookedDatesRes.data;
    const bookedDates = Array.isArray(bookedData) ? bookedData : (bookedData.booked_dates || bookedData.data || []);

    return json({ 
      user: latestUser, 
      costume, 
      addresses,
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
  const accessory_ids = formData.getAll("accessory_ids");
  const payment_method = "midtrans";
  const notes = formData.get("notes") || "";
  const shipping_address = formData.get("shipping_address");

  const client = getApiClient(token);

  try {
    // Fetch latest user data to verify status on server-side
    const userRes = await client.get("/user");
    const userDataResponse = userRes.data;
    const user = userDataResponse.data || userDataResponse.user || userDataResponse;

    if (user.is_verified != 1 && user.is_verified !== true && user.is_verified !== "1") {
      return json({ error: "Akun Anda belum terverifikasi. Silakan verifikasi KTP/ID Anda terlebih dahulu." }, { status: 403 });
    }

    const response = await client.post("/bookings/checkout", {
      costume_id,
      start_date,
      end_date,
      duration_days: parseInt(duration_days),
      accessory_ids: accessory_ids.map(id => id.toString()),
      payment_method,
      shipping_address,
      notes
    });

    const result = response.data;
    return json({ 
      success: true, 
      snap_token: result.snap_token || result.data?.snap_token 
    });
  } catch (error) {
    console.error("Checkout Action Error:", error);
    const result = error.response?.data || {};
    return json({ error: result.message || "Gagal melakukan checkout." }, { status: error.response?.status || 500 });
  }
};

export default function CheckoutRoute() {
  return <CheckoutFeature />;
}
