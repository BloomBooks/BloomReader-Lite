import { IBloomReaderLiteApi } from "@shared/api";
import { LogErrorMessage } from "@shared/toBackend/bloomPlayerMessages";
import {
    ConsoleLogRequest,
    GetBookCollectionRequest,
    GetThumbnailRequest,
    UnpackZipFileRequest,
} from "bloom-reader-lite-shared/dist/toBackend/requests";
import { useContext } from "react";
import { BloomContext } from "../BloomContext";
import {
    useNotifyFrontend,
    useRespondToFrontend,
} from "../hooks/toFrontendHooks";
import * as BookStorage from "../storage/BookStorage";
import { safeOpenBookForReading } from "../storage/BookStorage";
import * as ErrorLog from "../util/ErrorLog";
import { findHtmFileAsync } from "../util/FileUtil";
import { WebviewUtil } from "../util/WebviewUtil";

export function useApi() {
    const bloomContext = useContext(BloomContext);

    const notifyFrontend = useNotifyFrontend();
    const respondToFrontend = useRespondToFrontend();

    const api: IBloomReaderLiteApi = {
        consoleLog: (request: ConsoleLogRequest) => {
            try {
                if (request.optionalParams?.length) {
                    WebviewUtil.log(
                        request.logLevel,
                        request.message,
                        ...request.optionalParams,
                        "[WEBVIEW]"
                    );
                } else {
                    WebviewUtil.log(
                        request.logLevel,
                        "[WEBVIEW]",
                        request.message
                    );
                }
            } catch (e) {
                console.warn("consoleLog had an error.");
            }
        },
        getBookCollection: (request: GetBookCollectionRequest) => {
            respondToFrontend({
                messageType: "get-book-collection-response",
                success: true,
                requestId: request.id,
                bookCollection: bloomContext.bookCollection,
            });
        },
        getThumbnail: async (request: GetThumbnailRequest) => {
            const responseTemplate = {
                messageType: "get-thumbnail-response" as const,
                requestId: request.id,
            };
            try {
                const thumbnail = await BookStorage.getThumbnail(
                    request.thumbPath
                );
                if (thumbnail) {
                    const { data, format } = thumbnail;
                    respondToFrontend({
                        ...responseTemplate,
                        success: true,
                        data,
                        format,
                    });
                } else {
                    respondToFrontend({
                        ...responseTemplate,
                        success: false,
                        reason: "thumbPath was undefined.",
                    });
                }
            } catch (e) {
                let reason = "";
                try {
                    reason = JSON.stringify(e);
                } catch {}

                respondToFrontend({
                    ...responseTemplate,
                    success: false,
                    reason,
                });
            }
        },
        unpackZipFile: async (request: UnpackZipFileRequest) => {
            const filePath = request.zipFilePath;

            const unzippedBookFolder = await safeOpenBookForReading(filePath);
            const htmFilename = await findHtmFileAsync(unzippedBookFolder);
            console.log({ htmFilename });

            // When it didn't have the file:// protocol, it generated "network error"
            const htmUrl = `${unzippedBookFolder}/${encodeURIComponent(
                htmFilename
            )}`;
            respondToFrontend({
                messageType: "unpack-zip-file-response",
                requestId: request.id,
                success: true,
                origZip: request.zipFilePath,
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
