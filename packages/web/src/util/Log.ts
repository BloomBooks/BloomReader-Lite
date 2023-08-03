/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Logs messages via our custom window.postMessage (as well as the standard console, just in case)
 */
export class Log {
    public static info(message?: any): void {
        window.postMessage(
            JSON.stringify({
                messageType: "logInfo",
                message,
            }),
            "*"
        );
        console.info(message);
    }
}
