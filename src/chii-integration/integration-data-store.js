// @ts-check
import { version as chiiVersion } from "chii/package.json" assert { type: "json" };

const __internalIntegrationDataKey = Symbol.for(`__chiiAstroIntegration [Chii ${chiiVersion}]`);

/** 
 * @typedef {Object} ChiiIntegrationConfig
 * @prop {string} [prefix="/chii"] The path for Chii to listen on. This is **not** relative to the base. Defaults to `/chii`.
 * @prop {number} [port=8080] Defaults to `8080`. An error is thrown if the specified port is unavailable.
 */



/**
 * @typedef {Required<ChiiIntegrationConfig> & { disabled: boolean }} IntegrationData
 * 
 * @typedef {typeof globalThis & {
 *     [__internalIntegrationDataKey]: IntegrationData
 * }} ExtendedGlobal
 */

/**
 * @param {IntegrationData} data 
 */
export function setIntegrationData(data) {
    (/** @type {ExtendedGlobal} */(globalThis))[__internalIntegrationDataKey] = data;
}

/**
 * @param {Partial<IntegrationData>} data 
 */
export function updateIntegrationData(data) {
    (/** @type {ExtendedGlobal} */(globalThis))[__internalIntegrationDataKey] = {
        ...getIntegrationData(),
        ...data,
    };
}

/**
 * @returns {IntegrationData}
 */
export function getIntegrationData() {
    return (/** @type {ExtendedGlobal} */(globalThis))[__internalIntegrationDataKey] ?? {};
}
