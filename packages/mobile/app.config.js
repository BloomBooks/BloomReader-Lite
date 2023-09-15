/**
 * Like app.json, but allows dynamic configuration
 * Documentation: https://docs.expo.dev/versions/latest/config/app/
 */

const releaseChannel = process.env.RELEASE_CHANNEL?.toLowerCase();

export default {
    name: getAppName(),
    slug: "bloom-reader-lite-mobile", // Used in Expo URLs or the project name in Expo Go, I think. I don't think it needs to vary based on release channel.
    version: "0.1.0",
    owner: "bloombooks",
    orientation: "portrait",
    icon: "./assets/BloomIcon.png",
    userInterfaceStyle: "light",
    splash: {
        image: "./assets/BloomIcon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        supportsTablet: true,
        bundleIdentifier: getPackageIdentifier(),
        buildNumber: "1", // typically a single integer (but as a string)
    },
    android: {
        package: getPackageIdentifier(),

        // ENHANCE: Create the adaptive icon. See instructions here: https://docs.expo.dev/develop/user-interface/app-icons/#android. It's not hard.
        // "adaptiveIcon": {
        //     "foregroundImage": "./assets/adaptive-icon.png",
        //     "backgroundColor": "#ffffff"
        // }
    },
    web: {
        favicon: "./assets/favicon.png",
    },
    extra: {
        eas: {
            projectId: "1fb41809-af21-48d4-9a9b-f39d83c209f1",
        },
    },
    experiments: {
        tsconfigPaths: true,
    },
};

function getAppName() {
    const baseAppName = "Bloom Reader Lite";
    switch (releaseChannel) {
        case "developer":
            return `${baseAppName} (Dev)`;
        case "beta-internal":
            return `${baseAppName} (Beta)`;
        case "release-internal":
            return `${baseAppName} (Release)`;
        case "alpha":
        case "beta":
        case "release":
        case undefined:
            return baseAppName;
        default:
            console.warn("Unknown releaseChannel " + releaseChannel);
            return baseAppName;
    }
}

// Returns the "bundleIdentifier" (iOS) or "package" identifier (Android)
// It's handy to have separate ones for
// Wait, for submitting to the app stores... don't we want them to all be under basePackageIdentifier?
// Well, as long as "eas submit" doesn't set the env variable, I think it'd work ok.
function getPackageIdentifier() {
    const basePackageIdentifier = "org.sil.bloomreaderlite";
    switch (releaseChannel) {
        case "developer":
        case "beta-internal":
        case "release-internal":
            // The purpose of this is to allow side-by-side installation on test devices,
            // but when publishing to the app stores (regardless of whether on internal or TestFlight or production),
            // we want it to all have the same package identifier.
            // (Well, at least if you want to use the single-app model that the app stores try to point you to.
            // If you want to have a multi-app model where each track is its own app then obviously they should
            // all have their own package identifier)
            return `${basePackageIdentifier}.${releaseChannel.replaceAll(
                "-",
                "."
            )}`; // FYI, android package identifiers cannot contain "-"
        case "alpha":
        case "beta":
        case "release":
        case undefined:
            // Eventually we want it to return basePackageIdentifier when we're ready for the real thing,
            // but right now we use "org.sil.bloomreaderlite.preview" instead to make sure we don't
            // accidentally mess anything up on our real desired package identifier
            //return basePackageIdentifier;
            return "org.sil.bloomreaderlite.preview";
        default:
            console.warn("Unknown releaseChannel " + releaseChannel);
            return basePackageIdentifier;
    }
}
