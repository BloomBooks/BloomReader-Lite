Hot reloading doesn't seem to work right. When the webapp is changed, the Expo app will hot reload but oftentimes the webview will report an error or a blank screen and you'll have to restart the app (meaning you don't really get hot reload)
I thought at one point i fixed some state resetting problems and it was working nicely again (temporarily)

Change the status bar color
AppBar needs some padding - amount TBD

Android builds fail in beta and release - Looks like https://github.com/expo/expo/issues/23265. Does this workaround work? https://github.com/expo/expo/issues/23265#issuecomment-1662709655
Well, or if you just publish the packages to the NPM repository, that would solve it for the release case. For local builds, you can continue using yarn link, and we have a viable workaround in local development and alpha mode.

packages/mobile's copyWebDist.ts

-   Make it so that when you run "yarn start", it also watches for changes from web.
-   Right now you will need to re-run "yarn start" (not the end of the world, since hot reloading the "web" part often doesn't work right anymore. I thought I did get it work right at one point though. Need to debug that).
-   You can refer to this old code for inspiration:

    "watchDist": "chokidar \"dist/\*_/_\" -c \"yarn copy-dist\" --debounce 1000",

    "chokidar-cli": "^3.0.0",

How packages/mobile consumes packages/web

-   I feel like the right way is to have packages/web be a devDependency.
-   For the time being, using "bloom-reader-lite-web": "link:./../shared",
-   But eventually you'd want it to be point to an actual package version published in NPM. (This means in theory the Expo mobile app and the Electron app need not be kept synchronized with the same version of [shared] and [web].)
-   Either way, if you did that, you can easily modify one constant in scripts/copyWebDist.ts to point to node_modules/bloom-reader-lite-web instead of "../web"
-   If using the "link" version rather than pointing to NPM...
    The part that gave me trouble was when trying to run "eas build" in a github action (probably in other places too).
    It would error out during the "eas build" part with a yarn install error, saying it couldn't find the uuid folder in web's node_modules. I think that's because the [web] package is symlinked.
    (Weird aside: "eas build" somehow runs "yarn install" as a substep I guess, but that's weird. "yarn install" is already run on the Github runner. (1) It doesn't error out, and (2) why does it need to run it again, and (3) Why is [web] package relevant at all if devDependencies? )
    I tried modifying babel.config.js/metro.config.js and reading/following https://docs.expo.dev/guides/monorepos/#modify-the-metro-config, but I didn't have success yet.

It'd be nice to be able to run multiple variants on the same device.
Follow the instructions here: https://docs.expo.dev/build-reference/variants/

If this yarn preinstall works (allows alpha/beta builds to succeed), then you should refactor build-local.yml to cut out the steps that build shared and web.
Honestly, the yarn install of the mobile app is kinda unnecessary too. I guess what it needs to be able to do is run EAS. The other useful thing is the steps that check if the web-dist folder looks correct and stuff.

Write up how to use Diawi to upload iOS builds in lieu of EAS Cloud.
Optional - you could programmatically upload builds to Daiwi using https://github.com/marketplace/actions/upload-diawi
so that you won't have to do it manually.
