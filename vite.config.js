// Tambahkan baris komentar kecil di atas untuk memastikan file berubah secara hash
// Vercel Deploy Fix - 2026-05-07
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        tailwindcss(),
        tsconfigPaths(),
        remix({
            presets: [vercelPreset()], // Pastikan ini tetap ada
            future: {
                v3_fetcherPersist: true,
                v3_relativeSplatPath: true, // Pastikan namanya benar
                v3_throwAbortReason: true,
                v3_lazyRouteDiscovery: true, // Tambahkan ini sesuai anjuran log warn tadi
                v3_singleFetch: true,         // Tambahkan ini sesuai anjuran log warn tadi
            },
        }),
    ],
});