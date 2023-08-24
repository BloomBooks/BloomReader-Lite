import { IBloomReaderLiteApi } from "@shared-types/api";
import { LogErrorMessage } from "@shared-types/toBackend/bloomPlayerMessages";
import {
    ConsoleLogMessage,
    UnpackZipFileMessage,
} from "@shared-types/toBackend/bloomReaderWebMessages";
import { useContext } from "react";
import { BloomContext } from "../BloomContext";
import { useReplyToFrontend } from "../hooks/useReplyToFrontend";
import { BookCollection } from "../models/BookCollection";
import { safeOpenBookForReading } from "../storage/BookStorage";
import * as ErrorLog from "../util/ErrorLog";
import { findHtmFileAsync } from "../util/FileUtil";
import { WebviewUtil } from "../util/WebviewUtil";
import { IReplyToFrontEnd } from "./replyToFrontend";

export class Api implements IBloomReaderLiteApi {
    private bookCollection: BookCollection;
    private reply: IReplyToFrontEnd;

    public constructor(
        bookCollection: BookCollection,
        reply: IReplyToFrontEnd
    ) {
        this.bookCollection = bookCollection;
        this.reply = reply;
    }
    getBookCollection() {
        throw new Error("Method not implemented.");
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

export function useApi() {
    const bloomContext = useContext(BloomContext);

    const replyToFrontend = useReplyToFrontend();

    const api: IBloomReaderLiteApi = {
        consoleLog: function (data: ConsoleLogMessage) {
            try {
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
            } catch (e) {
                console.warn("consoleLog had an error.");
            }
        },
        getBookCollection: function () {
            replyToFrontend({
                messageType: "book-collection-changed",
                bookCollection: bloomContext.bookCollection,
            });
        },
        unpackZipFile: async function (data: UnpackZipFileMessage) {
            const filePath = data.zipFilePath;

            const unzippedBookFolder = await safeOpenBookForReading(filePath);
            const htmFilename = await findHtmFileAsync(unzippedBookFolder);
            console.info({ htmFilename });

            // When it didn't have the file:// protocol, it generated "network error"
            const htmUrl = `${unzippedBookFolder}/${encodeURIComponent(
                htmFilename
            )}`;
            replyToFrontend({
                messageType: "zip-file-unpacked",
                origZip: data.zipFilePath,
                indexPath: htmUrl,
            });
        },
        errorLog: function (data: LogErrorMessage) {
            ErrorLog.logError({
                logMessage: data.message,
            });
        },
    };

    return api;
}
