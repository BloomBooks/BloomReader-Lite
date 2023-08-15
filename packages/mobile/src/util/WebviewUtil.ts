export class WebviewUtil {
    public static JavaScriptInjections = {
        PostMessageWorkaround: `
window.postMessage = function(data) {
    window.ReactNativeWebView.postMessage(data);
};`,
        PassConsoleLoggingToNative: `
        const customLogger = (logLevel, message, ...optionalParams) => {
            // Not all objects JSON.stringify well. You need to specially handle any objects you don't want to get stringified.
            if (message instanceof Error) {
                const error = message;
                message = error.name + ": " + error.message + "\\n" + error.stack;
            }
            window.ReactNativeWebView.postMessage(JSON.stringify({'messageType': 'console-log', logLevel, message, optionalParams}));
        }
        console = {
            ...console,
            log: (msg, ...optionalParams) => customLogger('log', msg, ...optionalParams),
            debug: (msg, ...optionalParams) => customLogger('debug', msg, ...optionalParams),
            info: (msg, ...optionalParams) => customLogger('info', msg, ...optionalParams),
            warn: (msg, ...optionalParams) => customLogger('warn', msg, ...optionalParams),
            error: (msg, ...optionalParams) => customLogger('error', msg, ...optionalParams),
        };`,
        LastLineWorkaround:
            "\ntrue; // note: this is required, or you'll sometimes get silent failures",
    };

    public static log(
        logLevel: string,
        message: any,
        ...optionalParams: any[]
    ) {
        switch (logLevel) {
            case "debug":
                console.debug(message, ...optionalParams);
                break;
            case "info":
                console.info(message, ...optionalParams);
                break;
            case "warn":
                console.warn(message, ...optionalParams);
                break;
            case "error":
                console.error(message, ...optionalParams);
                break;
            case "log":
            default:
                console.log(message, ...optionalParams);
                break;
        }
    }
}
