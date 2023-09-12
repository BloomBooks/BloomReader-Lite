/**
 * Like app.json, but allows dynamic configuration
 */

const releaseChannel = process.env.RELEASE_CHANNEL?.toLowerCase();

export default {
    name: getAppName(),
    slug: "bloom-reader-lite-mobile", // Used in Expo URLs or the project name in Expo Go, I think. I don't think it needs to vary based on release channel.
    version: "1.0.0",
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
        case "alpha":
            return `${baseAppName} (Alpha)`;
        case "beta":
            return `${baseAppName} (Beta)`;
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
        case "alpha":
        case "beta":
            return `${basePackageIdentifier}.${releaseChannel}`;
        case "release":
        case undefined:
            return basePackageIdentifier;
        default:
            console.warn("Unknown releaseChannel " + releaseChannel);
            return basePackageIdentifier;
    }
}
