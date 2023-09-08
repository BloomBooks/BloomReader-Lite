import { FunctionComponent } from "react";
import { BookList } from "./BookList/BookList";

interface HomeProps {
    booksUrlRoot: string;
}

export const Home: FunctionComponent<HomeProps> = () => {
    return (
        <div>
            <BookList />
        </div>
    );
};
