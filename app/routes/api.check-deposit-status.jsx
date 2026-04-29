import { json } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import { getApiClient } from "~/lib/api";

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
    const response = await getApiClient(token).get(`/deposit/transactions/${id}`);
    return json(response.data);
  } catch (error) {
    console.error("Check Deposit Status Error:", error);
    return json({ error: "Server Error" }, { status: 500 });
  }
};
