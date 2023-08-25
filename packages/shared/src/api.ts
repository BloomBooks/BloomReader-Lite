import { LogErrorMessage } from "./toBackend/bloomPlayerMessages";
import {
    ConsoleLogMessage,
    UnpackZipFileMessage,
} from "./toBackend/bloomReaderWebMessages";

export interface IBloomReaderLiteApi extends IBloomPlayerApi {
    consoleLog(data: ConsoleLogMessage);
    getBookCollection();
    unpackZipFile(data: UnpackZipFileMessage): Promise<void>;
}

export interface IBloomPlayerApi {
    errorLog(data: LogErrorMessage);
}
