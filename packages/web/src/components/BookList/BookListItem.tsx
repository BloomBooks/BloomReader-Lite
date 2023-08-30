/** @jsxImportSource @emotion/react **/
import { css } from "@emotion/react";
import { Color } from "bloom-reader-lite-shared/dist/constants/Color";
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

    useEffect(() => {
        async function loadThumbnailAsync() {
            if (!props.book.thumbPath) {
                return;
            }

            const response = await window.bloomReaderLite.api.requestAsync({
                messageType: "get-thumbnail",
                thumbPath: props.book.thumbPath,
            });

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
            css={css`
                ${styles.container};
                ${props.isSelected ? styles.containerSelected : ""}
            `}
        >
            {thumbnail && (
                <img
                    src={`data:image/${thumbnail.format};base64,${thumbnail.data}`}
                    css={styles.thumbnail}
                />
            )}
            <div css={styles.titleContainer}>
                <span css={styles.title}>{displayName(book)}</span>
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

const styles = {
    container: css`
        display: flex;
        flex-direction: row;
        padding: 8px;
        background-color: white;
    `,
    containerSelected: css`
        background-color: ${Color.lightGray};
    `,
    titleContainer: css`
        display: flex;
        flex-direction: column;
        padding-left: 8px;
        flex: 1;
    `,
    title: css`
        font-size: 20px;
        margin-bottom: 4px;
        color: black;
        flex: 1;
        flex-wrap: wrap;
    `,
    thumbnail: css`
        width: 64px;
        height: 64px;
    `,
};

export default BookListItem;
