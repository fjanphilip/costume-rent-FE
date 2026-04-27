import { json } from "@remix-run/node";
import { getSession } from "~/lib/session.server";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token");
  
  if (!token) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/deposit/transactions/${id}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    return json(data);
  } catch (error) {
    return json({ error: "Server Error" }, { status: 500 });
  }
};
