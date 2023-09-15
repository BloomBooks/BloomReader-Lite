import { LogErrorMessage } from "./toBackend/bloomPlayerMessages";
import {
    ConsoleLogRequest,
    DeleteBookRequest,
    GetBookCollectionRequest,
    GetThumbnailRequest,
    UnpackZipFileRequest,
} from "./toBackend/requests";

export interface IBloomReaderLiteApi extends IBloomPlayerApi {
    consoleLog(request: ConsoleLogRequest): void;
    deleteBook(request: DeleteBookRequest): Promise<void>;
    getBookCollection(request: GetBookCollectionRequest): void;
    getThumbnail(request: GetThumbnailRequest): void;
    unpackZipFile(request: UnpackZipFileRequest): Promise<void>;
}

export interface IBloomPlayerApi {
    errorLog(data: LogErrorMessage): void;
}
