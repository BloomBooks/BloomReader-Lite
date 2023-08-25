module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            [
                // resolve local packages ("yarn add link" or "yarn link") or external tsconfig.json path aliases
                "module-resolver",
                {
                    extensions: [
                        ".ios.js",
                        ".android.js",
                        ".ios.jsx",
                        ".android.jsx",
                        ".js",
                        ".jsx",
                        ".json",
                        ".ts",
                        ".tsx",
                    ],
                    root: ["."],
                    alias: {
                        "@shared": "../shared/dist",
                    },
                },
            ],
        ],
    };
};
