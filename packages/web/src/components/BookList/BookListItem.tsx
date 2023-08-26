import {
    Book,
    BookFeatures,
    displayName,
} from "bloom-reader-lite-shared/dist/models/BookOrShelf";
import { FunctionComponent, useEffect, useState } from "react";

export interface IProps {
    book: Book;
    isSelected: boolean;
}

interface IThumbnail {
    format: string;
    data: string;
}

// export default class BookListItem extends React.PureComponent<IProps, IState> {
export const BookListItem: FunctionComponent<IProps> = (props) => {
    const [thumbnail, setThumbnail] = useState<IThumbnail | undefined>();

    // componentDidMount
    useEffect(() => {
        async function loadThumbnailAsync() {
            if (!props.book.thumbPath) {
                return;
            }

            const response = await window.bloomReaderLiteApi.sendToBackendAsync(
                {
                    messageType: "get-thumbnail",
                    thumbPath: props.book.thumbPath,
                }
            );

            // Paranoia check
            if (response.messageType !== "get-thumbnail-response") {
                return;
            }

            if (response.success) {
                const { data, format } = response;
                setThumbnail({ data, format });
            } else {
                // TODO: I guess you could set it to a placeholder error image
                console.warn(
                    `Thumbnail "${props.book.thumbPath}" not found. Reason: ${response.reason}`
                );
            }
        }

        loadThumbnailAsync();
    }, [props.book.thumbPath]);

    const book = props.book;

    return (
        <div
        // style={[
        //     styles.container,
        //     this.props.isSelected ? styles.containerSelected : {},
        // ]}
        >
            {thumbnail && (
                <img
                    src={`data:image/${thumbnail.format};base64,${thumbnail.data}`}
                />
                // <Image
                //     style={styles.thumbnail}
                //     source={{
                //         uri: `data:image/${this.state.thumbnail.format};base64,${this.state.thumbnail.data}`,
                //     }}
                // />
            )}
            <div /*style={styles.titleContainer}*/>
                <span /*style={styles.title}*/>{displayName(book)}</span>
                {props.book.features.includes(BookFeatures.talkingBook) && (
                    <span>Talking Book</span>
                    // TODO: IMPLEMENT ME
                    // <Icon
                    //     name="md-volume-high"
                    //     color={ThemeColors.speakerIcon}
                    // />
                )}
            </div>
        </div>
    );
};

// export const styles = StyleSheet.create({
//     container: {
//         flexDirection: "row",
//         padding: 8,
//         backgroundColor: "white",
//     },
//     containerSelected: {
//         backgroundColor: ThemeColors.lightGray,
//     },
//     titleContainer: {
//         flexDirection: "column",
//         paddingLeft: 8,
//         flex: 1,
//     },
//     title: {
//         fontSize: 20,
//         marginBottom: 4,
//         color: "black",
//         flex: 1,
//         flexWrap: "wrap",
//     },
//     thumbnail: {
//         width: 64,
//         height: 64,
//     },
// });

export default BookListItem;
