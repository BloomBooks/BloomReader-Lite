import { FrontendApi } from "./FrontendApi";

declare global {
    interface Window {
        // This matches the Electron bloompub-viewer's pattern.
        // You could alternatively consider a getBloomReaderLiteApi() function which is basically like a singleton instance method.
        bloomReaderLiteApi: FrontendApi;
    }
}

// Apparently if your tsconfig.json has isolatedModules: true, you need to add this export {} workaround.
// See the comments in https://stackoverflow.com/a/68328575
export {};
