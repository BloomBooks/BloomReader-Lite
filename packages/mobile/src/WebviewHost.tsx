import { MessageToBackend } from "@shared/toBackend/messages";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
// import { Snackbar } from "react-native-paper";
import "react-native-url-polyfill/auto";
import { WebView } from "react-native-webview";
import {
    FileDownloadEvent,
    ShouldStartLoadRequest,
} from "react-native-webview/lib/WebViewTypes";
import { BloomContext } from "./BloomContext";
import { useApi } from "./api/api";
import { handleMessageReceived } from "@shared/dist/handleMessageReceived";
// import { DownloadProgressView } from "./components/DownloadProgressView";
import { URL } from "react-native-url-polyfill";
import { Locations } from "./constants/Locations";
import { useNotifyFrontend } from "./hooks/toFrontendHooks";
import {
    importBookToCollection,
    syncCollectionAndFetch,
} from "./models/BookCollection";
import { ensureFolderAsync } from "./util/FileUtil";
import { Path } from "./util/Path";
import { createUrlSafely } from "./util/UrlUtil";
import { WebviewUtil } from "./util/WebviewUtil";

const WEB_BUNDLE_PATH = `${Locations.WebRootFolder}/index.html`;

export const WebviewHost: FunctionComponent = (props) => {
    // Note: Right now this is a single webview that hosts the entire webapp.
    // That's simpler in some ways, but more complicated in others.
    // One annoying thing is that all the native layer code for each of the scenarios is jammed into a single component.
    // You could have more separation using a separate webview instance for each one, but then you have more boilerplate
    // with navigating between native screens and such. So it's a judgment call as to which you want.
    const bloomContext = React.useContext(BloomContext);
    const webviewRef = bloomContext.activeWebviewRef;

    const [activeUrl, setActiveUrl] = useState<URL>(new URL(WEB_BUNDLE_PATH)); // Keeps track of what URL the webview has active (AKA "loaded").

    // Used by Find on BLORG scenario
    // const [canWebviewGoBack, setCanWebviewGoBack] = React.useState(false);
    const [downloadStarted, setDownloadStarted] = React.useState(false);
    const [downloadProgress, setDownloadProgress] = React.useState(0);
    const [downloadComplete, setDownloadComplete] = React.useState(false);
    const [downloadBookTitle, setDownloadBookTitle] = React.useState("");
    const [downloadDestination, setDownloadDestination] = React.useState("");
    const [downloadResumable, setDownloadResumable] = React.useState<
        FileSystem.DownloadResumable | undefined
    >(undefined);

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

    // Besides height and width, the object also contains scale and fontsize,
    // should we ever have need of them.
    const windowSize = useWindowDimensions();

    // const styles = EStyleSheet.create({
    //     container: {
    //         flex: 1,
    //         height: windowSize.height,
    //         width: windowSize.width,
    //         backgroundColor: "#fff",
    //     },
    //     snackbar: {
    //         bottom: "4.5rem",
    //         marginHorizontal: Spacing.ExtraLarge,
    //         // ENHANCE: In BR Android, this slightly overlaps DownloadProgressView,
    //         // appears above it, and the overlapping area has an even darker color.
    //     },
    //     hidden: {
    //         display: "none",
    //     },
    // });

    const downloadBookAsync = async (bloomPubUrl: string) => {
        const fileName = Path.getFileName(bloomPubUrl);

        // What if fileName contains "+" symbols instead of spaces?
        // Well, I figure it's going to get used as a file:// protocol URL for a while still,
        // so probably better to keep them encoded as "+" indefinitely,
        // at least until something user-presentable needs to be generated.

        // Ensure it ends with .bloompub, if it doesn't already.
        // (e.g. older ".bloomd" format)
        const bloomPubFileName = Path.changeExtension(fileName, "bloompub");
        await ensureFolderAsync(Locations.BooksFolder);
        const filePath = Path.join(Locations.BooksFolder, bloomPubFileName);
        setDownloadDestination(filePath);

        const decodedTitle = decodeURIComponent(getTitleFromName(fileName));
        setDownloadBookTitle(decodedTitle);

        const onProgressCallback = (downloadProgress: {
            totalBytesWritten: number;
            totalBytesExpectedToWrite: number;
        }) => {
            const { totalBytesWritten, totalBytesExpectedToWrite } =
                downloadProgress;
            if (totalBytesExpectedToWrite === 0) {
                // Paranoia
                if (totalBytesWritten >= totalBytesExpectedToWrite) {
                    setDownloadProgress(1); // I guess it's technically completed?
                } else {
                    setDownloadProgress(0);
                }

                return;
            }

            const progress = totalBytesWritten / totalBytesExpectedToWrite;
            setDownloadProgress(progress);
        };
        setDownloadStarted(true);
        const resumableDownload = FileSystem.createDownloadResumable(
            bloomPubUrl,
            filePath,
            undefined,
            onProgressCallback
        );
        setDownloadResumable(resumableDownload);
        const downloadResult = await resumableDownload.downloadAsync();

        if (!downloadResult) {
            // maybe cancelled?
            return;
        }
        console.assert(downloadResult.status === 200);

        setDownloadComplete(true);
        setDownloadProgress(1.0); // just in case
        setDownloadResumable(undefined);

        console.log("Download complete.");

        const newCollection = await importBookToCollection(
            filePath,
            "AppHostedLibraryDownload"
        );
        bloomContext.setBookCollection(newCollection);
    };

    return (
        <>
            <WebView
                ref={(ref) => (webviewRef.current = ref)}
                style={styles.webViewStyles}
                source={{ uri }}
                // Note: On Android, the injectedJavscript prop often causes (maybe 95% of the time) an ERR_ACCESS_DENIED error
                // But the injectedJavaScriptBeforeContentLoaded version doesn't have that problem
                injectedJavaScriptBeforeContentLoaded={
                    WebviewUtil.JavaScriptInjections.PostMessageWorkaround +
                    WebviewUtil.JavaScriptInjections
                        .PassConsoleLoggingToNative +
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
                onLoad={(event) => {
                    setActiveUrl(new URL(event.nativeEvent.url));
                }}
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

                    let data: MessageToBackend;
                    try {
                        data = JSON.parse(
                            event.nativeEvent.data
                        ) as MessageToBackend;
                    } catch (e) {
                        console.log(
                            "Unrecognized message: " + event.nativeEvent.data
                        );
                        console.warn(e);

                        // data is an arbitrary string. There's no guarantee that the producer of the message
                        // needs to be produce a JSON-parseable string.
                        // (For example, from BLORG we seem to receive an "[object Object]" string, which looks like an object getting toString()'d
                        // instead of JSON.stringified.  It can't be recovered via JSON.parse)
                        //
                        //  Anyway, so if there's an error, we'll just swallow and ignore this unrecognized message.
                        return;
                    }

                    handleMessageReceived(data, apiHandler);
                }}
                onShouldStartLoadWithRequest={(
                    event: ShouldStartLoadRequest
                ) => {
                    const urlStr = event.url;
                    const url = new URL(urlStr);

                    const isInReadMode =
                        activeUrl.pathname.endsWith("/bloomplayer.htm");

                    // Goal: If a book has a normal hyperlink (not file:///), it should open in the OS's browser, not the webview.
                    if (isInReadMode && url.protocol !== "file:") {
                        Linking.openURL(event.url);
                        console.log(
                            "[WebviewHost] Opening URL in default browser instead of webview. URL: " +
                                url
                        );
                        return false;
                    }
                    console.log("Loading url: " + url);
                    return true;
                }}
                //
                // BloomReader-RN used these, but not sure if they're needed or not
                originWhitelist={["*"]} // Some widgets need this to load their content
                // domStorageEnabled={true}
                // mixedContentMode="always"
                // allowUniversalAccessFromFileURLs={true}
                //
                // This is intended for the Find on Bloom Library scenario.
                onFileDownload={async (event: FileDownloadEvent) => {
                    // This function only gets called on iOS.
                    return downloadBookAsync(event.nativeEvent.downloadUrl);
                }}
            />
            {/* <Snackbar
                style={[styles.snackbar]}
                visible={downloadComplete}
                elevation={4}
                onDismiss={() => {
                    setDownloadComplete(false);
                }}
            >
                {`${downloadBookTitle} added or updated`}
            </Snackbar>
            <DownloadProgressView
                visible={downloadStarted}
                message={
                    !downloadComplete
                        ? `Downloading ${downloadBookTitle}`
                        : "Book download is complete"
                }
                progress={downloadProgress}
                loadingAction={{
                    label: "Cancel",
                    onPress: async () => {
                        if (!downloadResumable) {
                            return;
                        }
                        await downloadResumable.cancelAsync();

                        setDownloadResumable(undefined);
                        setDownloadStarted(false);
                        setDownloadProgress(0);
                    },
                }}
                doneAction={{
                    label: "Read Now",
                    onPress: () => {
                        console.log(
                            "Pretending to navigate to " + downloadDestination
                        );
                        // TODO: Implement me
                        // navigation.navigate("BookReader", {
                        //     bookUrl: downloadDestination,
                        // });
                    },
                }}
            /> */}
        </>
    );
};

const styles = StyleSheet.create({
    webViewStyles: {
        flex: 1,
    },
});

// A translation of BloomReader's DownloadProgressView's titleFromName
const getTitleFromName = (name: string) => {
    // Filenames from BL commonly contain plus signs for spaces.
    // Nearly always things will be more readable if we replace them.
    // A sequence of three plus signs might indicate that the name really had a plus sign.
    // But it might equally indicate a sequence of undesirable characters that each got
    // changed to a space to make a file name. (We had some code briefly to treat three
    // plus signs specially, but got bad results for an Adangbe book called "Bɔ++++kuu.bloompub".)
    let result = name.replace(/\+/, " ");
    // The above might just possibly have produced a sequence of several spaces.
    while (result.indexOf("  ") >= 0) result = result.replace("  ", " ");
    // We don't need a file extension in the name.
    result = result.replace(".bloompub", "").replace(".bloomd", "");
    return result;
};

export default WebviewHost;
