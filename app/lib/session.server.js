import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cr3t"], // In production, use env variable
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function commitSession(session) {
  return sessionStorage.commitSession(session);
}

export async function destroySession(session) {
  return sessionStorage.destroySession(session);
}

export async function createUserSession(userId, userData, token, redirectTo) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  session.set("user", userData);
  session.set("token", token);
  return redirect(redirectTo, {

    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function logout(request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

