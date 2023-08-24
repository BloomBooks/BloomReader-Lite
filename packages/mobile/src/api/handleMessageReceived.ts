import { IBloomReaderLiteApi } from "@shared-types/api";
import { MessageToBackend } from "@shared-types/toBackend/messages";

/**
 * Try to keep this function generic enough that if moved, it could be re-used for sending messages to
 * an electron implementer of IBloomReaderLiteApi
 */
export function handleMessageReceived(
    data: MessageToBackend,
    api: IBloomReaderLiteApi
) {
    try {
        switch (data.messageType) {
            case "console-log":
                api.consoleLog(data);
                break;
            case "get-book-collection":
                api.getBookCollection();
                break;
            case "unpack-zip-file":
                api.unpackZipFile(data);
                break;
            // case "sendAnalytics":
            //     onAnalyticsEvent(data);
            //     break;
            // case "logError":
            //     ErrorLog.logError({
            //         logMessage: data.message,
            //     });
            //     break;
            // case "requestCapabilities":
            //     this.webview!.postMessage(
            //         JSON.stringify({
            //             messageType: "capabilities",
            //             canGoBack: true,
            //         })
            //     );
            //     break;
            // case "backButtonClicked":
            //     props.navigation.goBack();
            //     break;
            // case "bookStats":
            //     onBookStats(data);
            //     break;
            // case "pageShown":
            //     onPageShown(data);
            //     break;
            // case "audioPlayed":
            //     onAudioPlayed(data);
            //     break;
            // case "videoPlayed":
            //     onVideoPlayed(data);
            //     break;
            // default:
            //     ErrorLog.logError({
            //         logMessage:
            //             "BookReader.onMessageReceived() does not understand the messageType on this event: " +
            //             JSON.stringify(event, getStringifyReplacer()),
            //     });
        }

        // Next step: should also handle message type storePageData. The data object will also
        // have a key and a value, both strings. We need to store them somewhere that will
        // (at least) survive rotating the phone, and ideally closing and re-opening the book;
        // but it should NOT survive downloading a new version of the book. Whether there's some
        // other way to get rid of it (for testing, or for a new reader) remains to be decided.
        // Once the data is stored, it needs to become part of the reader startup to give it
        // back to the reader using window.sendMessage(). BloomPlayer is listening for a message
        // with messageType restorePageData and pageData an object whose fields are the key/value
        // pairs passed to storePageData. See the event listener in boom-player's externalContext
        // file.
    } catch (e) {
        // ErrorLog.logError({
        //     logMessage:
        //         "BookReader.onMessageReceived() does not understand this event: " +
        //         event.nativeEvent.data,
        // });
    }
}
