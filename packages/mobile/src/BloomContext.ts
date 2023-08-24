/* eslint-disable @typescript-eslint/no-empty-function */
import React, { MutableRefObject } from "react";
import WebView from "react-native-webview";
import { BookCollection, emptyBookCollection } from "./models/BookCollection";

export const BloomContext = React.createContext<{
    drawerLockMode: "unlocked" | "locked-closed";
    setDrawerLockMode: (lockMode: "unlocked" | "locked-closed") => void;
    bookCollection: BookCollection;
    setBookCollection: (bc: BookCollection) => void;
    activeWebviewRef?: MutableRefObject<WebView | null>;
}>({
    drawerLockMode: "unlocked",
    setDrawerLockMode: () => {},
    bookCollection: emptyBookCollection(),
    setBookCollection: () => {},
    // Note: Not valid to do "useRef(undefined)" here, it'll throw an error (Cannot read property 'useRef' of null)
    // Probably because it's not in a function component (can't call hooks outside function components).
    // Instead, you need the whole ref to be undefined (i.e. ref = undefined, rather than ref.current = undefined).
});
