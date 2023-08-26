// These represent the messages that the frontend is expecting to be notified about

import { BookCollection } from "../models/BookCollection";

export type MessageToFrontend = BookCollectionChangedMessage;

export type BookCollectionChangedMessage = {
    messageType: "book-collection-changed";
    bookCollection: BookCollection;
};
