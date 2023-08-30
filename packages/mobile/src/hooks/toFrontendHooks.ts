import { MessageToFrontend } from "@shared/toFrontend/messages";
import { ResponseToFrontend } from "@shared/toFrontend/responses";
import { useCallback, useContext } from "react";
import WebView from "react-native-webview";
import { BloomContext } from "../BloomContext";
import { WebviewUtil } from "../util/WebviewUtil";

export function useNotifyFrontend() {
    const bloomContext = useContext(BloomContext);

    const handler = useCallback((message: MessageToFrontend) => {
        console.log("Backend -> FrontEnd:", message.messageType);

        const messageStr = JSON.stringify(message).replaceAll('"', '\\"');
        const action = `
    window.bloomReaderLite?.toFrontend?.notify("${messageStr}");
            `;

        doActionOnFrontend(action, bloomContext.activeWebviewRef?.current);
    }, []);

    return handler;
}

export function useRespondToFrontend() {
    const bloomContext = useContext(BloomContext);

    const handler = useCallback((message: ResponseToFrontend) => {
        console.log("Backend -> FrontEnd:", message.messageType);

        const action = `
window.bloomReaderLite?.toFrontend?.respond(${JSON.stringify(message)})
`;

        doActionOnFrontend(action, bloomContext.activeWebviewRef?.current);
    }, []);

    return handler;
}

/**
 * Helper function to help send a message to the frontend
 * @param jsCode The Javascript code to inject which performs the action
 * @param webview The webview which contains the frontend.
 */
function doActionOnFrontend(
    jsCode: string,
    webview: WebView | undefined | null
) {
    if (!webview) {
        console.warn(
            "An attempt was made to send a message to the webview before it was ready."
        );
        return;
    }

    webview.injectJavaScript(
        jsCode + WebviewUtil.JavaScriptInjections.LastLineWorkaround
    );
}
