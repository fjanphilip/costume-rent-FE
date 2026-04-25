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

    return json({ user, costume });
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
