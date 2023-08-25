// If you update this interface, increment COLLECTION_FORMAT_VERSION in BookCollection.ts
export interface Book {
    filepath: string; // Used as the unique identifier
    title: string;
    allTitles: { [localeName: string]: string };
    features: BookFeatures[];
    thumbPath?: string;
    modifiedAt: number;
    tags: string[];
}

// If you update this interface, increment COLLECTION_FORMAT_VERSION in BookCollection.ts
export interface Shelf {
    id: string; // Used as the unique identifier
    label: Array<{ [localeName: string]: string }>;
    color: string;
    filepath: string;
    modifiedAt: number;
    tags: string[];
}

export type BookOrShelf = Book | Shelf;

export enum BookFeatures {
    talkingBook = "talkingBook",
    blind = "blind",
    signLanguage = "signLanguage",
    motion = "motion",
    // Other possible unverified elements of meta.json.features:
    // quizzes = "quizzes",
    // otherInteractiveActivities = "other interactive activities"
}
