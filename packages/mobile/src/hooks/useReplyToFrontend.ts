import { MessageToFrontend } from "@shared/toFrontend/messages";
import { ResponseToFrontend } from "@shared/toFrontend/responses";
import { useCallback, useContext } from "react";
import { BloomContext } from "../BloomContext";
import { WebviewUtil } from "../util/WebviewUtil";

// ENHANCE: Rename functions
export function useReplyToFrontend() {
    const bloomContext = useContext(BloomContext);

    const handler = useCallback((message: MessageToFrontend) => {
        if (!bloomContext.activeWebviewRef?.current) {
            console.warn(
                "An attempt was made to send a message to the webview before it was ready."
            );
            return;
        }

        console.info("ReplyToFrontEnd", message);

        const messageStr = JSON.stringify(message).replaceAll('"', '\\"');
        bloomContext.activeWebviewRef.current.injectJavaScript(`
    window.bloomReaderLiteApi?.replyToFrontend("${messageStr}");
            `) + WebviewUtil.JavaScriptInjections.LastLineWorkaround;
    }, []);

    return handler;
}

// ENHANCE: Reduce code de-deduplication
export function useReplyToFrontend2() {
    const bloomContext = useContext(BloomContext);

    const handler = useCallback((message: ResponseToFrontend) => {
        if (!bloomContext.activeWebviewRef?.current) {
            console.warn(
                "An attempt was made to send a message to the webview before it was ready."
            );
            return;
        }

        console.info("ReplyToFrontEnd2", message);

        const jsCode = `
window.bloomReaderLiteApi?.replyToFrontend2(${JSON.stringify(message)})
`;
        bloomContext.activeWebviewRef.current.injectJavaScript(
            jsCode + WebviewUtil.JavaScriptInjections.LastLineWorkaround
        );
    }, []);

    return handler;
}
