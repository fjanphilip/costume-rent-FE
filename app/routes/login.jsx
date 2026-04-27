import { json, redirect } from "@remix-run/node";
import { createUserSession, getSession } from "~/lib/session.server";
export { default } from "~/features/auth/LoginFeature";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  if (session.has("userId")) {
    return redirect("/");
  }
  return null;
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login API Response:", data);

    if (!response.ok) {
      return json({ error: data.message || "Invalid credentials" }, { status: 400 });
    }

    // Assuming the API returns a user object and a token
    if (!data.user) {
      console.error("Login Error: User object missing in response");
      return json({ error: "Data user tidak ditemukan dalam respon API." }, { status: 500 });
    }

    const token = data.token || data.access_token;
    
    // Role-based redirection
    let redirectTo = "/";
    if (data.user.role === "admin") {
      redirectTo = "/admin";
    }

    return createUserSession(data.user.id, data.user, token, redirectTo);
  } catch (error) {

    console.error("Login Action Error:", error);

    return json({ error: "Gagal terhubung ke server API." }, { status: 500 });
  }
};

export const meta = () => {
  return [{ title: "Login | SewaCosplay" }];
};

