import { IBloomReaderLiteApi } from "@shared/api";
import { BookCollection } from "@shared/models/BookCollection";
import { LogErrorMessage } from "@shared/toBackend/bloomPlayerMessages";
import {
    ConsoleLogMessage,
    GetThumbnailMessage,
    UnpackZipFileMessage,
} from "@shared/toBackend/bloomReaderWebMessages";
import { useContext } from "react";
import { BloomContext } from "../BloomContext";
import {
    useReplyToFrontend,
    useReplyToFrontend2,
} from "../hooks/useReplyToFrontend";
import * as BookStorage from "../storage/BookStorage";
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
    getThumbnail(data: GetThumbnailMessage) {
        throw new Error("Method not implemented.");
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
    const replyToFrontend2 = useReplyToFrontend2();

    const api: IBloomReaderLiteApi = {
        consoleLog: (data: ConsoleLogMessage) => {
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
        getBookCollection: () => {
            replyToFrontend({
                messageType: "book-collection-changed",
                bookCollection: bloomContext.bookCollection,
            });
        },
        getThumbnail: async (request: GetThumbnailMessage) => {
            console.log("Received request from " + request.id);
            const responseTemplate = {
                messageType: "get-thumbnail-response" as const,
                requestId: request.id,
            };
            const thumbnail = await BookStorage.getThumbnail(request.thumbPath);
            if (thumbnail) {
                const { data, format } = thumbnail;
                replyToFrontend2({
                    ...responseTemplate,
                    success: true,
                    data,
                    format,
                });
            } else {
                replyToFrontend2({
                    ...responseTemplate,
                    success: false,
                    reason: "thumbPath was undefined.",
                });
            }
        },
        unpackZipFile: async (data: UnpackZipFileMessage) => {
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
        errorLog: (data: LogErrorMessage) => {
            ErrorLog.logError({
                logMessage: data.message,
            });
        },
    };

    return api;
}
