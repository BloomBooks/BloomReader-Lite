import { IonButton } from "@ionic/react";
import { UnpackZipFileMessage } from "@shared-types/toBackend/bloomReaderWebMessages";
import { MessageToFrontend } from "@shared-types/toFrontend/messages";
import { FunctionComponent, useCallback, useEffect } from "react";

const BLOOM_PLAYER_PATH = `./bloom-player/bloomplayer.htm`;

// TODO: This class needs to be renamed.
export const BookList: FunctionComponent = () => {
    // const theme = useTheme();

    // // TODO: This is way too small in Landscape mode. not sure why.
    // const headerImageHeight =
    //     useHeaderHeight() - Constants.statusBarHeight - Spacing.Small;

    // const bloomContext = React.useContext(BloomContext);

    // const selectItem = (item: BookOrShelf) => {
    //     setSelectedItem(item);
    // };

    // const clearSelectedItem = () => {
    //     setSelectedItem(undefined);
    // };

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

    // const itemTouch = (item: BookOrShelf) => {
    //     if (selectedItem) clearSelectedItem();
    //     else isShelf(item) ? openShelf(item) : openBook(item);
    // };

    // const openBook = (book: Book) =>
    //     navigation.navigate("BookReader", {
    //         bookUrl: book.filepath,
    //     });

    // const openShelf = (shelf: Shelf) => {
    //     navigation.push("BookList", {
    //         shelf: shelf,
    //     });
    // };

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

    // const list = sortedListForShelf(
    //     route.params.shelf,
    //     bloomContext.bookCollection
    // );

    // useEffect(() => {
    //     window.bloomReaderLiteApi.send({
    //         messageType: "get-book-collection",
    //     });
    // }, []);

    // componentDidMount
    useEffect(() => {
        window.bloomReaderLiteApi.receive("book-collection-changed", (data) => {
            if (data.messageType !== "book-collection-changed") {
                return;
            }
            console.log(
                "I should update the bookCollection to this",
                data.bookCollection
            );
        });
        // On startup, let the backend know that we want to know the current book collection.
        // (The backend could notify us automatically when the book collection changes,
        // but the collection being initialized would happen prior to this code in web-land being ready,
        // so we should explicitly request the collection the first time we're ready)
        window.bloomReaderLiteApi.send({
            messageType: "get-book-collection",
        });
    }, []);

    const handleEvent = useCallback((data: MessageToFrontend) => {
        if (data.messageType !== "zip-file-unpacked") {
            return;
        }

        // The query params that come after the "?" in a bloomPlayer URL
        const queryParams: Record<string, string> = {
            url: data.indexPath,
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
        console.log("Read uri: " + readUri);

        window.location.href = readUri;
    }, []);

    useEffect(() => {
        window.bloomReaderLiteApi.receive("zip-file-unpacked", handleEvent);
    }, [handleEvent]);

    // TODO: Implement the real "list" assignment above.
    const list = ["Book Title 1"];
    const booksJsx = list.map((listItem) => {
        return (
            <IonButton
                onClick={() => {
                    // TODO: Generate zipFilePath programmatically
                    const messageEvent: UnpackZipFileMessage = {
                        messageType: "unpack-zip-file",
                        zipFilePath:
                            "file:///var/mobile/Containers/Data/Application/4982CF6E-DB2F-4B6C-B6A6-D71B67B24DE2/Documents/Books/The_Moon_and_the_Cap.bloompub",
                    };
                    window.bloomReaderLiteApi.send(messageEvent);
                }}
            >
                {listItem}
            </IonButton>
            // <div
            //     onClick={() => {
            //         // TODO: Generate zipFilePath programmatically
            //         const messageEvent: UnpackZipFileMessage = {
            //             messageType: "unpack-zip-file",
            //             zipFilePath:
            //                 "file:///var/mobile/Containers/Data/Application/4982CF6E-DB2F-4B6C-B6A6-D71B67B24DE2/Documents/Books/The_Moon_and_the_Cap.bloompub",
            //         };
            //         window.bloomReaderLiteApi.send(messageEvent);
            //     }}
            //     onContextMenu={(e) => {
            //         //     // TODO: Figure out longpress instead
            //         //   e.preventDefault(); // Prevent default context menu
            //         //   selectItem(item);
            //     }}
            // >
            //     {
            //         listItem /* {isShelf(item) ? (
            //   <ShelfListItem shelf={item} isSelected={selectedItem === item} />
            // ) : (
            //   <BookListItem book={item} isSelected={selectedItem === item} />
            // )} */
            //     }
            // </div>
        );
    });

    return (
        <div>
            {booksJsx}
            <br />
            <div>
                <a href={"https://bloomlibrary.org"}>BLORG</a>
            </div>
        </div>
    );
};
