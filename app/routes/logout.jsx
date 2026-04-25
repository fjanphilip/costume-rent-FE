import { redirect } from "@remix-run/node";
import { getSession, logout } from "~/lib/session.server";

export const action = async ({ request }) => {
  const session = await getSession(request);
  const token = session.get("token"); // Optional: if you have a token

  try {
    // Call the external API logout
    await fetch("http://127.0.0.1:8000/api/logout", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`, // If using tokens
      },
    });
  } catch (error) {
    console.error("Logout API Error:", error);
  }

  // Clear session regardless of API success
  return logout(request);
};

export const loader = () => redirect("/");
