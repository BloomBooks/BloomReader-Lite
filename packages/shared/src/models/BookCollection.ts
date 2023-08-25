import { Book, Shelf } from "./BookOrShelf";

export interface BookCollection {
    books: Book[];
    shelves: Shelf[];
}
