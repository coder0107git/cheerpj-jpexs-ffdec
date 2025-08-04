// @ts-check

import { x } from "tinyexec";
/**
 * @import { AstroIntegration } from "astro"
 * @typedef { ReturnType<typeof x> } ProcessResult
 */
import { setIntegrationData, updateIntegrationData } from "./integration-data-store.js";

/**  @type {ProcessResult | null} */
let chiiProcess = null;

/** @param {ProcessResult} process */
const processToPromise = (process) => {
    return new Promise((resolve, reject) => {
        process.then(resolve, reject);
    });
};


/** @typedef {import("./integration-data-store.js").ChiiIntegrationConfig} ChiiIntegrationConfig */
/**
 * @param {ChiiIntegrationConfig} params
 * @returns {AstroIntegration}
 */
export default function ChiiIntegration(params = {}) {
    params.prefix ??= "/chii";
    params.prefix = new URL(params.prefix, "file:///").pathname,
    params.port ??= 8080;

    const { port, prefix } = params;
    const notDev = process.env.NODE_ENV !== "development";

    setIntegrationData({ port, prefix, disabled: true });

    return {
        name: "astro-chii",
        hooks: {
            "astro:config:setup": ({ logger, updateConfig }) => {
                // logger.debug(`Using the following config: ${JSON.stringify(params, null, 2)}}`);

                if(notDev) {
                    logger.info("Skipping Chii configuration for non-development environment");
                    return;
                }

                updateConfig({
                    vite: {
                        server: {
                            proxy: {
                                [`^${prefix}/target/.*`]: {
                                    target: `ws://127.0.0.1:${port}/`,
                                    ws: true,

                                    changeOrigin: true,
                                    rewriteWsOrigin: true,
                                    rewrite: (path) => path.replace(prefix, ''),
                                },
                                [prefix + "/"]: {
                                    target: `http://127.0.0.1:${port}/`,
                                    changeOrigin: true,
                                },
                            },
                        }
                    }
                });
            },
            "astro:server:start": async ({ logger }) => {
                const serverLogger = logger.fork(logger.label + "/server");

                // If somehow a Chii server already exists, kill it
                if(chiiProcess) {
                    chiiProcess.kill();
                }

                if(notDev) {
                    return;
                }

                chiiProcess = x("chii", ["start", "-p", `${port}`, "--base-path", prefix]);
                
                // Wait for Chii stdout (indicating Chii was started)
                for await (const _ of chiiProcess) {
                    if(chiiProcess.exitCode) {
                        logger.error(`Unable to start Chii. Verify that the specified port (${port}) is available.`);

                        chiiProcess = null;
                        return;
                    }

                    // Chii didn't complain about the port, so Chii should be running. Other 
                    // output from Chii can be ignored.
                    break;
                }

                updateIntegrationData({ disabled: false });

                serverLogger.info("Chii has successfully started");
            },
            "astro:server:done": async ({ logger }) => {
                const serverLogger = logger.fork(logger.label + "/server");
                
                updateIntegrationData({ disabled: true });

                if(chiiProcess) {
                    chiiProcess.kill();
                    await processToPromise(chiiProcess);
                    chiiProcess = null;

                    serverLogger.info("Chii has successfully shut down.");
                }
            }
        },
    };
}


