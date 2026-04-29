import { json, redirect } from "@remix-run/node";
import api from "~/lib/api";
export { default } from "~/features/auth/RegisterFeature";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const response = await api.post("/register", data);
    return redirect("/login");
  } catch (error) {
    console.error("Registration Error:", error);
    
    if (error.response) {
      const result = error.response.data;
      const errorMessage = result.errors 
        ? Object.values(result.errors).flat().join(", ") 
        : result.message || "Registration failed";
      return json({ error: errorMessage }, { status: error.response.status });
    }

    return json({ error: "Gagal terhubung ke server API." }, { status: 500 });
  }
};

export const meta = () => {
  return [{ title: "Register | SewaCosplay" }];
};

