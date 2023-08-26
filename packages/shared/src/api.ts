import { LogErrorMessage } from "./toBackend/bloomPlayerMessages";
import {
    ConsoleLogMessage,
    GetThumbnailMessage,
    UnpackZipFileMessage,
} from "./toBackend/bloomReaderWebMessages";

export interface IBloomReaderLiteApi extends IBloomPlayerApi {
    consoleLog(data: ConsoleLogMessage);
    getBookCollection();
    getThumbnail(data: GetThumbnailMessage);
    unpackZipFile(data: UnpackZipFileMessage): Promise<void>;
}

export interface IBloomPlayerApi {
    errorLog(data: LogErrorMessage);
}
