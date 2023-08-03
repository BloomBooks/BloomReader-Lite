import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as React from "react";
import { FunctionComponent } from "react";
import { NativeSyntheticEvent, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { Locations } from "./constants/Locations";

import * as ErrorLog from "./util/ErrorLog";
import { WebViewMessage } from "react-native-webview/lib/WebViewTypes";
import { createUrlSafely } from "./util/UrlUtil";

const WEB_BUNDLE_PATH = `${Locations.WebRootFolder}/index.html`;

export const WebviewHost: FunctionComponent = (props) => {
    const postMessageWorkaroundJavascript = `
window.postMessage = function(data) {
    window.ReactNativeWebView.postMessage(data);
};`;

    const uri = createUrlSafely(WEB_BUNDLE_PATH, {
        booksUrlRoot: Locations.BooksFolder,
    });
    console.info({ uri });

    return (
        <WebView
            style={styles.webViewStyles}
            source={{ uri }}
            injectedJavaScript={
                postMessageWorkaroundJavascript +
                "\ntrue; // note: this is required, or you'll sometimes get silent failures"
            }
            scalesPageToFit={true}
            automaticallyAdjustContentInsets={false}
            javaScriptEnabled={true}
            allowFileAccess={true} // Needed for Android to access the HTM/HTML file on the filesystem
            allowFileAccessFromFileURLs={true} // Needed to load the HTML file. allowUniversalAccessFromFileURLs is fine too.
            // allowingReadAccessToURL is an iOS only prop.
            // At a high level, under many conditions, file:// requests other than the {source URI} won't work unless its path or a parent directory path
            // is granted explicit access via allowingReadAccessToURL
            // If the source is a file:// URI
            //    If this prop is NOT specified, then Webkit (iOS) only gives access to the source URI by default.
            //    If this prop IS specified, then Webkit (iOS) gives access to the path specified by this prop
            //       Beware: It seems that if Source URI is not under this path, then the Source URI won't be loaded at all!
            // If the source is a http:// URI
            //    It seems that no file:// URI's can be loaded, regardless of what allowingReadAccessToUrl says
            // Note: Setting allowReadAccess to the shared ancestor of the Cache directory and Documents directory
            //    (i.e. file:///var/mobile/Containers/Data/Application/{guid})
            //     didn't allow both cache and documents directory to be accessed, sadly.
            //     Only the cache directory was accessible (probably because that was the one the sourceUri was located in)
            allowingReadAccessToURL={FileSystem.documentDirectory!}
            mediaPlaybackRequiresUserAction={false}
            onMessage={onMessageReceived}
            onShouldStartLoadWithRequest={({ url }) => {
                // Goal: If a book has a normal hyperlink, it should open in the OS's browser, not the webview.
                if (url.startsWith("http")) {
                    Linking.openURL(url);
                    console.info(
                        "[WebviewHost] Load aborted, opening URL in default browser instead. URL: " +
                            url
                    );
                    return false;
                }
                return true;
            }}
            //
            // BloomReader-RN used these, but not sure if they're needed or not
            originWhitelist={["*"]} // Some widgets need this to load their content
            // domStorageEnabled={true}
            // mixedContentMode="always"
            // allowUniversalAccessFromFileURLs={true}
        />
    );
};

const styles = StyleSheet.create({
    webViewStyles: {
        flex: 1,
    },
});

function onMessageReceived(event: NativeSyntheticEvent<WebViewMessage>) {
    try {
        if (!event.nativeEvent || !event.nativeEvent.data) {
            // At startup we get a completely spurious
            // message, the source of which I have not been able to track down.
            // However, since it doesn't have any data format we expect, we can easily ignore it.
            return;
        }

        const data = JSON.parse(event.nativeEvent.data);
        switch (data.messageType) {
            // case "sendAnalytics":
            //     onAnalyticsEvent(data);
            //     break;
            case "logInfo":
                console.info(data.message);
                break;
            case "logError":
                ErrorLog.logError({
                    logMessage: data.message,
                });
                break;
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

export default WebviewHost;
