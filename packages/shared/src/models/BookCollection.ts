import { Book, Shelf } from "./BookOrShelf";

export interface BookCollection {
    books: Book[];
    shelves: Shelf[];
}

export interface BookCollectionWithNewBook extends BookCollection {
    newBook?: Book;
}

export function emptyBookCollection(): BookCollection {
    return {
        books: [],
        shelves: [],
    };
}
