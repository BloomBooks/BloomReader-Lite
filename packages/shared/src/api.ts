import { LogErrorMessage } from "./toBackend/bloomPlayerMessages";
import {
    ConsoleLogRequest,
    GetBookCollectionRequest,
    GetThumbnailRequest,
    UnpackZipFileRequest,
} from "./toBackend/requests";

export interface IBloomReaderLiteApi extends IBloomPlayerApi {
    consoleLog(request: ConsoleLogRequest);
    getBookCollection(request: GetBookCollectionRequest);
    getThumbnail(request: GetThumbnailRequest);
    unpackZipFile(request: UnpackZipFileRequest): Promise<void>;
}

export interface IBloomPlayerApi {
    errorLog(data: LogErrorMessage);
}
