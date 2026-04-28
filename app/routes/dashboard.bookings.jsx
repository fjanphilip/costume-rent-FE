import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useSearchParams, useNavigate } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { BookingTable } from "~/features/user-dashboard/components/BookingTable";
import * as Icons from "lucide-react";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";

  if (!token) return json({ bookings: [], accessories: [] });

  try {
    const headers = {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    };

    const [bookingsRes, accessoriesRes] = await Promise.all([
      fetch(`http://127.0.0.1:8000/api/bookings?page=${page}`, { headers }),
      fetch("http://127.0.0.1:8000/api/accessories", { headers }),
    ]);

    const bookingsData = bookingsRes.ok ? await bookingsRes.json() : { data: [] };
    const accessoriesData = accessoriesRes.ok ? await accessoriesRes.json() : { data: [] };

    return json({ 
      bookings: bookingsData.data || [],
      accessories: accessoriesData.data || [],
      pagination: {
        current_page: bookingsData.current_page || 1,
        last_page: bookingsData.last_page || 1,
        total: bookingsData.total || 0
      }
    });
  } catch (error) {
    console.error("Dashboard Bookings Loader Error:", error);
    return json({ bookings: [], accessories: [] });
  }
};

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Reusing actions from dashboard index
  if (intent === "confirm_received") {
    const bookingId = formData.get("booking_id");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/confirm-received`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) return json({ success: true });
    } catch (error) { }
    return json({ success: true });
  }

  if (intent === "request_return") {
    const bookingId = formData.get("booking_id");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/request-return`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: formData 
      });
      if (response.ok) return json({ success: true });
      const resData = await response.json();
      return json({ error: resData.message }, { status: 400 });
    } catch (error) {
      return json({ error: "Network error" }, { status: 500 });
    }
  }

  if (intent === "get_payment_token") {
    const bookingId = formData.get("booking_id");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/payment-token`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        return json({ success: true, snap_token: data.snap_token });
      }
      return json({ error: data.message }, { status: 400 });
    } catch (error) {
      return json({ error: "Gagal menghubungi server." }, { status: 500 });
    }
  }

  if (intent === "pay_fine") {
    const bookingId = formData.get("booking_id");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/pay-fine`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        return json({ success: true, snap_token: data.snap_token });
      }
      return json({ error: data.message }, { status: 400 });
    } catch (error) {
      return json({ error: "Gagal menghubungi server." }, { status: 500 });
    }
  }

  return null;
};

export default function BookingsPage() {
  const { bookings, accessories, pagination } = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    navigate(`?${params.toString()}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">My Bookings</h1>
        <p className="text-muted-foreground text-sm font-medium italic">Lihat semua pesanan kostum Anda, mulai dari status pembayaran hingga pengembalian.</p>
      </header>

      <div className="space-y-10">
        <BookingTable 
          bookings={bookings} 
          title="All Transactions" 
          showViewAll={false} 
          accessories={accessories} 
        />
        
        {/* Simple Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-center gap-2 pb-10">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`h-10 w-10 rounded-xl font-black transition-all ${
                  pagination.current_page === page
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                    : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
