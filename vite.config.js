import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        tailwindcss(),
        tsconfigPaths(),
        remix({
            future: {
                v3_fetcherPersist: true,
                v3_relativeBoundaryComponents: true,
                v3_throwAbortReason: true,
            },
        }),
    ],
});