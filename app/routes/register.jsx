import { json, redirect } from "@remix-run/node";
export { default } from "~/features/auth/RegisterFeature";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle Laravel validation errors or other issues
      const errorMessage = result.errors 
        ? Object.values(result.errors).flat().join(", ") 
        : result.message || "Registration failed";
      return json({ error: errorMessage }, { status: 400 });
    }

    return redirect("/login");
  } catch (error) {
    console.error("Registration Error:", error);
    return json({ error: "Gagal terhubung ke server API." }, { status: 500 });
  }
};

export const meta = () => {
  return [{ title: "Register | SewaCosplay" }];
};

