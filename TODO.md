# UI

-   Back button functionality - from Bloom Player, Find on BLORG
-   Delete book functionality
-   Find on BLORG: Snacks/toasts or other UI affordances for the download progress and to let them know when the download is completed
-   Change the status bar color
-   AppBar needs some padding - amount TBD
-   Android - bloom-reader-against-dark.png logo in AppBar doesn't load (broken image icon appears in its place)
    -   Note: After adding expo-updates, I see (in AndroidStudio Logcat) errors like "Failed to copy asset null" and "Failed to download asset with key 8e3a10e157f75ada21ab742c022d5430". Could very possibly be related to this!
    -   Note: I added a temporary console.info when setAppReady is set to true, but I don't see it printing out! But it's surely happening. I wonder what that means.
-   Android - status bar needs to be moved down
-   Android - it seems to me the sample book doesn't always load?
-   Drawer needs to be closed
-   Drawer menu items need to be implemented
-   Bookshelves need to be implemented
-   Android App Icon - It's slightly cut off (too zoomed in) compared to the native BloomReader version
-   Books in the BookList need their styling to match the original version BloomReader
-   I'm sure other things...

# Other

-   Add unit tests

-   How packages/mobile consumes packages/web

    -   I feel like the right way is to have packages/web be a devDependency.
    -   For the time being, using "bloom-reader-lite-web": "link:./../shared",
    -   But eventually you'd want it to be point to an actual package version published in NPM. (This means in theory the Expo mobile app and the Electron app need not be kept synchronized with the same version of [shared] and [web].)
    -   Either way, if you did that, you can easily modify one constant in scripts/copyWebDist.ts to point to node_modules/bloom-reader-lite-web instead of "../web"
    -   If using the "link" version rather than pointing to NPM...
        The part that gave me trouble was when trying to run "eas build" in a github action (probably in other places too).
        It would error out during the "eas build" part with a yarn install error, saying it couldn't find the uuid folder in web's node_modules. I think that's because the [web] package is symlinked.
        (Weird aside: "eas build" somehow runs "yarn install" as a substep I guess, but that's weird. "yarn install" is already run on the Github runner. (1) It doesn't error out, and (2) why does it need to run it again, and (3) Why is [web] package relevant at all if devDependencies? )
        I tried modifying babel.config.js/metro.config.js and reading/following https://docs.expo.dev/guides/monorepos/#modify-the-metro-config, but I didn't have success yet.

-   Google Play Store submission:

    -   Needs to be done in its entirety.

-   Apple App Store submission:
    -   Fill out remaining information on AppStoreConnect website like screenshots, etc.
    -   When ready to do it for real, create a real app with bundle identifier "org.sil.bloomreaderlite" instead of "org.sil.bloomreaderlite.preview"
