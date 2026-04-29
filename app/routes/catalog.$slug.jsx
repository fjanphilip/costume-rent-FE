import { json } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import { getApiClient, api } from "~/lib/api";
import CostumeDetailFeature from "~/features/costume-detail";

export const loader = async ({ params, request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");
  const { slug } = params;

  try {
    const client = token ? getApiClient(token) : api;

    const response = await client.get(`/costumes/${slug}`);
    const costume = response.data;

    // Fetch Booked Dates for this costume
    const bookedDatesRes = await client.get(`/costumes/${costume.id}/booked-dates`);
    const bookedData = bookedDatesRes.data;
    const bookedDates = Array.isArray(bookedData) ? bookedData : (bookedData.booked_dates || bookedData.data || []);

    return json({ user, costume, bookedDates });
  } catch (error) {
    console.error("Fetch Detail Error:", error);
    if (error.response?.status === 404) {
      throw new Response("Costume not found", { status: 404 });
    }
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
