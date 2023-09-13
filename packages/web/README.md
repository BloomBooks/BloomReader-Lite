# @bloom-reader-lite/web

The web-based frontend of BloomReaderLite.

Any native-specific requests should be handled by a separate backend package implementing [shared/IBloomReaderLiteApi](https://github.com/BloomBooks/BloomReader-Lite/blob/master/packages/shared/src/api.ts).

## Build Loop

Normally you can just start it by running the steps in [packages/mobile](https://github.com/BloomBooks/BloomReader-Lite/blob/master/packages/mobile/README.md) instead (to test E2E on a mobile device).

## Local Development

To debug the web app only on your computer, you can use `yarn dev`. This can be handy to debug CSS or other issues where a browser inspector is handy, but an inspector is not available in the E2E context (e.g. for the mobile app, Expo Dev Client can give you an inspector for the native elements but you can't debug inside the webview).
You can use [MockBackend.ts](https://github.com/BloomBooks/BloomReader-Lite/blob/master/packages/web/src/api/MockBackend.ts) to fake backend responses for development purposes.
I recommend manually copying any mock books you need for development into ./mock-data/Books/

## Boilerplate info from Vite (React + TS + Vite) template

### React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

-   Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

-   Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
-   Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
-   Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
