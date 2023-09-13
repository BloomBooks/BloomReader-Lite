# @bloom-reader-lite/electron

Electron driver wrapping the @bloom-reader-lite/web frontend goes here.

TODOs:

-   Create a new electron app
-   Have it consume [packages/web](https://github.com/BloomBooks/BloomReader-Lite/tree/master/packages/web) and display the webapp frontend.
-   Implement the backend [shared/IBloomReaderLiteApi](https://github.com/BloomBooks/BloomReader-Lite/blob/master/packages/shared/src/api.ts) and have it communicate to the frontend via [window.bloomReaderLite.toFrontend.respond() or .notify()](https://github.com/BloomBooks/BloomReader-Lite/blob/master/packages/web/src/api/Api.ts).
-   In our [Github Action](https://github.com/BloomBooks/BloomReader-Lite/blob/master/.github/workflows/build-local.yml), uncomment out the building of Windows (and optionally MacOS) for the electron package.
-   Change any references to [electron-demo](https://github.com/BloomBooks/BloomReader-Lite/tree/master/packages/electron-demo) in the [Github actions](https://github.com/BloomBooks/BloomReader-Lite/tree/master/.github/workflows) and replace it with this ([electron](https://github.com/BloomBooks/BloomReader-Lite/tree/master/packages/electron)) instead.
-   Delete [packages/electron-demo](https://github.com/BloomBooks/BloomReader-Lite/tree/master/packages/electron-demo).

Take inspiration from
[packages/mobile](https://github.com/BloomBooks/BloomReader-Lite/tree/master/packages/mobile) for its responsibilities and from [BloomPUB Viewer](https://github.com/BloomBooks/bloompub-viewer) for how to do an Electron app
