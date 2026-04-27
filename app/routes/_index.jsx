import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
export { default } from "~/features/home-catalog";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/costumes?limit=6", {
      headers: { "Accept": "application/json" }
    });
    const result = await response.json();
    return json({ 
      user, 
      costumes: result.data || result.costumes || [] 
    });
  } catch (error) {
    console.error("Home Loader Error:", error);
    return json({ user, costumes: [] });
  }
};
export const meta = () => {
  return [
    { title: "SewaCosplay | Katalog Kostum Anime Terbaru" },
    { name: "description", content: "Temukan koleksi kostum anime terbaru dari musim ini hanya di SewaCosplay." }
  ];
};
