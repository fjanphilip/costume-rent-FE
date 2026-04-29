import { redirect } from "@remix-run/node";
import { getSession, logout } from "~/lib/session.server";

import { getApiClient } from "~/lib/api";

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token"); // Optional: if you have a token

  try {
    // Call the external API logout
    if (token) {
      await getApiClient(token).post("/logout");
    }
  } catch (error) {
    console.error("Logout API Error:", error);
  }

  // Clear session regardless of API success
  return logout(request);
};

export const loader = () => redirect("/");
