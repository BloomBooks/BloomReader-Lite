import {
    BookCollection,
    emptyBookCollection,
} from "@shared/models/BookCollection";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, useWindowDimensions } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings";
import WebView from "react-native-webview";
import { BloomContext } from "./src/BloomContext";
import { WebviewHost } from "./src/WebviewHost";
import startupTasks from "./src/util/StartupTasks";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [drawerLockMode, setDrawerLockMode] = useState<
        "unlocked" | "locked-closed"
    >("unlocked");
    const [bookCollection, setBookCollection] = useState<BookCollection>(
        emptyBookCollection()
    );
    const webviewRef = useRef<WebView>(null);

    // Besides height and width, the object also contains scale and fontsize,
    // should we ever have need of them.
    const windowSize = useWindowDimensions();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            height: windowSize.height, // Setting the width/height seems to be necessary for WebView to show up
            width: windowSize.width,
        },
    });

    // componentDidMount effects
    useEffect(() => {
        async function prepare() {
            try {
                // Pre-load fonts, make any API calls you need to do here
                await startupTasks();
            } catch (e) {
                console.warn(e);
                // TODO: Politely inform the end user too.
            } finally {
                // Tell the application to render
                console.info("Setting appIsReady=true.");
                setAppIsReady(true);
            }
        }

        prepare();

        // Cleanup on unmount
        return () => {
            // You might think this is unnecessary, because "Why would the top-level component unmount?"
            // It's here because of Expo's hot reload, which when it reloads will cause this component to be re-mounted.
            // "Ok, but shouldn't the state be re-initialized?"
            // Ah, no, preserving the state for you is one of the features of Hot Reload,
            // and it's normally helpful, but not for {appIsReady}. I wish it reset that state instead.
            // To counteract Hot Reload preserving the state, we should explicitly reset appIsReady
            // when the component unmounts.
            setAppIsReady(false);
        };
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // This tells the splash screen to hide immediately! If we call this after
            // `setAppIsReady`, then we may see a blank screen while the app is
            // loading its initial state and rendering its first pixels. So instead,
            // we hide the splash screen once we know the root view has already
            // performed layout.
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <RootSiblingParent>
            <BloomContext.Provider
                value={{
                    bookCollection,
                    setBookCollection: (newBookCollection: BookCollection) => {
                        console.log(
                            "Setting book collection: " +
                                JSON.stringify(newBookCollection)
                        );
                        setBookCollection(newBookCollection);
                    },
                    drawerLockMode,
                    setDrawerLockMode: (
                        lockMode: "unlocked" | "locked-closed"
                    ) => setDrawerLockMode(lockMode),
                    activeWebviewRef: webviewRef,
                }}
            >
                <SafeAreaView
                    style={styles.container}
                    onLayout={onLayoutRootView}
                >
                    <WebviewHost />
                    <StatusBar style="auto" />
                </SafeAreaView>
            </BloomContext.Provider>
        </RootSiblingParent>
    );
}
