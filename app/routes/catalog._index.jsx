import { json } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
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

  // Build costumes API URL with filters
  const costumesUrl = new URL("http://127.0.0.1:8000/api/costumes");
  costumesUrl.searchParams.set("page", page);
  if (category) costumesUrl.searchParams.set("category", category);
  if (size) costumesUrl.searchParams.set("size", size);
  if (max_price) costumesUrl.searchParams.set("max_price", max_price);
  if (search) costumesUrl.searchParams.set("search", search);

  try {
    const headers = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const [costumesRes, filtersRes] = await Promise.all([
      fetch(costumesUrl.toString(), { headers }),
      fetch("http://127.0.0.1:8000/api/costume-filters", { headers })
    ]);

    const [pagination, filterOptions] = await Promise.all([
      costumesRes.json(),
      filtersRes.json()
    ]);
    
    return json({ user, pagination, filterOptions });
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
