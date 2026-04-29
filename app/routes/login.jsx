import { json, redirect } from "@remix-run/node";
import { createUserSession, getSession } from "~/lib/session.server";
import api from "~/lib/api";
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
    const response = await api.post("/login", { email, password });
    const data = response.data;
    console.log("Login API Response:", data);

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

    if (error.response) {
      return json({ error: error.response.data.message || "Invalid credentials" }, { status: error.response.status });
    }

    return json({ error: "Gagal terhubung ke server API." }, { status: 500 });
  }
};

export const meta = () => {
  return [{ title: "Login | SewaCosplay" }];
};

