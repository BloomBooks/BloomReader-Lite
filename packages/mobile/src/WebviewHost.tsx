import { MessageToBackend } from "@shared/toBackend/messages";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as React from "react";
import { FunctionComponent, useEffect } from "react";
import { StyleSheet } from "react-native";
import "react-native-url-polyfill/auto";
import { WebView } from "react-native-webview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { BloomContext } from "./BloomContext";
import { useApi } from "./api/api";
import { handleMessageReceived } from "./api/handleMessageReceived";
import { Locations } from "./constants/Locations";
import { useNotifyFrontend } from "./hooks/useReplyToFrontend";
import { syncCollectionAndFetch } from "./models/BookCollection";
import { createUrlSafely } from "./util/UrlUtil";
import { WebviewUtil } from "./util/WebviewUtil";

const WEB_BUNDLE_PATH = `${Locations.WebRootFolder}/index.html`;

export const WebviewHost: FunctionComponent = (props) => {
    const bloomContext = React.useContext(BloomContext);
    const webviewRef = bloomContext.activeWebviewRef;

    if (!webviewRef) {
        throw new Error(
            "activeWebviewRef should be initialized by BloomContext.provider"
        );
    }

    const uri = createUrlSafely(WEB_BUNDLE_PATH, {
        booksUrlRoot: Locations.BooksFolder,
    });

    console.log({ uri });

    // on mount effects
    useEffect(() => {
        const loadAsync = async () => {
            const updatedCollection = await syncCollectionAndFetch();
            bloomContext.setBookCollection(updatedCollection);

            // TODO: run checkForBooksToImport (see BloomReader-RN)
        };

        loadAsync();
    }, []);

    const handleReplyToFrontEnd = useNotifyFrontend();

    ////////////////////////////////////////////////////////
    // Sending and receiving messages to/from the webview //
    ////////////////////////////////////////////////////////
    // const apiHandler = useMemo(() => {
    //     // useMemo because just one instance of Api per component instance is plenty

    //     return new Api(bloomContext.bookCollection, handleReplyToFrontEnd);
    // }, [handleReplyToFrontEnd]);
    const apiHandler = useApi();

    useEffect(() => {
        // ENHANCE: How would we send this whenever the collection changes?
        // Maybe we need to subscribe to changes, and maybe BookCollection needs to keep track of who's subscribing to it?
        // Or maybe with a custom hook.
        console.log("The collection changed... hopefully.");

        handleReplyToFrontEnd({
            messageType: "book-collection-changed",
            bookCollection: bloomContext.bookCollection,
        });
    }, [bloomContext.bookCollection]);

    return (
        <WebView
            ref={(ref) => (webviewRef.current = ref)}
            style={styles.webViewStyles}
            source={{ uri }}
            injectedJavaScript={
                WebviewUtil.JavaScriptInjections.PostMessageWorkaround +
                WebviewUtil.JavaScriptInjections.PassConsoleLoggingToNative +
                WebviewUtil.JavaScriptInjections.LastLineWorkaround
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
            allowingReadAccessToURL={FileSystem.cacheDirectory!}
            mediaPlaybackRequiresUserAction={false}
            onMessage={(event) => {
                if (!event.nativeEvent || !event.nativeEvent.data) {
                    // At startup we get a completely spurious
                    // message, the source of which I have not been able to track down.
                    // However, since it doesn't have any data format we expect, we can easily ignore it.
                    return;
                }

                // TODO: Should theoretically do real runtime validation of the events,
                // not just "as ..."
                // TODO: Should make sure that this event is only coming from our code and not something malicious.
                //       Read https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns
                const data = JSON.parse(
                    event.nativeEvent.data
                ) as MessageToBackend;

                handleMessageReceived(data, apiHandler);
            }}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
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

function onShouldStartLoadWithRequest(event: ShouldStartLoadRequest) {
    const urlStr = event.url;
    const url = new URL(urlStr);

    // Goal: If a book has a normal hyperlink (not file:///), it should open in the OS's browser, not the webview.
    if (url.protocol !== "file:") {
        Linking.openURL(event.url);
        console.log(
            "[WebviewHost] Load aborted, opening URL in default browser instead. URL: " +
                url
        );
        return false;
    }
    console.log("Loading url: " + url);
    // if (url.pathname.endsWith("/bloom-player/bloomplayer.htm")) {
    //     console.log(`Intercepting bloom-player request ${urlStr}`);
    //     const bookUrlParam = url.searchParams.get("url");
    //     if (!bookUrlParam) {
    //         return true;
    //     }
    //     console.log(`pretending to extract book "${bookUrlParam}"`);
    //     openBookForReading(bookUrlParam).then((value) => {
    //         console.log("openBookForReading returned with: " + value);
    //     });
    // }
    return true;
}

export default WebviewHost;
