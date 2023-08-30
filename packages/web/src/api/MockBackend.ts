import { MessageToBackend } from "bloom-reader-lite-shared/dist/toBackend/messages";
import {
    GetBookCollectionRequest,
    GetThumbnailRequest,
} from "bloom-reader-lite-shared/dist/toBackend/requests";
import { FrontendApi } from "./Api";

/**
 * Makes local development (on a computer's browser) easier, independent of the backend.
 * Not necessary when you're testing in conjunction with a backend, and definitely don't call this function in production.
 */
export function installMockApi() {
    console.info("Adding mock API");

    window.addEventListener("message", messageHandler, false);
}

/**
 * This is a file where you can hack up / simulate whatever responses you want the backend to provide.
 */
class MockBackend {
    public getBookCollection(request: GetBookCollectionRequest) {
        const bookCollection = JSON.parse(
            `{"books":[{"filepath":"../mock-data/Books/The_Moon_and_the_Cap.bloompub","title":"The Moon and the Cap","allTitles":{"en":"        The Moon and the Cap","fr":"La lune et la casquette"},"tags":["topic:Story Book"],"features":[],"thumbPath":"../mock-data/Books/The_Moon_and_the_Cap/thumbnail.png","modifiedAt":1693406201.6894588,"brandingProjectName":"SIL-International","bloomdVersion":0}],"shelves":[]}`
        );

        toFrontend().respond({
            messageType: "get-book-collection-response",
            requestId: request.id,
            success: true,
            bookCollection,
        });
    }

    public async getThumbnail(request: GetThumbnailRequest) {
        const base64 = await MockBackend.getImageAsBase64(request.thumbPath);

        if (base64) {
            toFrontend().respond({
                messageType: "get-thumbnail-response",
                requestId: request.id,
                success: true,
                data: base64,
                format: "png",
            });
        } else {
            toFrontend().respond({
                messageType: "get-thumbnail-response",
                requestId: request.id,
                success: false,
                reason: "Couldn't read the specified image.",
            });
        }
    }

    private static async getImageAsBase64(
        imageUrl: string
    ): Promise<string | null> {
        // Remarks: This function is mostly written by ChatGPT
        const response = await fetch(imageUrl);

        const blob = await response.blob();
        const reader = new FileReader();

        return new Promise<string>((resolve, reject) => {
            reader.onload = () => {
                const base64Data = reader.result as string;
                const base64Image = base64Data.split(",")[1];
                resolve(base64Image);
            };

            reader.onerror = () => {
                reject(new Error("Error reading image data."));
            };

            reader.readAsDataURL(blob);
        });
    }
}

function toFrontend() {
    return (window.bloomReaderLite as any).toFrontend as FrontendApi;
}

const mockBackend = new MockBackend();

function messageHandler(event: MessageEvent) {
    if (event.origin !== window.location.origin) return;

    const data = JSON.parse(event.data) as MessageToBackend;
    console.info("[DEV] Got parsedData: " + data.messageType);

    switch (data.messageType) {
        case "get-book-collection":
            mockBackend.getBookCollection(data);
            break;
        case "get-thumbnail":
            mockBackend.getThumbnail(data);
            break;
        default:
            break;
    }
}
