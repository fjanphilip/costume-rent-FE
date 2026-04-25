import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
export { default } from "~/features/home-catalog";

export const loader = async ({ request }) => {
  const session = await getSession(request);
  const user = session.get("user");
  return json({ user });
};
export const meta = () => {
  return [
    { title: "SewaCosplay | Katalog Kostum Anime Terbaru" },
    { name: "description", content: "Temukan koleksi kostum anime terbaru dari musim ini hanya di SewaCosplay." }
  ];
};
