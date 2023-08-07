import { FunctionComponent } from "react";

interface BookReaderProps {
    bloomPubPath: string;
}

const BLOOM_PLAYER_PATH = `/bloom-player/bloomplayer.htm`;

export const BookReader: FunctionComponent<BookReaderProps> = () => {
    // The query params that come after the "?" in a bloomPlayer URL
    const bloomPlayerParams: Record<string, string> = {
        // url: props.bookHtmPath,
        url: "../mock-data/Books/The_Moon_and_the_Cap/The Moon and the Cap.htm",
        centerVertically: "true",
        showBackButton: "true",
        independent: "false",
        host: "bloomreaderlite",
    };
    // Additional params that might possibly be useful, or might not
    // &useOriginalPageSize=true&allowToggleAppBar=true&lang=en&hideFullScreenButton=false
    const queryParamsString = Object.entries(bloomPlayerParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

    const bloomPlayerUri = `${BLOOM_PLAYER_PATH}?${queryParamsString}`;
    console.log("Read uri: " + bloomPlayerUri);

    // const theme = useTheme();

    return (
        <>
            <div>
                <a href={bloomPlayerUri}>Book</a>
            </div>
            <div>
                <a href={"https://bloomlibrary.org"}>BLORG</a>
            </div>
        </>
    );
};
