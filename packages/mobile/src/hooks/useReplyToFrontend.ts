import { MessageToFrontend } from "@shared-types/toFrontend/messages";
import { useCallback, useContext } from "react";
import { BloomContext } from "../BloomContext";
import { WebviewUtil } from "../util/WebviewUtil";

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
