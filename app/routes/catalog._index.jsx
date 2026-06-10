import { json } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import { getApiClient, api } from "~/lib/api";
import CatalogFeature from "~/features/catalog";


export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  const token = session.get("token");

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const category = url.searchParams.get("category");
  const size = url.searchParams.get("size");
  const max_price = url.searchParams.get("max_price");
  const search = url.searchParams.get("search");

  // Build costumes API params
  const params = { page };
  if (category) params.category = category;
  if (size) params.size = size;
  if (max_price) params.max_price = max_price;
  if (search) params.search = search;

  try {
    const client = token ? getApiClient(token) : api;

    const [costumesRes, filtersRes] = await Promise.all([
      client.get("/costumes", { params }),
      client.get("/costume-filters")
    ]);

    return json({ 
      user, 
      pagination: costumesRes.data, 
      filterOptions: filtersRes.data 
    });
  } catch (error) {
    console.error("Fetch Data Error:", error);
    return json({ user, pagination: null, filterOptions: null });
  }
};



export default function CatalogRoute() {
  return <CatalogFeature />;
}

export const meta = () => {
  return [
    { title: "Katalog Kostum | SewaCosplay" },
    { name: "description", content: "Jelajahi koleksi kostum cosplay terbaik kami." }
  ];
};
