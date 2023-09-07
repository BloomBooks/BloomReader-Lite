/** @jsxImportSource @emotion/react **/
import { css } from "@emotion/react";
import Button from "@mui/material/Button";

import SearchIcon from "@mui/icons-material/Search";
import {
    BookCollection,
    emptyBookCollection,
} from "bloom-reader-lite-shared/dist/models/BookCollection";
import {
    Book,
    BookOrShelf,
    Shelf,
    isShelf,
    sortedListForShelf,
} from "bloom-reader-lite-shared/dist/models/BookOrShelf";
import { UnpackZipFileRequestBase } from "bloom-reader-lite-shared/dist/toBackend/requests";
import { MessageToFrontend } from "bloom-reader-lite-shared/dist/toFrontend/messages";
import { ResponseToFrontend } from "bloom-reader-lite-shared/dist/toFrontend/responses";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { BloomReaderAppBar } from "./AppBar";
import BookListItem from "./BookListItem";

const BLOOM_PLAYER_PATH = `./bloom-player/bloomplayer.htm`;

// TODO: This class needs to be renamed.
export const BookList: FunctionComponent = () => {
    const [selectedItem, setSelectedItem] = useState<BookOrShelf | undefined>(
        undefined
    );
    // const theme = useTheme();

    const [bookCollection, setBookCollection] = useState<BookCollection>(
        emptyBookCollection()
    );

    // // TODO: This is way too small in Landscape mode. not sure why.
    // const headerImageHeight =
    //     useHeaderHeight() - Constants.statusBarHeight - Spacing.Small;

    // const bloomContext = React.useContext(BloomContext);

    // const selectItem = (item: BookOrShelf) => {
    //     setSelectedItem(item);
    // };

    const clearSelectedItem = () => {
        setSelectedItem(undefined);
    };

    // React.useEffect(() => {
    //     const syncCollectionAsync = async () => {
    //         if (route.params.shelf === undefined) {
    //             // This is the root BookList
    //             // // Sync collection with actual contents of public book folders
    //             // const updatedCollection = await syncCollectionAndFetch();
    //             // bloomContext.setBookCollection(updatedCollection);
    //             // // Having a file shared with us results in a new instance of our app,
    //             // // so we can check for imports in componentDidMount()
    //             // await checkForBooksToImport();

    //             await initRootCollection();
    //             // BRAnalytics.screenView("Main");
    //         } else {
    //             // BRAnalytics.screenView("Shelf", displayName(shelf));
    //         }
    //         setFullyLoaded(true);
    //     };
    //     syncCollectionAsync();
    // }, [route.params.shelf]);

    // const checkForBooksToImport = async () => {
    //     const updatedCollection =
    //         await ImportBookModule.checkForBooksToImport();
    //     if (updatedCollection) {
    //         bloomContext.setBookCollection(updatedCollection);
    //         if (updatedCollection.newBook) openBook(updatedCollection.newBook);
    //     }
    // };

    const itemTouch = (item: BookOrShelf) => {
        if (selectedItem) clearSelectedItem();
        else isShelf(item) ? openShelf(item) : openBook(item);
    };

    const openBook = async (book: Book) => {
        // navigation.navigate("BookReader", {
        //     bookUrl: book.filepath,
        // });

        const request: UnpackZipFileRequestBase = {
            messageType: "unpack-zip-file",
            zipFilePath: book.filepath,
        };
        const response = await window.bloomReaderLite.api.requestAsync(request);

        if (response.messageType !== "unpack-zip-file-response") {
            return;
        } else if (!response.success) {
            // TODO: Inform the user that extracting the book failed and tell them what to try next.
            return;
        }

        onBookUnpacked(response.indexPath);
    };

    const openShelf = (shelf: Shelf) => {
        console.log("Got shelf: " + shelf);
        throw new Error("Not implemented");
        // navigation.push("BookList", {
        //     shelf: shelf,
        // });
    };

    // React.useEffect(() => {
    //     if (selectedItem) {
    //         const deleteSelectedItem = async () => {
    //             if (!selectedItem) {
    //                 console.warn(
    //                     "deletedSelectedItem called, but selectedItem is undefined."
    //                 );
    //                 return;
    //             }
    //             const newCollection = await deleteBookOrShelf(selectedItem);
    //             bloomContext.setBookCollection(newCollection);
    //             clearSelectedItem();
    //         };

    //         navigation.setOptions({
    //             //headerTitle: displayName(selectedItem), //BloomReader-RN does this, but BloomReader Android just leaves it blank.
    //             headerTitle: "",
    //             headerLeft: () => (
    //                 <BRHeaderButtons>
    //                     <Item
    //                         title="back"
    //                         iconName={
    //                             Platform.OS === "ios"
    //                                 ? "ios-arrow-back"
    //                                 : "md-arrow-back"
    //                         }
    //                         onPress={clearSelectedItem}
    //                     />
    //                 </BRHeaderButtons>
    //             ),
    //             headerRight: () => (
    //                 <BRHeaderButtons>
    //                     {/* Sharing not supported in this version */}
    //                     {/* <Item
    //                         title="share"
    //                         iconName="md-share"
    //                         onPress={shareSelectedItem)}
    //                     /> */}
    //                     <Item
    //                         title="trash"
    //                         iconName={
    //                             Platform.OS === "ios" ? "ios-trash" : "md-trash"
    //                         }
    //                         onPress={deleteSelectedItem}
    //                     />
    //                 </BRHeaderButtons>
    //             ),
    //         });
    //     } else {
    //         navigation.setOptions({
    //             headerTitle: route.params.shelf
    //                 ? displayName(route.params.shelf)
    //                 : () => <HeaderImage height={headerImageHeight} />,
    //             headerLeft: route.params.shelf
    //                 ? undefined
    //                 : () => (
    //                       // Let ReactNavigation supply the default back arrow
    //                       <BRHeaderButtons>
    //                           <Item
    //                               title="drawer"
    //                               iconName="md-menu"
    //                               onPress={
    //                                   navigation.getParent<
    //                                       DrawerNavigationProp<RootDrawerParamList>
    //                                   >()?.toggleDrawer
    //                               }
    //                               accessibilityLabel={I18n.t("Main Menu")}
    //                           />
    //                       </BRHeaderButtons>
    //                   ),
    //             headerRight: undefined,
    //         });
    //     }
    // }, [
    //     route.params.shelf,
    //     navigation,
    //     selectedItem,
    //     headerImageHeight,
    //     bloomContext,
    // ]);

    const list = sortedListForShelf(
        // TODO: Set shelf
        // route.params.shelf,
        undefined,
        bookCollection
    );

    // componentDidMount
    useEffect(() => {
        const updateBookCollection = (
            data: MessageToFrontend | ResponseToFrontend
        ) => {
            if (
                data.messageType !== "book-collection-changed" &&
                data.messageType !== "get-book-collection-response"
            ) {
                return;
            }
            setBookCollection(data.bookCollection);
        };
        // On startup, let the backend know that we want to know the current book collection.
        // (The backend could notify us automatically when the book collection changes,
        // but the collection being initialized would happen prior to this code in web-land being ready,
        // so we should explicitly request the collection the first time we're ready)
        window.bloomReaderLite.api
            .requestAsync({
                messageType: "get-book-collection",
            })
            .then(updateBookCollection);

        // Also subscribe to notifications whenever the book collection changes
        window.bloomReaderLite.api.subscribe(
            "book-collection-changed",
            updateBookCollection
        );

        // Cleanup
        return () => {
            console.info("Unsubscribing from book-collection-changed.");
            window.bloomReaderLite.api.unsubscribe(
                "book-collection-changed",
                updateBookCollection
            );
        };
    }, []);

    const onBookUnpacked = useCallback((bookIndexUrl: string) => {
        // The query params that come after the "?" in a bloomPlayer URL
        const queryParams: Record<string, string> = {
            url: bookIndexUrl,
            centerVertically: "true",
            showBackButton: "true",
            independent: "false",
            host: "bloomreaderlite",
        };
        // Additional params that might possibly be useful, or might not
        // &useOriginalPageSize=true&allowToggleAppBar=true&lang=en&hideFullScreenButton=false

        const queryParamsString = Object.entries(queryParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&");

        const readUri = `${BLOOM_PLAYER_PATH}?${queryParamsString}`;
        console.info("Read uri: " + readUri);

        window.location.href = readUri;
    }, []);

    const booksJsx = list.map((item) => {
        return (
            <div
                key={item.filepath}
                onClick={() => itemTouch(item)}
                // onContextMenu={(e) => {
                //     //     // TODO: Figure out longpress instead
                //     //   e.preventDefault(); // Prevent default context menu
                //     //   selectItem(item);
                // }}
            >
                {isShelf(item) ? (
                    <span>ShelfListItem is not implemented yet.</span>
                ) : (
                    // <span>BookListItem</span>
                    //   <ShelfListItem shelf={item} isSelected={selectedItem === item} />
                    <BookListItem
                        book={item}
                        isSelected={selectedItem === item}
                    />
                )}
            </div>
        );
    });

    // const host = "https://bloomlibrary.org";
    const host = "https://alpha.bloomlibrary.org";
    // const host = "https://dev-alpha.bloomlibrary.org";
    const libraryUrl = host + "/app-hosted-v1/langs";

    return (
        <div>
            <BloomReaderAppBar />
            {booksJsx}
            <br />
            <div>
                <Button
                    variant="outlined"
                    onClick={() => {
                        window.location.href = libraryUrl;
                    }}
                    css={css`
                        text-transform: unset; // Prevent MUI from making it all caps
                    `}
                    startIcon={<SearchIcon />}
                >
                    Get more books from our library
                </Button>
            </div>
        </div>
    );
};
