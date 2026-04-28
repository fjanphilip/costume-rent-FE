import { json } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import CostumeDetailFeature from "~/features/costume-detail";

export const loader = async ({ params, request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");
  const { slug } = params;

  try {
    const headers = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`http://127.0.0.1:8000/api/costumes/${slug}`, {
      headers
    });
    
    if (!response.ok) {
        throw new Response("Costume not found", { status: 404 });
    }

    const costume = await response.json();

    // Fetch Booked Dates for this costume
    const bookedDatesRes = await fetch(`http://127.0.0.1:8000/api/costumes/${costume.id}/booked-dates`, {
      headers
    });
    let bookedDates = [];
    if (bookedDatesRes.ok) {
       const bookedData = await bookedDatesRes.json();
       bookedDates = Array.isArray(bookedData) ? bookedData : (bookedData.booked_dates || bookedData.data || []);
    }

    return json({ user, costume, bookedDates });
  } catch (error) {
    console.error("Fetch Detail Error:", error);
    throw new Response("Error fetching costume details", { status: 500 });
  }
};

export default function CostumeDetailRoute() {
  return <CostumeDetailFeature />;
}

export const meta = ({ data }) => {
  if (!data) return [{ title: "Costume Not Found" }];
  return [
    { title: `${data.costume.name} | SewaCosplay` },
    { name: "description", content: data.costume.description }
  ];
};
