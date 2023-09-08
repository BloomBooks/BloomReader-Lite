export default {
    name: "bloom-reader-lite-mobile",
    slug: "bloom-reader-lite-mobile",
    version: "1.0.0",
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
        bundleIdentifier: "org.sil.bloomreaderlite",
    },
    android: {
        package: "org.sil.bloomreaderlite",
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
