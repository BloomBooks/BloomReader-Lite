import * as FileSystem from "expo-file-system";
import * as React from "react";
import { FunctionComponent } from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { Locations } from "./constants/Locations";

const WEB_BUNDLE_PATH = `${Locations.WebDistFolder}/index.html`;

export const WebviewHost: FunctionComponent = (props) => {
    const postMessageWorkaroundJavascript = `
window.postMessage = function(data) {
    window.ReactNativeWebView.postMessage(data);
};`;

    return (
        <WebView
            style={styles.webViewStyles}
            source={{ uri: WEB_BUNDLE_PATH }}
            injectedJavaScript={
                postMessageWorkaroundJavascript +
                "\ntrue; // note: this is required, or you'll sometimes get silent failures"
            }
            scalesPageToFit={true}
            automaticallyAdjustContentInsets={false}
            javaScriptEnabled={true}
            allowFileAccess={true} // Needed for Android to access the bloomplayer.htm in cache dir
            allowFileAccessFromFileURLs={true} // Needed to load the book's HTM. allowUniversalAccessFromFileURLs is fine too.
            originWhitelist={["*"]} // Some widgets need this to load their content
            // allowingReadAccessToURL is an iOS only prop.
            // At a high level, under many conditions, file:// requests other than the {source URI} won't work unless its path or a parent directory path
            // is granted explicit access via allowingReadAccessToURL
            // If the source is a file:// URI
            //    If this prop is NOT specified, then Webkit (iOS) only gives access to the source URI by default.
            //    If this prop IS specified, then Webkit (iOS) gives access to the path specified by this prop
            //       Beware: It seems that if Source URI is not under this path, then the Source URI won't be loaded at all!
            // If the source is a http:// URI
            //    It seems that no file:// URI's can be loaded, regardless of what allowingReadAccessToUrl says
            //    During development, the assets are served via http:// to the development machine,
            //       so using a mix of http:// for Bloom Player and file:// for the book is highly problematic!
            //       An easy way to resolve this is to serve Bloom Player via file:// from the cache directory, same as the book.
            allowingReadAccessToURL={FileSystem.cacheDirectory!}
            //   onMessage={onMessageReceived}
            mediaPlaybackRequiresUserAction={false}
            //
            // BloomReader-RN used these, but not sure if they're needed or not
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

export default WebviewHost;
