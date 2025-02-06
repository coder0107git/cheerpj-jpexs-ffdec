/// <reference no-default-lib="true"/>
/// <reference lib="ESNext" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope;
declare var clients: ServiceWorkerGlobalScope["clients"];

export {};

