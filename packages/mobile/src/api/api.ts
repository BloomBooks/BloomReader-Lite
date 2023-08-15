import { IBloomReaderLiteApi } from "@shared-types/api";
import { LogErrorMessage } from "@shared-types/toBackend/bloomPlayerMessages";
import {
    ConsoleLogMessage,
    UnpackZipFileMessage,
} from "@shared-types/toBackend/bloomReaderWebMessages";
import { safeOpenBookForReading } from "../storage/BookStorage";
import * as ErrorLog from "../util/ErrorLog";
import { findHtmFileAsync } from "../util/FileUtil";
import { WebviewUtil } from "../util/WebviewUtil";
import { IReplyToFrontEnd } from "./replyToFrontend";

export class Api implements IBloomReaderLiteApi {
    private reply: IReplyToFrontEnd;
    public constructor(reply: IReplyToFrontEnd) {
        this.reply = reply;
    }
    public errorLog(data: LogErrorMessage) {
        ErrorLog.logError({
            logMessage: data.message,
        });
    }

    public consoleLog(data: ConsoleLogMessage) {
        if (data.optionalParams?.length) {
            WebviewUtil.log(
                data.logLevel,
                data.message,
                ...data.optionalParams,
                "[WEBVIEW]"
            );
        } else {
            WebviewUtil.log(data.logLevel, "[WEBVIEW]", data.message);
        }
    }

    public async unpackZipFile(data: UnpackZipFileMessage): Promise<void> {
        const filePath = data.zipFilePath;

        const unzippedBookFolder = await safeOpenBookForReading(filePath);
        const htmFilename = await findHtmFileAsync(unzippedBookFolder);
        console.info({ htmFilename });

        // When it didn't have the file:// protocol, it generated "network error"
        const htmUrl = `${unzippedBookFolder}/${encodeURIComponent(
            htmFilename
        )}`;
        this.reply({
            messageType: "zip-file-unpacked",
            origZip: data.zipFilePath,
            indexPath: htmUrl,
        });
    }
}
