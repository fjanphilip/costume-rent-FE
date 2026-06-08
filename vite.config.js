import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";

export default defineConfig({
    plugins: [
        tailwindcss(),
        tsconfigPaths(),
        remix({
            presets: [vercelPreset()],
            future: {
                v3_fetcherPersist: true,
                v3_relativeBoundaryComponents: true,
                v3_throwAbortReason: true,
            },
        }),
    ],
});