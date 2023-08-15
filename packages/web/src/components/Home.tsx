import { FunctionComponent } from "react";
import { BookList } from "./BookList";

interface HomeProps {
    booksUrlRoot: string;
}

export const Home: FunctionComponent<HomeProps> = () => {
    // TODO: You will need to ask the native layer what books are available somehow.
    return (
        <div>
            <BookList />
        </div>
    );
};
