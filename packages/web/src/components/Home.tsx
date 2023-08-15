import { FunctionComponent } from "react";
import { BookReader } from "./BookReader";

interface HomeProps {
    booksUrlRoot: string;
}

export const Home: FunctionComponent<HomeProps> = (props) => {
    // TODO: You will need to ask the native layer what books are available somehow.
    const bookUrl =
        props.booksUrlRoot +
        "/The_Moon_and_the_Cap/The_Moon_and_the_Cap.bloompub";
    console.log({ bloomPubPath: bookUrl });
    return (
        <div>
            <BookReader bookUrl={bookUrl} />
            <br />
            <div>
                <a href={"https://bloomlibrary.org"}>BLORG</a>
            </div>
        </div>
    );
};
