import {
    Book,
    BookFeatures,
    displayName,
} from "bloom-reader-lite-shared/dist/models/BookOrShelf";
import React from "react";

export interface IProps {
    book: Book;
    isSelected: boolean;
}

export interface IState {
    thumbnail?: { format: string; data: string };
}

export default class BookListItem extends React.PureComponent<IProps, IState> {
    state: IState = {};

    async componentDidMount() {
        // TODO: Implement me
        // const thumbnail = await BookStorage.getThumbnail(this.props.book);
        // this.setState({ thumbnail: thumbnail });
    }

    render() {
        const book = this.props.book;
        return (
            <div
            // style={[
            //     styles.container,
            //     this.props.isSelected ? styles.containerSelected : {},
            // ]}
            >
                {this.state.thumbnail && (
                    <img
                        src={`data:image/${this.state.thumbnail.format};base64,${this.state.thumbnail.data}`}
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
                    {this.props.book.features.includes(
                        BookFeatures.talkingBook
                    ) && (
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
    }
}

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
