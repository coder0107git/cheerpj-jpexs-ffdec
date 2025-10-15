// @ts-check
import { defineConfig } from "astro/config";
import Chii from "./src/chii-integration/index.js";
import VitePWA from "@vite-pwa/astro";


console.log("ENV", process.env.NODE_ENV);
const isDevelopmentEnv = process.env.NODE_ENV === "development";
/**
 * @template [T=any]
 * 
 * @param {string} tag 
 * @param {T} param 
 * @returns {T}
 */
const echo = (tag, param) => {
    console.log(`[${tag}]`, param);
    return param;
}

// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false,
    },
    vite: {
        server: {
            allowedHosts: [".gitpod.io"],
        },
            // Allow all hostnames only during dev
            // isDevelopmentEnv
            //     ? {
            //         allowedHosts: [".gitpod.io"],
            //         // proxy: {
            //         //     '^/chii/target/.*': {
            //         //         target: 'ws://127.0.0.1:8080/',
            //         //         ws: true,

            //         //         changeOrigin: true,
            //         //         rewriteWsOrigin: true,
            //         //         rewrite: (path) => path.replace(/^\/chii/, ''),
            //         //     },
            //         //     '/chii/': {
            //         //         target: 'http://127.0.0.1:8080/',
            //         //         changeOrigin: true,
            //         //         // rewrite: (path) => path.replace(/^\/chii/, ''),
            //         //     },
            //         //     // '^/chii/.*': {
            //         //     //     target: 'http://127.0.0.1:8080/',
            //         //     //     changeOrigin: true,
            //         //     //     rewrite: (path) => path.replace(/^\/chii/, ''),
            //         //     // },
            //         // },
            //     }
            //     : {},
        // preview: {
        //     allowedHosts: [".gitpod.io", "4321-coder0107gi-cheerpj3jpe-rtfmgrkxz5c.ws-us121.gitpod.io"],
        // },
    },
    server: {
        headers: {
            "Service-Worker-Allowed": "/",
        },
    },
    integrations: [
        Chii({
            prefix: "/chii",
            // port: 4321,
        }),
        VitePWA({
            // Source file: /src/sw.ts
            srcDir: "src/lib",
            filename: "sw.ts",
            
            // Use our service worker instead of a generated one
            strategies: "injectManifest",

            // Manually register the service worker ourselves
            injectRegister: false,
            // Disable generating a PWA manifest
            manifest: false,
            // @ts-expect-error: (2375)
            // Disable injecting workbox
            injectManifest: {
                injectionPoint: undefined,
            },


            // Enable SW on development
            devOptions: {
                enabled: true,
                type: "module",
            },
        }),
    ],
});