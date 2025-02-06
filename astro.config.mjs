// @ts-check
import { defineConfig } from "astro/config";
import VitePWA from "@vite-pwa/astro";


// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false,
    },
    vite: {
        server:
            // Allow all hostnames only during dev
            process.env.NODE_ENV === "development"
                ? {
                    allowedHosts: true,
                }
                : {},
    },
    server: {
        headers: {
            "Service-Worker-Allowed": "/",
        },
    },
    integrations: [VitePWA({
        // Source file: /src/sw.ts
        srcDir: "src/lib",
        filename: "sw.ts",
        
        // Use our service worker instead of a generated one
        strategies: "injectManifest",

        // Manually register the service worker ourselves
        injectRegister: false,
        // Disable generating a PWA manifest
        manifest: false,
        // Disable injecting workbox
        injectManifest: {
            injectionPoint: undefined,
        },


        // Enable SW on development
        devOptions: {
            enabled: true,
            type: "module",
        },
    })],
});